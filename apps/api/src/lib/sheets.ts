import { google, type sheets_v4 } from "googleapis";
import { JSON_COLUMNS, TABLES, keyOf, rangeOf } from "./tables.mjs";

export type Row = Record<string, unknown>;

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

let sheetsClient: sheets_v4.Sheets | null = null;

export function sheets(): sheets_v4.Sheets {
  if (!sheetsClient) {
    const auth = new google.auth.JWT({
      email: env("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      key: env("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    sheetsClient = google.sheets({ version: "v4", auth });
  }
  return sheetsClient;
}

const sheetId = () => env("GOOGLE_SHEET_ID");

export function columns(table: string): string[] {
  const cols = TABLES[table];
  if (!cols) throw new Error(`Unknown table ${table}`);
  return cols;
}

function decode(col: string, value: unknown): unknown {
  if (value === "" || value === undefined || value === null) return null;
  if (JSON_COLUMNS.has(col) && typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function encode(col: string, value: unknown): string | number | boolean {
  if (value === undefined || value === null) return "";
  if (JSON_COLUMNS.has(col) || (typeof value === "object" && value !== null)) return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  return String(value);
}

const lastCol = (n: number) => {
  let s = "";
  for (let i = n; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
};

/** Rows with their 1-based sheet row number (header is row 1). */
export interface SheetRow {
  rowNumber: number;
  data: Row;
}

export async function readTableRows(table: string): Promise<SheetRow[]> {
  const cols = columns(table);
  const res = await sheets().spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: rangeOf(table, `A2:${lastCol(cols.length)}`),
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const values = res.data.values ?? [];
  const out: SheetRow[] = [];
  values.forEach((raw, i) => {
    if (!raw.some((v) => v !== "" && v !== null && v !== undefined)) return; // cleared row
    const data: Row = {};
    cols.forEach((c, j) => (data[c] = decode(c, raw[j])));
    out.push({ rowNumber: i + 2, data });
  });
  return out;
}

export async function readTable(table: string): Promise<Row[]> {
  return (await readTableRows(table)).map((r) => r.data);
}

/** Read many tabs in one Sheets API call. */
export async function readTables(tables: string[]): Promise<Record<string, Row[]>> {
  const res = await sheets().spreadsheets.values.batchGet({
    spreadsheetId: sheetId(),
    ranges: tables.map((t) => rangeOf(t, `A2:${lastCol(columns(t).length)}`)),
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const out: Record<string, Row[]> = {};
  tables.forEach((t, k) => {
    const cols = columns(t);
    out[t] = (res.data.valueRanges?.[k]?.values ?? [])
      .filter((raw) => raw.some((v) => v !== "" && v !== null && v !== undefined))
      .map((raw) => {
        const data: Row = {};
        cols.forEach((c, j) => (data[c] = decode(c, raw[j])));
        return data;
      });
  });
  return out;
}

export function matches(row: Row, match: Row): boolean {
  return Object.entries(match).every(([k, v]) => String(row[k] ?? "") === String(v ?? ""));
}

export function keyMatch(table: string, row: Row): Row {
  const m: Row = {};
  for (const k of keyOf(table)) {
    if (row[k] === undefined || row[k] === null || row[k] === "") throw new Error(`Missing key ${k} for ${table}`);
    m[k] = row[k];
  }
  return m;
}

async function writeRow(table: string, rowNumber: number, data: Row) {
  const cols = columns(table);
  await sheets().spreadsheets.values.update({
    spreadsheetId: sheetId(),
    range: rangeOf(table, `A${rowNumber}:${lastCol(cols.length)}${rowNumber}`),
    valueInputOption: "RAW",
    requestBody: { values: [cols.map((c) => encode(c, data[c]))] },
  });
}

async function appendRow(table: string, data: Row) {
  const cols = columns(table);
  await sheets().spreadsheets.values.append({
    spreadsheetId: sheetId(),
    range: rangeOf(table, `A1`),
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [cols.map((c) => encode(c, data[c]))] },
  });
}

/** Records the last write time so pollers can skip unchanged snapshots. */
export async function touch(now = new Date().toISOString()) {
  const rows = await readTableRows("meta");
  const existing = rows.find((r) => r.data.key === "last_write");
  if (existing) await writeRow("meta", existing.rowNumber, { key: "last_write", value: now });
  else await appendRow("meta", { key: "last_write", value: now });
}

export async function lastWrite(): Promise<string | null> {
  const rows = await readTable("meta");
  const v = rows.find((r) => r.key === "last_write")?.value;
  return v ? String(v) : null;
}

const stamp = (table: string, row: Row, now: string): Row =>
  columns(table).includes("updated_at") ? { ...row, updated_at: now } : row;

/** Insert or merge by primary key. Returns the stored row. */
export async function upsert(table: string, row: Row, existingRows?: SheetRow[]): Promise<Row> {
  const now = new Date().toISOString();
  const rows = existingRows ?? (await readTableRows(table));
  const match = keyMatch(table, row);
  const hit = rows.find((r) => matches(r.data, match));
  const cols = columns(table);
  const clean: Row = {};
  for (const c of cols) if (c in row) clean[c] = row[c];
  if (hit) {
    const merged = stamp(table, { ...hit.data, ...clean }, now);
    await writeRow(table, hit.rowNumber, merged);
    await touch(now);
    return merged;
  }
  const created = stamp(table, { ...(cols.includes("created_at") ? { created_at: now } : {}), ...clean }, now);
  await appendRow(table, created);
  await touch(now);
  return created;
}

/** Patch every row matching `match`. Returns updated rows. */
export async function update(table: string, match: Row, patch: Row, existingRows?: SheetRow[]): Promise<Row[]> {
  const now = new Date().toISOString();
  const rows = (existingRows ?? (await readTableRows(table))).filter((r) => matches(r.data, match));
  const out: Row[] = [];
  for (const r of rows) {
    const merged = stamp(table, { ...r.data, ...patch }, now);
    await writeRow(table, r.rowNumber, merged);
    out.push(merged);
  }
  if (out.length) await touch(now);
  return out;
}

/** Clears matching rows (left blank; reads skip blank rows). */
export async function remove(table: string, match: Row, existingRows?: SheetRow[]): Promise<number> {
  const rows = (existingRows ?? (await readTableRows(table))).filter((r) => matches(r.data, match));
  const cols = columns(table);
  for (const r of rows) {
    await sheets().spreadsheets.values.clear({
      spreadsheetId: sheetId(),
      range: rangeOf(table, `A${r.rowNumber}:${lastCol(cols.length)}${r.rowNumber}`),
    });
  }
  if (rows.length) await touch();
  return rows.length;
}
