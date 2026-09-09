#!/usr/bin/env bash
# Publish RUNR platform APKs to GitHub Releases (one tag per app version).
set -euo pipefail
cd "$(dirname "$0")/.."
REPO="TheMarkkBradonCollective/Runr"

if ! command -v gh >/dev/null; then
  echo "gh CLI required"
  exit 1
fi

if ! gh repo view "$REPO" &>/dev/null; then
  echo "Repository $REPO not found"
  exit 1
fi

node scripts/publish-apk.mjs

publish_app() {
  local app="$1"
  local version
  version=$(node -p "require('./apps/${app}/package.json').version")
  local tag="v${version}-${app}"
  local apk="release/${app}-v${version}.apk"
  local title
  case "$app" in
    porter) title="PORTER v${version}" ;;
    runr) title="RUNR v${version}" ;;
    vendr) title="VENDR v${version}" ;;
    *) title="${app} v${version}" ;;
  esac

  if [[ ! -f "$apk" ]]; then
    echo "Missing $apk"
    exit 1
  fi

  if gh release view "$tag" --repo "$REPO" &>/dev/null; then
    gh release delete "$tag" --repo "$REPO" --yes
  fi

  gh release create "$tag" \
    --repo "$REPO" \
    --title "$title" \
    --notes "${title} — Full Capacitor build with embedded web shell. No external website required." \
    "$apk#${app}-v${version}.apk"

  echo "Published $tag → https://github.com/$REPO/releases/tag/$tag"
}

for app in porter runr vendr; do
  publish_app "$app"
done

# Platform umbrella release (primary catalog tag)
platform_version=$(node -p "require('./apps/runr/package.json').version")
platform_tag="v${platform_version}"
platform_apk="release/runr-v${platform_version}.apk"

if gh release view "$platform_tag" --repo "$REPO" &>/dev/null; then
  gh release delete "$platform_tag" --repo "$REPO" --yes
fi

gh release create "$platform_tag" \
  --repo "$REPO" \
  --title "RUNR Platform v${platform_version}" \
  --notes "RUNR Platform v${platform_version} — signed Capacitor APKs with bundled UI for PORTER, RUNR, and VENDR." \
  release/porter-v"${platform_version}".apk#porter-v"${platform_version}".apk \
  release/runr-v"${platform_version}".apk#runr-v"${platform_version}".apk \
  release/vendr-v"${platform_version}".apk#vendr-v"${platform_version}".apk

zip_path="release/runr-apps-apks.zip"
rm -f "$zip_path" "release/runr-apps-apks-v${platform_version}.zip"
(cd release && zip -j "runr-apps-apks.zip" \
  "porter-v${platform_version}.apk" \
  "runr-v${platform_version}.apk" \
  "vendr-v${platform_version}.apk")
gh release upload "$platform_tag" --repo "$REPO" "$zip_path" --clobber

echo "Published platform release $platform_tag (includes runr-apps-apks.zip)"
