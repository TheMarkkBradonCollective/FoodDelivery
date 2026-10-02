#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const built = join(root, "release/desktop/PortrCommand.exe");
if (!existsSync(built)) {
  console.error(`Missing ${built}. Run the Portr Command desktop build first.`);
  process.exit(1);
}

const version = "0.3.5";
const latestDir = join(root, "release/latest");
mkdirSync(latestDir, { recursive: true });
const latest = join(latestDir, "PortrCommand.exe");
const versioned = join(root, "release/desktop", `PortrCommand-v${version}.exe`);
copyFileSync(built, latest);
copyFileSync(built, versioned);
const size = statSync(latest).size;
if (size < 1_000_000) {
  console.error(`Portr Command exe looks too small (${size} bytes)`);
  process.exit(1);
}
console.log(`Staged ${latest} (${size} bytes)`);
console.log(`Staged ${versioned}`);
