# APK Downloads

Place built Android APK files here for the marketing website to serve:

- `porter.apk` — PORTER customer app (`com.runr.porter`)
- `runr.apk` — RUNR delivery app (`com.runr.runr`)
- `vendr.apk` — VENDR business app (`com.runr.vendr`)

## Build APKs

From the repo root (requires Android SDK + Java):

```bash
npm run android:porter
npm run android:runr
npm run android:vendr
```

Then copy the debug APKs:

```bash
npm run copy-apks
```

APK build output locations:
- `apps/porter/android/app/build/outputs/apk/debug/app-debug.apk`
- `apps/runr/android/app/build/outputs/apk/debug/app-debug.apk`
- `apps/vendr/android/app/build/outputs/apk/debug/app-debug.apk`
