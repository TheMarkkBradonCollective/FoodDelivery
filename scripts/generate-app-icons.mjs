#!/usr/bin/env node
/**
 * Generate launcher + in-app icons from the Porter rider mark (no text).
 * Source: brands/porter-icon-mark.png (white rider on blue — text stripped).
 *
 * Usage: npm run icons:generate
 */
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const markSource = join(root, "brands", "porter-icon-mark.png");

/** @type {Array<{ id: string; background: string; mark: "purple" | "white" | "lime"; launcherBg: string }>} */
const variants = [
  { id: "porter", background: "#F6F1E8", mark: "purple", launcherBg: "#F6F1E8" },
  { id: "runr", background: "#C5E86A", mark: "purple", launcherBg: "#C5E86A" },
  { id: "vendr", background: "#6B3FA0", mark: "white", launcherBg: "#6B3FA0" },
  { id: "staff", background: "#3D2458", mark: "lime", launcherBg: "#3D2458" },
];

const densities = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

const MARK_COLORS = {
  purple: { r: 107, g: 63, b: 160 },
  lime: { r: 197, g: 232, b: 106 },
  white: { r: 255, g: 255, b: 255 },
};

function hexToRgb(hex) {
  const n = hex.replace("#", "");
  return {
    r: Number.parseInt(n.slice(0, 2), 16),
    g: Number.parseInt(n.slice(2, 4), 16),
    b: Number.parseInt(n.slice(4, 6), 16),
  };
}

/** Extract white rider from blue background and recolor on transparency. */
async function riderMarkBuffer(markSize, markColor) {
  const color = MARK_COLORS[markColor];
  const { data, info } = await sharp(markSource)
    .resize(markSize, markSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum > 175) {
      out[o] = color.r;
      out[o + 1] = color.g;
      out[o + 2] = color.b;
      out[o + 3] = 255;
    } else {
      out[o + 3] = 0;
    }
  }

  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function composeIcon(variant, size) {
  const padding = Math.round(size * 0.12);
  const markSize = size - padding * 2;
  const markBuf = await riderMarkBuffer(markSize, variant.mark);
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

/** Foreground layer for Android adaptive icons (rider only, transparent bg). */
async function foregroundMark(variant, size) {
  const padding = Math.round(size * 0.18);
  const markSize = size - padding * 2;
  return riderMarkBuffer(markSize, variant.mark);
}

function writeLauncherBackground(appId, color) {
  const valuesDir = join(root, "apps", appId, "android", "app", "src", "main", "res", "values");
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

    const launcher = await composeIcon(variant, size);
    const foreground = await foregroundMark(variant, size);

    await sharp(launcher).toFile(join(outDir, "ic_launcher.png"));
    await sharp(launcher).toFile(join(outDir, "ic_launcher_round.png"));
    await sharp(foreground).toFile(join(outDir, "ic_launcher_foreground.png"));
  }

  writeLauncherBackground(variant.id, variant.launcherBg);
  console.log(`Generated icons for ${variant.id} (${variant.background} + ${variant.mark} rider)`);
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
