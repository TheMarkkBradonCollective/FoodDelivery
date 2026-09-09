#!/usr/bin/env node
/**
 * Generate Android mipmap launcher icons from brands/*.png sources.
 *
 * Usage: node scripts/generate-app-icons.mjs
 */
import { mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const apps = [
  { id: "porter", source: "porter-icon.png" },
  { id: "vendr", source: "vendr-icon.png" },
  { id: "runr", source: "runr-icon.png" },
];

const densities = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

async function generateForApp(app) {
  const sourcePath = join(root, "brands", app.source);
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing source icon: ${sourcePath}`);
  }

  const resRoot = join(root, "apps", app.id, "android", "app", "src", "main", "res");

  for (const [folder, size] of Object.entries(densities)) {
    const outDir = join(resRoot, folder);
    mkdirSync(outDir, { recursive: true });

    const launcherPath = join(outDir, "ic_launcher.png");
    const roundPath = join(outDir, "ic_launcher_round.png");
    const foregroundPath = join(outDir, "ic_launcher_foreground.png");

    const resized = await sharp(sourcePath)
      .resize(size, size, { fit: "cover" })
      .png()
      .toBuffer();

    await sharp(resized).toFile(launcherPath);
    await sharp(resized).toFile(roundPath);
    await sharp(resized).toFile(foregroundPath);
  }

  console.log(`Generated icons for ${app.id}`);
}

async function main() {
  for (const app of apps) {
    await generateForApp(app);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
