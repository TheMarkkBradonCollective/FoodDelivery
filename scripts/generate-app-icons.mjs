#!/usr/bin/env node
/**
 * Generate Android adaptive + legacy launcher icons.
 *
 * Adaptive icons are 108dp. Launchers only guarantee the center 66dp circle
 * (the safe zone). Rider + badge stay inside that circle so helmet, wheels,
 * and the letter are not cropped on Samsung/Pixel masks.
 *
 * Usage: npm run icons:generate
 */
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const markSource = join(root, "brands", "rider-mark.png");
const interBold = "/usr/share/fonts/truetype/macos/Inter-Bold.ttf";

const PURPLE = "#7048F8";
const LIME = "#A0F878";
const RED = "#E31837";
const YELLOW = "#FFC72C";
const LIME_RGB = { r: 160, g: 248, b: 120 };
const PURPLE_RGB = { r: 112, g: 72, b: 248 };
const YELLOW_RGB = { r: 255, g: 199, b: 44 };
const WHITE_RGB = { r: 255, g: 255, b: 255 };

/** 66dp visible / 108dp adaptive canvas */
const SAFE = 66 / 108;
/** Rider box as a fraction of the safe circle — leaves room so wheels stay in. */
const RIDER_IN_SAFE = 0.72;

const variants = [
  { id: "porter", badge: "P", background: PURPLE, mark: "lime" },
  { id: "runr", badge: "R", background: PURPLE, mark: "lime" },
  { id: "vendr", badge: "V", background: PURPLE, mark: "lime" },
  { id: "staff", badge: "C", background: LIME, mark: "purple" },
  { id: "fastfood", badge: "F", background: RED, mark: "yellow" },
];

/** Adaptive foreground is 108dp (not 48dp). */
const adaptivePx = {
  "mipmap-mdpi": 108,
  "mipmap-hdpi": 162,
  "mipmap-xhdpi": 216,
  "mipmap-xxhdpi": 324,
  "mipmap-xxxhdpi": 432,
};

/** Legacy launcher icons are 48dp. */
const legacyPx = {
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

function markRgb(kind) {
  if (kind === "purple") return PURPLE_RGB;
  if (kind === "yellow") return YELLOW_RGB;
  return LIME_RGB;
}

function markHex(kind) {
  if (kind === "purple") return PURPLE;
  if (kind === "yellow") return YELLOW;
  return LIME;
}

async function extractRider() {
  const { data, info } = await sharp(markSource).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });

  const out = Buffer.alloc(data.length);
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const o = (y * info.width + x) * 4;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      const a = data[o + 3];

      if (a < 16 || r + g + b < 36) continue;

      const limeScore = g - b;
      if (g < 130 || limeScore < 18) continue;

      const alpha = Math.min(255, Math.round(((limeScore - 18) / 90) * 255));
      if (alpha < 12) continue;

      out[o] = LIME_RGB.r;
      out[o + 1] = LIME_RGB.g;
      out[o + 2] = LIME_RGB.b;
      out[o + 3] = alpha;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(info.width - 1, maxX + pad);
  maxY = Math.min(info.height - 1, maxY + pad);

  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toBuffer();
}

async function tintRider(png, color) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * 4;
    if (data[o + 3] === 0) continue;
    data[o] = color.r;
    data[o + 1] = color.g;
    data[o + 2] = color.b;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

