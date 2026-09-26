#!/usr/bin/env bash
# Publish Porter platform APKs to GitHub Releases (one tag per app version).
set -euo pipefail
cd "$(dirname "$0")/.."
REPO="TheMarkkBradonCollective/Runr"
ROOT="$PWD"

apk_path() {
  local app="$1"
  local version
  version=$(node -p "require('./apps/${app}/package.json').version")
  echo "${ROOT}/release/apks/${app}/${app}-v${version}.apk"
}

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
  local apk
  apk=$(apk_path "$app")
  local title
  case "$app" in
    fastfood) title="FastFood v${version}" ;;
    porter) title="Porter v${version}" ;;
    runr) title="Porter Runner v${version}" ;;
    vendr) title="Porter Vendor v${version}" ;;
    staff) title="Porter Command v${version}" ;;
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

for app in fastfood porter runr vendr staff; do
  publish_app "$app"
done

platform_version=$(node -p "require('./apps/runr/package.json').version")
platform_tag="v${platform_version}"

if gh release view "$platform_tag" --repo "$REPO" &>/dev/null; then
  gh release delete "$platform_tag" --repo "$REPO" --yes
fi

gh release create "$platform_tag" \
  --repo "$REPO" \
  --title "Porter v${platform_version}" \
  --notes "Porter v${platform_version} — signed Capacitor APKs for Porter, Porter Runner, Porter Vendor, Porter Command, and FastFood." \
  "$(apk_path fastfood)#fastfood-v${platform_version}.apk" \
  "$(apk_path porter)#porter-v${platform_version}.apk" \
  "$(apk_path runr)#runr-v${platform_version}.apk" \
  "$(apk_path vendr)#vendr-v${platform_version}.apk" \
  "$(apk_path staff)#staff-v${platform_version}.apk"

zip_path="${ROOT}/release/latest/porter-platform-apks.zip"
rm -f "$zip_path"
zip -j "$zip_path" \
  "$(apk_path fastfood)" \
  "$(apk_path porter)" \
  "$(apk_path runr)" \
  "$(apk_path vendr)" \
  "$(apk_path staff)"
gh release upload "$platform_tag" --repo "$REPO" "$zip_path" --clobber

echo "Published platform release $platform_tag (includes porter-platform-apks.zip)"
