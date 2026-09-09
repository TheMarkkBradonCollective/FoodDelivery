#!/usr/bin/env node
/**
 * Generate launcher + in-app icons from the electric purple / lime rider mark.
 *
 * Source: brands/rider-mark.png (lime rider on purple, wordless).
 * Brand: purple #7048F8 · lime #A0F878
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
const LIME_RGB = { r: 160, g: 248, b: 120 };
const PURPLE_RGB = { r: 112, g: 72, b: 248 };

/** @type {Array<{ id: string; wordmark: string | null; background: string; mark: "lime" | "purple" }>} */
const variants = [
  { id: "porter", wordmark: "Porter", background: PURPLE, mark: "lime" },
  { id: "runr", wordmark: "Runr", background: PURPLE, mark: "lime" },
  { id: "vendr", wordmark: "Vendr", background: PURPLE, mark: "lime" },
  { id: "staff", wordmark: null, background: LIME, mark: "purple" },
];

const densities = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

const MARK_RGB = {
  lime: LIME_RGB,
  purple: PURPLE_RGB,
};

function hexToRgb(hex) {
  const n = hex.replace("#", "");
  return {
    r: Number.parseInt(n.slice(0, 2), 16),
    g: Number.parseInt(n.slice(2, 4), 16),
    b: Number.parseInt(n.slice(4, 6), 16),
  };
}

/**
 * Pull the lime rider off the purple field (and drop the black rounded frame).
 * Recolor to the locked lime so every size matches.
 */
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

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
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

function wordmarkSvg(size, label, fill) {
  const fontSize = Math.round(size * 0.125);
  const y = Math.round(size * 0.9);
  const fontFace = existsSync(interBold)
    ? `@font-face { font-family: "IconSans"; src: url("file://${interBold}"); }`
    : "";
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs><style><![CDATA[
    ${fontFace}
    text { font-family: "IconSans", "Inter", "Noto Sans", sans-serif; font-weight: 700; }
  ]]></style></defs>
  <text x="50%" y="${y}" text-anchor="middle" font-size="${fontSize}" fill="${fill}">${label}</text>
</svg>`);
}

async function composeIcon(riderPng, size, variant) {
  const bg = hexToRgb(variant.background);
  const layers = [];
  const markFill = variant.mark === "purple" ? PURPLE : LIME;

  if (variant.wordmark) {
    const markW = Math.round(size * 0.72);
    const markH = Math.round(size * 0.58);
    const top = Math.round(size * 0.12);
    const left = Math.round((size - markW) / 2);
    layers.push({
      input: await riderAt(riderPng, markW, markH),
      left,
      top,
    });
    layers.push({ input: wordmarkSvg(size, variant.wordmark, markFill), left: 0, top: 0 });
  } else {
    const pad = Math.round(size * 0.14);
    const markSize = size - pad * 2;
    layers.push({
      input: await riderAt(riderPng, markSize, markSize),
      left: pad,
      top: pad,
    });
  }

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { ...bg, alpha: 255 },
    },
  })
    .composite(layers)
    .png()
    .toBuffer();
}

async function foregroundMark(riderPng, size) {
  const pad = Math.round(size * 0.18);
  const markSize = size - pad * 2;
  const rider = await riderAt(riderPng, markSize, markSize);
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: rider, left: pad, top: pad }])
    .png()
    .toBuffer();
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

  mkdirSync(publicIconDir, { recursive: true });
  mkdirSync(websiteIconDir, { recursive: true });

  const master = await composeIcon(riderPng, 1024, variant);
  await sharp(master).toFile(join(publicIconDir, "app-icon.png"));
  await sharp(master).toFile(join(websiteIconDir, `${variant.id}.png`));

  for (const [folder, size] of Object.entries(densities)) {
    const outDir = join(resRoot, folder);
    mkdirSync(outDir, { recursive: true });

    const launcher = await composeIcon(riderPng, size, variant);
    const foreground = await foregroundMark(riderPng, size);

    await sharp(launcher).toFile(join(outDir, "ic_launcher.png"));
    await sharp(launcher).toFile(join(outDir, "ic_launcher_round.png"));
    await sharp(foreground).toFile(join(outDir, "ic_launcher_foreground.png"));
  }

  writeLauncherBackground(variant.id, variant.background);
  const label = variant.wordmark ? `"${variant.wordmark}" lockup` : "wordless rider";
  console.log(`Generated icons for ${variant.id} (${variant.background} + ${variant.mark} ${label})`);
}

async function generateShowcase(coloredRiders) {
  const gap = 48;
  const cell = 420;
  const width = gap * 3 + cell * 2;
  const height = gap * 3 + cell * 2;
  const positions = [
    { id: "porter", x: gap, y: gap },
    { id: "runr", x: gap * 2 + cell, y: gap },
    { id: "vendr", x: gap, y: gap * 2 + cell },
    { id: "staff", x: gap * 2 + cell, y: gap * 2 + cell },
  ];

  const tiles = [];
  for (const item of positions) {
    const variant = variants.find((v) => v.id === item.id);
    const icon = await composeIcon(coloredRiders[item.id], cell, variant);
    const rounded = await sharp(icon)
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
    tiles.push({ input: rounded, left: item.x, top: item.y });
  }

  const bg = hexToRgb("#2A1478");
  const out = join(root, "apps", "website", "public", "icons", "showcase.png");
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { ...bg, alpha: 255 },
    },
  })
    .composite(tiles)
    .png()
    .toFile(out);

  await sharp(out).toFile(join(root, "brands", "showcase.png"));
  console.log(`Generated showcase at ${out}`);
}

async function main() {
  if (!existsSync(markSource)) {
    throw new Error(`Missing rider mark: ${markSource}`);
  }

  const limeRider = await extractRider();
  await sharp(limeRider).toFile(join(root, "brands", "rider-mark-lime.png"));
  const purpleRider = await tintRider(limeRider, PURPLE_RGB);
  await sharp(purpleRider).toFile(join(root, "brands", "rider-mark-purple.png"));

  const coloredRiders = {};
  for (const variant of variants) {
    const rider = variant.mark === "purple" ? purpleRider : limeRider;
    coloredRiders[variant.id] = rider;
    await generateForApp(variant, rider);
  }

  await generateShowcase(coloredRiders);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
