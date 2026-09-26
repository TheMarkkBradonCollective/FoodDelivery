import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

/** Versioned APK: release/apks/{appId}/{appId}-v{version}.apk */
export function versionedApkPath(appId, version) {
  return join(root, 'release', 'apks', appId, `${appId}-v${version}.apk`);
}

/** Current build alias: release/latest/{appId}.apk */
export function latestApkPath(appId) {
  return join(root, 'release', 'latest', `${appId}.apk`);
}

export function releaseRoot() {
  return join(root, 'release');
}

export function resolveBuiltApk(appId, version) {
  const candidates = [
    versionedApkPath(appId, version),
    latestApkPath(appId),
    join(releaseRoot(), `${appId}-v${version}.apk`),
    join(root, 'apps', appId, 'android/app/build/outputs/apk/release/app-release.apk'),
    join(root, 'apps', appId, 'android/app/build/outputs/apk/release/app-release-unsigned.apk'),
    join(root, 'apps', appId, 'android/app/build/outputs/apk/debug/app-debug.apk'),
  ];
  return candidates.find((p) => existsSync(p));
}
