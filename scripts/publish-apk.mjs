#!/usr/bin/env node
/**
 * Publish built APKs to release/ and write version.json for MBC App Store sync.
 *
 * Usage:
 *   node scripts/publish-apk.mjs
 *   node scripts/publish-apk.mjs --app runr
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const releaseDir = join(root, 'release');
const args = process.argv.slice(2);

const apps = [
  {
    id: 'porter',
    name: 'PORTER',
    packageId: 'com.runr.porter',
    tagline: 'Get what you need.',
    color: '#2563eb',
  },
  {
    id: 'runr',
    name: 'RUNR',
    packageId: 'com.runr.runr',
    tagline: 'Pick it up. Run it there.',
    color: '#ff4f00',
  },
  {
    id: 'vendr',
    name: 'VENDR',
    packageId: 'com.runr.vendr',
    tagline: 'Sell. Manage. Grow.',
    color: '#059669',
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

function resolveApkSrc(appId) {
  const idx = args.indexOf('--apk');
  if (idx >= 0 && args[idx + 1]) return args[idx + 1];
  const candidates = [
    join(releaseDir, `${appId}-v${readVersion(appId)}.apk`),
    join(root, 'apps', appId, 'android/app/build/outputs/apk/debug/app-debug.apk'),
    join(root, 'apps', appId, 'android/app/build/outputs/apk/release/app-release.apk'),
    join(root, 'apps', appId, 'android/app/build/outputs/apk/release/app-release-unsigned.apk'),
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

  return {
    id: app.id,
    name: app.name,
    packageId: app.packageId,
    tagline: app.tagline,
    color: app.color,
    version,
    versionCode,
    releaseName,
    releasePath,
    fileSize,
    sha256,
    url: `release/${releaseName}`,
    downloadName: releaseName,
    releaseNotes: `${app.name} v${version} — ${app.tagline} Coverage-driven delivery marketplace app.`,
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
  console.log(`  sha256=${app.sha256}`);
}
console.log(`\nversion.json apk.ready=true (primary: ${primary.name} v${primary.version})`);
