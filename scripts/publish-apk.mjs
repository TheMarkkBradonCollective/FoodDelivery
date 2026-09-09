#!/usr/bin/env node
/**
 * Publish signed release APKs to release/ and write version.json for MBC App Store sync.
 *
 * Usage:
 *   npm run publish:apk
 *   npm run publish:apk -- --app runr
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const releaseDir = join(root, 'release');
const args = process.argv.slice(2);
const GITHUB_REPO = 'TheMarkkBradonCollective/Runr';
const MBC_PUBLIC_BASE = 'https://themarkkbradoncollective.github.io/main/apks';

const apps = [
  {
    id: 'porter',
    name: 'PORTER',
    packageId: 'com.runr.porter',
    tagline: 'Get what you need.',
  },
  {
    id: 'runr',
    name: 'RUNR',
    packageId: 'com.runr.runr',
    tagline: 'Pick it up. Run it there.',
  },
  {
    id: 'vendr',
    name: 'VENDR',
    packageId: 'com.runr.vendr',
    tagline: 'Sell. Manage. Grow.',
  },
];

function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function readVersion(appId) {
  const pkg = JSON.parse(readFileSync(join(root, 'apps', appId, 'package.json'), 'utf8'));
  return pkg.version || '0.1.0';
}

function versionCodeFromSemver(version) {
  const parts = String(version).split('.').map((n) => Number.parseInt(n, 10) || 0);
  const major = parts[0] || 0;
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;
  return major * 10000 + minor * 100 + patch;
}

function githubReleaseUrl(appId, version) {
  // Public MBC App Store mirror (works without GitHub auth). Run sync on main after each release.
  return `${MBC_PUBLIC_BASE}/${appId}/${appId}-v${version}.apk`;
}

function githubReleaseFallbackUrl(appId, version) {
  return `https://github.com/${GITHUB_REPO}/releases/download/v${version}/${appId}-v${version}.apk`;
}

function resolveApkSrc(appId) {
  const idx = args.indexOf('--apk');
  if (idx >= 0 && args[idx + 1]) return args[idx + 1];
  const candidates = [
    join(releaseDir, `${appId}-v${readVersion(appId)}.apk`),
    join(root, 'apps', appId, 'android/app/build/outputs/apk/release/app-release.apk'),
    join(root, 'apps', appId, 'android/app/build/outputs/apk/release/app-release-unsigned.apk'),
    join(root, 'apps', appId, 'android/app/build/outputs/apk/debug/app-debug.apk'),
  ];
  return candidates.find((p) => existsSync(p));
}

function publishOne(app) {
  const version = readVersion(app.id);
  const versionCode = versionCodeFromSemver(version);
  const apkSrc = resolveApkSrc(app.id);
  if (!apkSrc) {
    console.error(`No APK for ${app.id}. Run: npm run build:apks`);
    process.exit(1);
  }

  mkdirSync(releaseDir, { recursive: true });
  const releaseName = `${app.id}-v${version}.apk`;
  const releasePath = join(releaseDir, releaseName);
  copyFileSync(apkSrc, releasePath);

  const fileSize = statSync(releasePath).size;
  const sha256 = sha256File(releasePath);
  if (fileSize < 50_000) {
    console.error(`APK too small (${fileSize} bytes): ${releasePath}`);
    process.exit(1);
  }

  const downloadUrl = githubReleaseUrl(app.id, version);

  return {
    id: app.id,
    name: app.name,
    packageId: app.packageId,
    tagline: app.tagline,
    version,
    versionCode,
    releaseName,
    releasePath,
    fileSize,
    sha256,
    url: downloadUrl,
    downloadName: releaseName,
    releaseNotes: `${app.name} v${version} — ${app.tagline} Full Capacitor build with embedded web shell.`,
  };
}

const selected = args.includes('--app')
  ? apps.filter((app) => app.id === args[args.indexOf('--app') + 1])
  : apps;

const published = selected.map(publishOne);
const primary = published.find((app) => app.id === 'runr') || published[0];
const archives = published
  .filter((app) => app.id !== primary.id)
  .map((app) => ({
    label: app.name,
    version: app.version,
    versionCode: app.versionCode,
    url: app.url,
    downloadName: app.downloadName,
    fileSize: app.fileSize,
    sha256: app.sha256,
    releaseNotes: app.releaseNotes,
    packageId: app.packageId,
  }));

const versionJson = {
  name: 'RUNR Platform',
  app: primary.name,
  version: primary.version,
  updatedAt: new Date().toISOString(),
  apk: {
    ready: true,
    packageId: primary.packageId,
    name: primary.name,
    label: `${primary.name} v${primary.version}`,
    version: primary.version,
    versionCode: primary.versionCode,
    url: primary.url,
    downloadName: primary.downloadName,
    fileSize: primary.fileSize,
    sha256: primary.sha256,
    releaseNotes: primary.releaseNotes,
    archives,
  },
  apps: published.map((app) => ({
    id: app.id,
    name: app.name,
    packageId: app.packageId,
    version: app.version,
    url: app.url,
    downloadName: app.downloadName,
    fileSize: app.fileSize,
    sha256: app.sha256,
  })),
};

writeFileSync(join(root, 'version.json'), `${JSON.stringify(versionJson, null, 2)}\n`);

for (const app of published) {
  console.log(`Published ${app.releaseName} (${app.fileSize} bytes)`);
  console.log(`  url=${app.url}`);
  console.log(`  sha256=${app.sha256}`);
}
console.log(`\nversion.json apk.ready=true (primary: ${primary.name} v${primary.version})`);
