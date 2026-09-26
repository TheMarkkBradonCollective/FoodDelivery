# Release APKs

Signed Android builds are published here (tracked in git).

## Layout

| Path | Purpose |
|------|---------|
| `release/apks/<app>/` | Versioned APKs (`porter-v0.3.4.apk`, etc.) — one folder per app |
| `release/latest/` | Stable filenames for the newest build (`porter.apk`, `fastfood.apk`, …) |

## Commands

```bash
npm run build:apks    # Gradle release builds (outputs under each app’s android/)
npm run publish:apk   # Copy into release/apks/* and release/latest/, refresh version.json
```

MBC mirror paths stay `apks/<app>/<app>-v<version>.apk` on `TheMarkkBradonCollective/main`.