async function riderAt(riderPng, markW, markH) {
  return sharp(riderPng)
    .resize(markW, markH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

function fontFaceCss() {
  return existsSync(interBold)
    ? `@font-face { font-family: "IconSans"; src: url("file://${interBold}"); }`
    : "";
}

function badgeSvg(size, letter, fill, bg) {
  const safe = size * SAFE;
  const r = Math.max(8, Math.round(safe * 0.16));
  const cx = size / 2;
  const cy = size / 2 + safe * 0.28;
  const fontSize = Math.round(r * 1.15);
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs><style><![CDATA[
    ${fontFaceCss()}
    text { font-family: "IconSans", "Inter", "Noto Sans", sans-serif; font-weight: 800; }
  ]]></style></defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}"/>
  <text x="${cx}" y="${cy + fontSize * 0.36}" text-anchor="middle" font-size="${fontSize}" fill="${fill}">${letter}</text>
</svg>`);
}

/** Transparent 108dp-style layer: rider + badge inside the 66dp safe circle. */
async function composeForeground(riderPng, size, variant, { monochrome = false } = {}) {
  const safe = size * SAFE;
  const riderBox = Math.round(safe * RIDER_IN_SAFE);
  const left = Math.round((size - riderBox) / 2);
  const top = Math.round(size / 2 - safe * 0.38);

  const color = monochrome ? WHITE_RGB : markRgb(variant.mark);
  const tinted = await tintRider(riderPng, color);
  const rider = await riderAt(tinted, riderBox, riderBox);

  const badgeFill = monochrome ? "#FFFFFF" : variant.background;
  const badgeBg = monochrome ? "#00000000" : markHex(variant.mark);
  const badge = badgeSvg(size, variant.badge, badgeFill, badgeBg);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: rider, left, top },
      { input: badge, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();
}

/** What the user sees after a circular mask: bg + safe-zone art. */
async function composeLegacy(riderPng, size, variant) {
  const fg = await composeForeground(riderPng, size, variant);
  const bg = hexToRgb(variant.background);
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { ...bg, alpha: 255 },
    },
  })
    .composite([{ input: fg, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function roundMask(png, size) {
  const r = Math.round(size / 2);
  return sharp(png)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
}

function writeAdaptiveXml(appId) {
  const dir = join(root, "apps", appId, "android", "app", "src", "main", "res", "mipmap-anydpi-v26");
  mkdirSync(dir, { recursive: true });
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>
</adaptive-icon>
`;
  writeFileSync(join(dir, "ic_launcher.xml"), xml);
  writeFileSync(join(dir, "ic_launcher_round.xml"), xml);
}

function writeLauncherBackground(appId, color) {
  const valuesDir = join(root, "apps", appId, "android", "app", "src", "main", "res", "values");
  mkdirSync(valuesDir, { recursive: true });
  writeFileSync(
    join(valuesDir, "ic_launcher_background.xml"),
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${color}</color>\n</resources>\n`
  );
}

async function generateForApp(variant, riderPng) {
  const resRoot = join(root, "apps", variant.id, "android", "app", "src", "main", "res");
  const publicIconDir = join(root, "apps", variant.id, "public", "icons");
  const websiteIconDir = join(root, "apps", "website", "public", "icons", "apps");
  const storeDir = join(root, "brands", "store");

  mkdirSync(publicIconDir, { recursive: true });
  mkdirSync(websiteIconDir, { recursive: true });
  mkdirSync(storeDir, { recursive: true });

  const preview = await composeLegacy(riderPng, 512, variant);
  const squircle = await sharp(preview)
    .composite([
      {
        input: Buffer.from(
          `<svg width="512" height="512"><rect width="512" height="512" rx="112" fill="white"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  await sharp(squircle).toFile(join(publicIconDir, "app-icon.png"));
  await sharp(squircle).toFile(join(websiteIconDir, `${variant.id}.png`));
  await sharp(preview).toFile(join(storeDir, `${variant.id}-512.png`));

  for (const [folder, size] of Object.entries(adaptivePx)) {
    const outDir = join(resRoot, folder);
    mkdirSync(outDir, { recursive: true });
    const foreground = await composeForeground(riderPng, size, variant);
    const mono = await composeForeground(riderPng, size, variant, { monochrome: true });
    await sharp(foreground).toFile(join(outDir, "ic_launcher_foreground.png"));
    await sharp(mono).toFile(join(outDir, "ic_launcher_monochrome.png"));
  }

  for (const [folder, size] of Object.entries(legacyPx)) {
    const outDir = join(resRoot, folder);
    mkdirSync(outDir, { recursive: true });
    const launcher = await composeLegacy(riderPng, size, variant);
    await sharp(launcher).toFile(join(outDir, "ic_launcher.png"));
    await sharp(await roundMask(launcher, size)).toFile(join(outDir, "ic_launcher_round.png"));
  }

  writeLauncherBackground(variant.id, variant.background);
  writeAdaptiveXml(variant.id);
  console.log(`Generated safe-zone icons for ${variant.id} (badge ${variant.badge})`);
}

async function generateMaskPreview(coloredRiders) {
  const cell = 240;
  const gap = 24;
  const cols = variants.length;
  const rows = 3;
  const width = gap + cols * (cell + gap);
  const height = gap + rows * (cell + gap) + 36;
  const tiles = [];

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const icon = await composeLegacy(coloredRiders[variant.id], cell, variant);
    const x = gap + i * (cell + gap);

    tiles.push({ input: icon, left: x, top: gap });

    const circle = await roundMask(icon, cell);
    tiles.push({ input: circle, left: x, top: gap * 2 + cell });

    const squircle = await sharp(icon)
      .composite([
        {
          input: Buffer.from(
            `<svg width="${cell}" height="${cell}"><rect width="${cell}" height="${cell}" rx="${Math.round(cell * 0.22)}" fill="white"/></svg>`
          ),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();
    tiles.push({ input: squircle, left: x, top: gap * 3 + cell * 2 });
  }

  const out = join(root, "brands", "icon-safe-preview.png");
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 26, g: 18, b: 36, alpha: 255 },
    },
  })
    .composite(tiles)
    .png()
    .toFile(out);
  console.log(`Wrote mask preview ${out}`);
}

async function main() {
  if (!existsSync(markSource)) {
    throw new Error(`Missing rider mark: ${markSource}`);
  }

  const limeRider = await extractRider();
  await sharp(limeRider).toFile(join(root, "brands", "rider-mark-lime.png"));
  const purpleRider = await tintRider(limeRider, PURPLE_RGB);
  await sharp(purpleRider).toFile(join(root, "brands", "rider-mark-purple.png"));
  const yellowRider = await tintRider(limeRider, YELLOW_RGB);
  await sharp(yellowRider).toFile(join(root, "brands", "rider-mark-yellow.png"));

  const coloredRiders = {};
  for (const variant of variants) {
    const rider =
      variant.mark === "purple" ? purpleRider : variant.mark === "yellow" ? yellowRider : limeRider;
    coloredRiders[variant.id] = rider;
    await generateForApp(variant, rider);
  }

  await generateMaskPreview(coloredRiders);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
