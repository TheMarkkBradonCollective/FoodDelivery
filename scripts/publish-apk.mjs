#!/usr/bin/env node
/**
 * Publish signed release APKs to release/apks/<app>/ and release/latest/, then version.json.
 *
 * Usage:
 *   npm run publish:apk
 *   npm run publish:apk -- --app runr
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { latestApkPath, releaseRoot, resolveBuiltApk, versionedApkPath } from './apk-paths.mjs';

const root = join(import.meta.dirname, '..');
const args = process.argv.slice(2);
const GITHUB_REPO = 'TheMarkkBradonCollective/Runr';
const MBC_PUBLIC_BASE = 'https://themarkkbradoncollective.github.io/main/apks';

const apps = [
  {
    id: 'fastfood',
    name: 'FastFood',
    packageId: 'com.porter.fastfood',
    tagline: 'Hot food. Fast drop.',
  },
  {
    id: 'porter',
    name: 'Porter',
    packageId: 'com.porter.porter',
    tagline: 'Shop nearby. Track every step.',
  },
  {
    id: 'runr',
    name: 'Porter Runner',
    packageId: 'com.porter.runner',
    tagline: 'Choose your window. Earn per drop.',
  },
  {
    id: 'vendr',
    name: 'Porter Vendor',
    packageId: 'com.porter.vendor',
    tagline: 'Set capacity. Serve your queue.',
  },
  {
    id: 'staff',
    name: 'Porter Command',
    packageId: 'com.porter.command',
    tagline: 'Operate the network.',
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
  return resolveBuiltApk(appId, readVersion(appId));
}

function publishOne(app) {
  const version = readVersion(app.id);
  const versionCode = versionCodeFromSemver(version);
  const apkSrc = resolveApkSrc(app.id);
  if (!apkSrc) {
    console.error(`No APK for ${app.id}. Run: npm run build:apks`);
    process.exit(1);
  }

  const releaseName = `${app.id}-v${version}.apk`;
  const releasePath = versionedApkPath(app.id, version);
  const latestPath = latestApkPath(app.id);
  mkdirSync(join(releaseRoot(), 'apks', app.id), { recursive: true });
  mkdirSync(join(releaseRoot(), 'latest'), { recursive: true });
  copyFileSync(apkSrc, releasePath);
  copyFileSync(apkSrc, latestPath);

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
  name: 'Porter',
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
  console.log(`  versioned=${app.releasePath}`);
  console.log(`  latest=${latestApkPath(app.id)}`);
  console.log(`  url=${app.url}`);
  console.log(`  sha256=${app.sha256}`);
}
console.log(`\nversion.json apk.ready=true (primary: ${primary.name} v${primary.version})`);
