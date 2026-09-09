#!/usr/bin/env node
/**
 * Build signed release APKs for PORTER, RUNR, and VENDR.
 * Bundles the Next.js static export inside the Capacitor shell (no remote URL).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sdkRoot = process.env.ANDROID_HOME || path.join(os.homedir(), 'android-sdk');
const javaHome =
  process.env.JAVA_HOME ||
  (existsSync('/usr/lib/jvm/java-21-openjdk-amd64')
    ? '/usr/lib/jvm/java-21-openjdk-amd64'
    : undefined);

const apps = [
  { id: 'porter', workspace: '@runr/porter', packageId: 'com.runr.porter', name: 'PORTER' },
  { id: 'runr', workspace: '@runr/runr-app', packageId: 'com.runr.runr', name: 'RUNR' },
  { id: 'vendr', workspace: '@runr/vendr', packageId: 'com.runr.vendr', name: 'VENDR' },
  { id: 'staff', workspace: '@runr/staff', packageId: 'com.runr.staff', name: 'STAFF' },
];

function env() {
  return {
    ...process.env,
    ANDROID_HOME: sdkRoot,
    ANDROID_SDK_ROOT: sdkRoot,
    JAVA_HOME: javaHome || process.env.JAVA_HOME,
    PATH: [
      path.join(sdkRoot, 'cmdline-tools', 'latest', 'bin'),
      path.join(sdkRoot, 'platform-tools'),
      javaHome ? path.join(javaHome, 'bin') : '',
      process.env.PATH,
    ]
      .filter(Boolean)
      .join(path.delimiter),
  };
}

function run(cmd, args, opts = {}) {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, { stdio: 'inherit', env: env(), ...opts });
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${cmd} ${args.join(' ')}`);
  }
}

async function download(url, dest) {
  await mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  await pipeline(res.body, createWriteStream(dest));
}

async function ensureSdk() {
  const sdkmanager = path.join(sdkRoot, 'cmdline-tools', 'latest', 'bin', 'sdkmanager');
  if (!existsSync(sdkmanager)) {
    console.log('Installing Android cmdline-tools…');
    const zip = path.join(os.tmpdir(), 'cmdtools.zip');
    await download(
      'https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip',
      zip
    );
    const extract = path.join(os.tmpdir(), `cmdtools-${Date.now()}`);
    run('unzip', ['-q', '-o', zip, '-d', extract]);
    await mkdir(path.join(sdkRoot, 'cmdline-tools'), { recursive: true });
    run('mv', [path.join(extract, 'cmdline-tools'), path.join(sdkRoot, 'cmdline-tools', 'latest')]);
  }
  run(sdkmanager, [
    '--sdk_root=' + sdkRoot,
    'platform-tools',
    'platforms;android-35',
    'build-tools;35.0.0',
    'build-tools;34.0.0',
  ]);
  run('bash', ['-c', `yes | ${sdkmanager} --sdk_root=${sdkRoot} --licenses`]);
}

async function versionForApp(appId) {
  const pkgPath = path.join(root, 'apps', appId, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  return pkg.version || '0.1.0';
}

function versionCodeFromSemver(version) {
  const parts = String(version).split('.').map((n) => Number.parseInt(n, 10) || 0);
  const major = parts[0] || 0;
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;
  return major * 10000 + minor * 100 + patch;
}

async function ensureSigning(appId) {
  const androidRoot = path.join(root, 'apps', appId, 'android');
  const keystore = path.join(androidRoot, `${appId}-release.keystore`);
  const buildGradle = path.join(androidRoot, 'app/build.gradle');

  if (!existsSync(keystore)) {
    run('keytool', [
      '-genkeypair',
      '-v',
      '-keystore',
      keystore,
      '-alias',
      appId,
      '-keyalg',
      'RSA',
      '-keysize',
      '2048',
      '-validity',
      '10000',
      '-storepass',
      `mbc${appId}`,
      '-keypass',
      `mbc${appId}`,
      '-dname',
      `CN=${appId}, OU=MBC, O=The Markk Brandon Collective, L=Sacramento, ST=CA, C=US`,
    ]);
  }

  let gradle = await readFile(buildGradle, 'utf8');
  if (!gradle.includes('signingConfigs')) {
    gradle = gradle.replace(
      'android {',
      `android {
    signingConfigs {
        release {
            storeFile file('../${appId}-release.keystore')
            storePassword 'mbc${appId}'
            keyAlias '${appId}'
            keyPassword 'mbc${appId}'
        }
    }`
    );
    gradle = gradle.replace(
      /buildTypes \{\s*release \{/,
      `buildTypes {
        release {
            signingConfig signingConfigs.release`
    );
  }

  await writeFile(buildGradle, gradle);
}

async function patchVersion(appId, version) {
  const buildGradle = path.join(root, 'apps', appId, 'android/app/build.gradle');
  let gradle = await readFile(buildGradle, 'utf8');
  const versionCode = versionCodeFromSemver(version);
  gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  gradle = gradle.replace(/versionName\s+"[^"]*"/, `versionName "${version}"`);
  await writeFile(buildGradle, gradle);
}

async function buildApp(app) {
  const version = await versionForApp(app.id);
  await patchVersion(app.id, version);
  await ensureSigning(app.id);
  run('npm', ['run', 'cap:sync', '-w', app.workspace], { cwd: root });

  const gradlew = path.join(root, 'apps', app.id, 'android/gradlew');
  run(gradlew, ['assembleRelease'], { cwd: path.join(root, 'apps', app.id, 'android') });

  const candidates = [
    path.join(root, 'apps', app.id, 'android/app/build/outputs/apk/release/app-release.apk'),
    path.join(root, 'apps', app.id, 'android/app/build/outputs/apk/release/app-release-unsigned.apk'),
  ];
  const apkSrc = candidates.find((candidate) => existsSync(candidate));
  if (!apkSrc) {
    throw new Error(`Release APK not found after build for ${app.id}`);
  }
  return { ...app, version, apkSrc };
}

await ensureSdk();
const built = [];
for (const app of apps) {
  console.log(`\n=== Building ${app.name} (signed release) ===`);
  built.push(await buildApp(app));
}

console.log('\nBuilt release APKs:');
for (const app of built) {
  console.log(`  ${app.id}: ${app.apkSrc}`);
}
