#!/usr/bin/env node
/**
 * Publish Porter platform APKs to the public MBC App Store repo (TheMarkkBradonCollective/main).
 *
 * Requires a GitHub token with push access to main:
 *   GITHUB_TOKEN=ghp_... npm run sync:mbc-catalog
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { latestApkPath, releaseRoot, versionedApkPath } from './apk-paths.mjs';

const root = join(import.meta.dirname, '..');
const MAIN_REPO = 'TheMarkkBradonCollective/main';
const MBC_PUBLIC_BASE = 'https://themarkkbradoncollective.github.io/main/apks';

const apps = [
  { id: 'fastfood', name: 'FastFood', tagline: 'Hot food. Fast drop.', packageId: 'com.porter.fastfood' },
  { id: 'porter', name: 'Porter', tagline: 'Shop nearby. Track every step.', packageId: 'com.porter.porter' },
  { id: 'runr', name: 'Porter Runner', tagline: 'Choose your window. Earn per drop.', packageId: 'com.porter.runner' },
  { id: 'vendr', name: 'Porter Vendor', tagline: 'Set capacity. Serve your queue.', packageId: 'com.porter.vendor' },
  { id: 'staff', name: 'Porter Command', tagline: 'Operate the network.', packageId: 'com.porter.command' },
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
  return (parts[0] || 0) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
}

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

const token = process.env.GITHUB_TOKEN || process.env.MBC_MAIN_REPO_TOKEN;
if (!token) {
  console.error('Set GITHUB_TOKEN (or MBC_MAIN_REPO_TOKEN) with push access to', MAIN_REPO);
  process.exit(1);
}

const version = readVersion('runr');
const published = apps.map((app) => {
  const appVersion = readVersion(app.id);
  const apkName = `${app.id}-v${appVersion}.apk`;
  const apkPath = versionedApkPath(app.id, appVersion);
  if (!existsSync(apkPath)) {
    console.error(`Missing ${apkPath}. Run: npm run publish:apk`);
    process.exit(1);
  }
  const fileSize = readFileSync(apkPath).length;
  const sha256 = sha256File(apkPath);
  return {
    ...app,
    version: appVersion,
    versionCode: versionCodeFromSemver(appVersion),
    apkName,
    apkPath,
    fileSize,
    sha256,
    downloadUrl: `apks/${app.id}/${apkName}`,
  };
});

const zipName = 'porter-platform-apks.zip';
const zipPath = join(releaseRoot(), 'latest', zipName);
if (!existsSync(zipPath)) {
  const apkList = apps.map((a) => `"${versionedApkPath(a.id, readVersion(a.id))}"`).join(' ');
  run(`zip -j "${zipPath}" ${apkList}`, root);
}

const workDir = mkdtempSync(join(tmpdir(), 'mbc-sync-'));
const cloneUrl = `https://x-access-token:${token}@github.com/${MAIN_REPO}.git`;

try {
  run(`git clone --depth 1 "${cloneUrl}" repo`, workDir);
  const repoDir = join(workDir, 'repo');

  for (const app of published) {
    const destDir = join(repoDir, 'apks', app.id);
    mkdirSync(destDir, { recursive: true });
    copyFileSync(app.apkPath, join(destDir, app.apkName));
  }

  mkdirSync(join(repoDir, 'apks', 'porter-platform'), { recursive: true });
  copyFileSync(zipPath, join(repoDir, 'apks', 'porter-platform', zipName));

  for (const app of published) {
    const iconSrc = join(root, 'apps', 'website', 'public', 'icons', 'apps', `${app.id}.png`);
    if (existsSync(iconSrc)) {
      mkdirSync(join(repoDir, 'icons', 'apps'), { recursive: true });
      copyFileSync(iconSrc, join(repoDir, 'icons', 'apps', `${app.id}.png`));
    }
  }

  const catalogPath = join(repoDir, 'apk-catalog.json');
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  catalog.generatedAt = new Date().toISOString();

  for (const app of published) {
    const entry = {
      slug: app.id,
      name: app.name,
      tagline: app.tagline,
      section: 'marketplace',
      webUrl: 'https://github.com/TheMarkkBradonCollective/Runr',
      icon: `icons/apps/${app.id}.png`,
      webVersion: app.version,
      android: {
        status: 'available',
        version: app.version,
        versionCode: app.versionCode,
        downloadUrl: app.downloadUrl,
        downloadName: app.apkName,
        fileSize: app.fileSize,
        sha256: app.sha256,
        releaseNotes: `${app.name} v${app.version} — Porter blue branding, Supabase auth, unified logos.`,
        packageId: app.packageId,
        source: 'github-mirror',
        archives: [],
      },
    };

    const idx = catalog.apps.findIndex((item) => item.slug === app.id);
    if (idx >= 0) catalog.apps[idx] = entry;
    else catalog.apps.push(entry);
  }

  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  writeFileSync(join(repoDir, 'public', 'apk-catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);

  run('git add apk-catalog.json public/apk-catalog.json apks icons/apps/porter.png icons/apps/runr.png icons/apps/vendr.png', repoDir);
  run(`git commit -m "Publish Porter platform v${version} APKs to public catalog"`, repoDir);
  run('git push origin main', repoDir);

  console.log('\nPublished to MBC App Store. Verify:');
  for (const app of published) {
    console.log(`  ${app.name}: ${MBC_PUBLIC_BASE}/${app.id}/${app.apkName}`);
  }
  console.log(`  Zip: ${MBC_PUBLIC_BASE}/porter-platform/${zipName}`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
