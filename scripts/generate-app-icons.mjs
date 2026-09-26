#!/usr/bin/env node
/**
 * Generate Android adaptive + legacy launcher icons.
 *
 * Same rider + wordmark lockup as the original logos. Adaptive icons are
 * 108dp and launchers only guarantee the center 66dp circle, so the lockup
 * is scaled into that safe zone instead of being redesigned.
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
/** Original square lockup, inset so wheels + wordmark stay inside a circle. */
const LOCKUP_IN_CIRCLE = 0.88;

const variants = [
  { id: "porter", wordmark: "Porter", background: PURPLE, mark: "lime" },
  { id: "runr", wordmark: "Runr", background: PURPLE, mark: "lime" },
  { id: "vendr", wordmark: "Vendr", background: PURPLE, mark: "lime" },
  { id: "staff", wordmark: null, background: LIME, mark: "purple" },
  { id: "fastfood", wordmark: "FastFood", background: RED, mark: "yellow" },
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

/** Original wordmark placement: baseline at 90%, type at 12.5% of the lockup square. */
function wordmarkSvg(size, label, fill) {
  const long = label.length > 6;
  const fontSize = Math.max(8, Math.round(size * (long ? 0.1 : 0.125)));
  const y = Math.round(size * 0.9);
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs><style><![CDATA[
    ${fontFaceCss()}
    text { font-family: "IconSans", "Inter", "Noto Sans", sans-serif; font-weight: 700; }
  ]]></style></defs>
  <text x="50%" y="${y}" text-anchor="middle" font-size="${fontSize}" fill="${fill}">${label}</text>
</svg>`);
}

/**
 * Original lockup on a square of `size`: rider 72×58% at top 12%, wordmark at 90%.
 * Staff is the wordless rider with 14% pad.
 */
async function composeLockup(riderPng, size, variant, { monochrome = false } = {}) {
  const rider = monochrome ? await tintRider(riderPng, WHITE_RGB) : riderPng;
  const fill = monochrome ? "#FFFFFF" : markHex(variant.mark);
  const layers = [];

  if (variant.wordmark) {
    const markW = Math.round(size * 0.72);
    const markH = Math.round(size * 0.58);
    const top = Math.round(size * 0.12);
    const left = Math.round((size - markW) / 2);
    layers.push({ input: await riderAt(rider, markW, markH), left, top });
    layers.push({ input: wordmarkSvg(size, variant.wordmark, fill), left: 0, top: 0 });
  } else {
    const pad = Math.round(size * 0.14);
    const markSize = size - pad * 2;
    layers.push({ input: await riderAt(rider, markSize, markSize), left: pad, top: pad });
  }

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(layers)
    .png()
    .toBuffer();
}

async function placeCentered(art, canvas) {
  const meta = await sharp(art).metadata();
  const left = Math.round((canvas - (meta.width || 0)) / 2);
  const top = Math.round((canvas - (meta.height || 0)) / 2);
  return sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: art, left, top }])
    .png()
    .toBuffer();
}

/** Original lockup scaled to sit inside a circle of diameter `circle`. */
async function fitLockupInCircle(riderPng, circle, variant, opts = {}) {
  const lockupSize = Math.max(8, Math.round(circle * LOCKUP_IN_CIRCLE));
  const lockup = await composeLockup(riderPng, lockupSize, variant, opts);
  return placeCentered(lockup, circle);
}

/** Transparent 108dp-style layer: original lockup inside the 66dp safe circle. */
async function composeForeground(riderPng, size, variant, opts = {}) {
  const safe = Math.round(size * SAFE);
  const fitted = await fitLockupInCircle(riderPng, safe, variant, opts);
  return placeCentered(fitted, size);
}

/** Full-bleed original lockup (store / website / legacy square). */
async function composeFull(riderPng, size, variant) {
  const lockup = await composeLockup(riderPng, size, variant);
  const bg = hexToRgb(variant.background);
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { ...bg, alpha: 255 },
    },
  })
    .composite([{ input: lockup, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

/** What a circular launcher shows: bg + lockup fitted to the visible circle. */
async function composeCircleIcon(riderPng, size, variant) {
  const fg = await fitLockupInCircle(riderPng, size, variant);
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

/** Adaptive icon after a launcher mask of `size` (simulates the 108dp canvas). */
async function composeAdaptivePreview(riderPng, size, variant) {
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

async function squircleMask(png, size) {
  return sharp(png)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="white"/></svg>`
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

  const full = await composeFull(riderPng, 512, variant);
  await sharp(await squircleMask(full, 512)).toFile(join(publicIconDir, "app-icon.png"));
  await sharp(await squircleMask(full, 512)).toFile(join(websiteIconDir, `${variant.id}.png`));
  await sharp(full).toFile(join(storeDir, `${variant.id}-512.png`));

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
    const square = await composeFull(riderPng, size, variant);
    const round = await composeCircleIcon(riderPng, size, variant);
    await sharp(square).toFile(join(outDir, "ic_launcher.png"));
    await sharp(await roundMask(round, size)).toFile(join(outDir, "ic_launcher_round.png"));
  }

  writeLauncherBackground(variant.id, variant.background);
  writeAdaptiveXml(variant.id);
  const label = variant.wordmark ? `"${variant.wordmark}" lockup` : "wordless rider";
  console.log(`Generated original lockup icons for ${variant.id} (${label})`);
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
    const x = gap + i * (cell + gap);
    const adaptive = await composeAdaptivePreview(coloredRiders[variant.id], cell, variant);

    tiles.push({ input: adaptive, left: x, top: gap });
    tiles.push({ input: await roundMask(adaptive, cell), left: x, top: gap * 2 + cell });
    tiles.push({ input: await squircleMask(adaptive, cell), left: x, top: gap * 3 + cell * 2 });
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
