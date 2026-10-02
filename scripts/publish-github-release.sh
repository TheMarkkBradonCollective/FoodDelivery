#!/usr/bin/env bash
# Publish Portr platform APKs and the Portr Command Windows app to GitHub Releases.
set -euo pipefail
cd "$(dirname "$0")/.."
REPO="TheMarkkBradonCollective/FoodDelivery"
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
    porter) title="Portr v${version}" ;;
    runr) title="Portr Runner v${version}" ;;
    vendr) title="Portr Vendor v${version}" ;;
    staff) title="Portr Command v${version}" ;;
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
  --title "Portr v${platform_version}" \
  --notes "Portr v${platform_version} — signed Android APKs for Portr, Portr Runner, Portr Vendor, Portr Command, and FastFood, plus the Portr Command Windows app." \
  "$(apk_path fastfood)#fastfood-v${platform_version}.apk" \
  "$(apk_path porter)#porter-v${platform_version}.apk" \
  "$(apk_path runr)#runr-v${platform_version}.apk" \
  "$(apk_path vendr)#vendr-v${platform_version}.apk" \
  "$(apk_path staff)#staff-v${platform_version}.apk"

exe_named="${ROOT}/release/desktop/PortrCommand-v${platform_version}.exe"
if [[ -f "$exe_named" ]]; then
  gh release upload "$platform_tag" --repo "$REPO" "$exe_named" --clobber
fi

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
