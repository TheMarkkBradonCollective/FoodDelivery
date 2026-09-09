#!/usr/bin/env node
/**
 * Generate launcher icons from the Porter rider mark (no text).
 * Each app gets a distinct background + mark color treatment.
 *
 * Usage: npm run icons:generate
 */
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const markSource = join(root, "brands", "porter-icon-mark.png");

/** @type {Array<{ id: string; background: string; mark: "blue" | "black" | "white"; launcherBg: string }>} */
const variants = [
  {
    id: "porter",
    background: "#FFFFFF",
    mark: "blue",
    launcherBg: "#FFFFFF",
  },
  {
    id: "runr",
    background: "#FFFFFF",
    mark: "black",
    launcherBg: "#FFFFFF",
  },
  {
    id: "vendr",
    background: "#0066FF",
    mark: "white",
    launcherBg: "#0066FF",
  },
  {
    id: "staff",
    background: "#18181B",
    mark: "blue",
    launcherBg: "#18181B",
  },
];

const densities = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

function hexToRgb(hex) {
  const n = hex.replace("#", "");
  return {
    r: Number.parseInt(n.slice(0, 2), 16),
    g: Number.parseInt(n.slice(2, 4), 16),
    b: Number.parseInt(n.slice(4, 6), 16),
  };
}

async function tintedMark(markSize, markColor) {
  let pipeline = sharp(markSource).resize(markSize, markSize, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  if (markColor === "black") {
    pipeline = pipeline.greyscale().tint({ r: 0, g: 0, b: 0 });
  } else if (markColor === "white") {
    pipeline = pipeline.greyscale().tint({ r: 255, g: 255, b: 255 });
  }

  return pipeline.png().toBuffer();
}

async function composeIcon(variant, size) {
  const padding = Math.round(size * 0.14);
  const markSize = size - padding * 2;
  const markBuf = await tintedMark(markSize, variant.mark);
  const bg = hexToRgb(variant.background);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { ...bg, alpha: 255 },
    },
  })
    .composite([{ input: markBuf, gravity: "centre" }])
    .png()
    .toBuffer();
}

function writeLauncherBackground(appId, color) {
  const valuesDir = join(
    root,
    "apps",
    appId,
    "android",
    "app",
    "src",
    "main",
    "res",
    "values"
  );
  mkdirSync(valuesDir, { recursive: true });
  writeFileSync(
    join(valuesDir, "ic_launcher_background.xml"),
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${color}</color>\n</resources>\n`
  );
}

async function generateForApp(variant) {
  const resRoot = join(root, "apps", variant.id, "android", "app", "src", "main", "res");
  const publicIconDir = join(root, "apps", variant.id, "public", "icons");
  const websiteIconDir = join(root, "apps", "website", "public", "icons", "apps");

  mkdirSync(publicIconDir, { recursive: true });
  mkdirSync(websiteIconDir, { recursive: true });

  const master = await composeIcon(variant, 1024);
  await sharp(master).toFile(join(publicIconDir, "app-icon.png"));
  await sharp(master).toFile(join(websiteIconDir, `${variant.id}.png`));

  for (const [folder, size] of Object.entries(densities)) {
    const outDir = join(resRoot, folder);
    mkdirSync(outDir, { recursive: true });
    const icon = await composeIcon(variant, size);
    const launcherPath = join(outDir, "ic_launcher.png");
    const roundPath = join(outDir, "ic_launcher_round.png");
    const foregroundPath = join(outDir, "ic_launcher_foreground.png");
    await sharp(icon).toFile(launcherPath);
    await sharp(icon).toFile(roundPath);
    await sharp(icon).toFile(foregroundPath);
  }

  writeLauncherBackground(variant.id, variant.launcherBg);
  console.log(`Generated icons for ${variant.id} (${variant.background} + ${variant.mark} mark)`);
}

async function main() {
  if (!existsSync(markSource)) {
    throw new Error(`Missing rider mark: ${markSource}`);
  }

  for (const variant of variants) {
    await generateForApp(variant);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
