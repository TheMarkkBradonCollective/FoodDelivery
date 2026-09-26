# APK Downloads

APKs live in the repo under **`release/apks/<app>/`** (versioned) and **`release/latest/`** (stable names).

## Build & publish

From the repo root (requires Android SDK + Java):

```bash
npm run build:apks      # Build all Android APKs
npm run publish:apk     # Copy to release/apks/* + release/latest/, update version.json
npm run release:apk     # Build, publish, and create GitHub Releases
```

Example paths after publish:

- `release/apks/porter/porter-v0.3.4.apk`
- `release/latest/porter.apk` — same build, fixed filename
- `release/apks/fastfood/fastfood-v0.3.4.apk`
- `release/latest/fastfood.apk`

Install from the MBC App Store: https://themarkkbradoncollective.github.io/main/download/
