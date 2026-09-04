#!/bin/bash
# Copy built APKs to website public/downloads for distribution
set -e
DEST="/workspace/apps/website/public/downloads"
mkdir -p "$DEST"

copy_apk() {
  local app=$1
  local name=$2
  local src="/workspace/apps/$app/android/app/build/outputs/apk/debug/app-debug.apk"
  if [ -f "$src" ]; then
    cp "$src" "$DEST/$name"
    echo "✓ Copied $name"
  else
    echo "✗ Missing $src — run: npm run android:$app"
  fi
}

copy_apk porter porter.apk
copy_apk runr runr.apk
copy_apk vendr vendr.apk

echo "Done. APKs in $DEST"
