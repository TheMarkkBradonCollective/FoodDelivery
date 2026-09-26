# APK Downloads

APKs are distributed through the **MBC App Store** and GitHub Releases — not from this folder.

## Build & publish

From the repo root (requires Android SDK + Java):

```bash
npm run build:apks      # Build all 3 Android APKs
npm run publish:apk     # Copy to release/ + update version.json
npm run publish:release # Create GitHub Releases
```

Release artifacts:

- `release/porter-v0.1.0.apk` — Porter customer app (`com.runr.porter`)
- `release/runr-v0.1.0.apk` — Porter Runner delivery app (`com.runr.runr`)
- `release/vendr-v0.1.0.apk` — Porter Vendor business app (`com.runr.vendr`)

Install from the MBC App Store: https://themarkkbradoncollective.github.io/main/download/
