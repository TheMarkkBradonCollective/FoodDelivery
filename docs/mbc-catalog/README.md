# MBC App Store catalog setup

The RUNR platform (`porter`, `runr`, `vendr`) must be registered in `TheMarkkBradonCollective/main` before the apps appear in the MBC App Store.

## 1. Add catalog entries

Append the three objects in `My-Projects.entries.json` to `My-Projects.json` on the `main` repo (skip any slug that already exists).

## 2. Update APK discovery for multi-app monorepos

In `scripts/sync-apk-catalog.mjs`, replace `pickBestGithubApk` with the version in `sync-apk-catalog.mjs.reference` so each catalog slug picks its matching `release/{slug}-v*.apk` from this repo.

## 3. Sync the catalog

From this repo (after `npm run publish:apk`):

```bash
GITHUB_TOKEN=ghp_your_token_with_main_push_access npm run sync:mbc-catalog
```

Or add `MBC_MAIN_REPO_TOKEN` as a repo secret and run the **Sync MBC catalog** workflow.

Manual alternative on the `main` repo:

```bash
cd /path/to/main
npm install
GITHUB_TOKEN=... npm run sync-app-icons
GITHUB_TOKEN=... npm run sync-apk-catalog
git add My-Projects.json scripts/sync-apk-catalog.mjs icons/apps/porter.png icons/apps/runr.png icons/apps/vendr.png apk-catalog.json public/apk-catalog.json
git commit -m "Add RUNR platform apps to MBC App Store catalog"
git push
```

## 4. Verify store listings

- https://themarkkbradoncollective.github.io/main/download/#download-porter
- https://themarkkbradoncollective.github.io/main/download/#download-runr
- https://themarkkbradoncollective.github.io/main/download/#download-vendr

Local verification (already tested): all three slugs resolve to `0.1.0` APKs from `release/` via GitHub discovery.
