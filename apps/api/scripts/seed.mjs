#!/usr/bin/env node
/**
 * Seeds founder/staff accounts and the demo marketplace (Tony's Pizza etc.) into the Sheet.
 * Idempotent: rows are matched by primary key and only appended when missing.
 *
 *   SEED_FOUNDER_EMAILS="a@x.com,b@y.com" SEED_PASSWORD="..." npm run sheets:seed -w apps/api
 *   add --demo to also load the demo catalog.
 * Passwords are never stored in this repo; pass them via env at run time.
 */
import bcrypt from "bcryptjs";
import { TABLES, JSON_COLUMNS, keyOf, rangeOf } from "../src/lib/tables.mjs";
import { sheetsClient } from "./google.mjs";

const { sheets, spreadsheetId } = sheetsClient();
const now = new Date().toISOString();

async function rows(table) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: rangeOf(table, "A2:ZZ"), valueRenderOption: "UNFORMATTED_VALUE" });
  return (res.data.values ?? []).map((r) => Object.fromEntries(TABLES[table].map((c, i) => [c, r[i] ?? ""])));
}
async function ensure(table, list) {
  const have = await rows(table);
  const key = keyOf(table);
  const fresh = list.filter((r) => !have.some((h) => key.every((k) => String(h[k]) === String(r[k]))));
  if (!fresh.length) return console.log(`${table}: up to date`);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: rangeOf(table, "A1"),
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: fresh.map((r) =>
        TABLES[table].map((c) => {
          const v = c === "updated_at" ? now : r[c];
          if (v === undefined || v === null) return "";
          return JSON_COLUMNS.has(c) || typeof v === "object" ? JSON.stringify(v) : v;
        }),
      ),
    },
  });
  console.log(`${table}: added ${fresh.length}`);
}

const founders = (process.env.SEED_FOUNDER_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const password = process.env.SEED_PASSWORD;
if (founders.length) {
  if (!password || password.length < 8) {
    console.error("Set SEED_PASSWORD (8+ chars) to create founder accounts.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  await ensure(
    "profiles",
    founders.map((email) => ({
      id: crypto.randomUUID(), email, name: email.split("@")[0], role: "founder",
      is_founder: true, password_hash: hash, created_at: now,
    })),
  );
}

if (process.argv.includes("--demo")) {
  const DEMO = {
    customer: "b1000000-0000-4000-8000-000000000001",
    runr: "b1000000-0000-4000-8000-000000000002",
    business: "b1000000-0000-4000-8000-000000000003",
  };
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await ensure("profiles", Object.entries(DEMO).map(([role, id]) => ({
      id, email: `demo-${role}@portr.local`, name: `Demo ${role}`, role, is_founder: false, password_hash: hash, created_at: now,
    })));
  }
  const biz = [
    ["c1000000-0000-4000-8000-000000000001", "Tony's Pizza", "Pizza", 37.7849, -122.4094, "450 Mission St"],
    ["c1000000-0000-4000-8000-000000000002", "Golden Gate Burgers", "Burgers", 37.7793, -122.4192, "1 Grove St"],
    ["c1000000-0000-4000-8000-000000000003", "Mission Tacos", "Mexican", 37.7599, -122.4148, "2400 Mission St"],
  ];
  await ensure("businesses", biz.map(([id, name, cuisine, lat, lng, address]) => ({
    id, owner_id: DEMO.business, name, cuisine, category: "Restaurant", rating: 4.7, review_count: 120,
    lat, lng, address, city: "San Francisco", zip: "94105", delivery_radius_miles: 5,
    operating_hours: "11:00 AM – 11:00 PM", delivery_fee: 2.99, eta_minutes: 25, demand_level: "moderate", created_at: now,
  })));
  await ensure("menu_items", biz.flatMap(([id, name], i) => [
    { id: `d100000${i}-0000-4000-8000-000000000001`, business_id: id, name: `${name} Classic`, description: "House favorite", price: 12.5, category: "Mains", popular: true },
    { id: `d100000${i}-0000-4000-8000-000000000002`, business_id: id, name: "Side", description: "Shareable side", price: 4.5, category: "Sides", popular: false },
  ]));
  await ensure("coverage_rules", biz.map(([id], i) => ({
    id: `e100000${i}-0000-4000-8000-000000000011`, business_id: id, start_time: "00:00", end_time: "23:59", max_runrs: 4,
  })));
}
console.log("Seed done.");
