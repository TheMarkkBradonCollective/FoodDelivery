#!/usr/bin/env node
/**
 * Copy all Portr public tables from Supabase Postgres to Neon.
 * Requires SUPABASE_DB_URL and DATABASE_URL (env only — never commit URLs).
 */
import pg from "pg";

const { Client } = pg;

const sourceUrl = process.env.SUPABASE_DB_URL;
const destUrl = process.env.DATABASE_URL;

if (!sourceUrl || !destUrl) {
  console.error("Set SUPABASE_DB_URL and DATABASE_URL in the environment.");
  process.exit(1);
}

const TABLES = [
  "profiles",
  "businesses",
  "menu_items",
  "coverage_rules",
  "orders",
  "runs",
  "deliveries",
  "earnings",
  "notifications",
  "favorites",
  "staff_messages",
];

async function columnNames(client, table) {
  const { rows } = await client.query(
    `select column_name from information_schema.columns
     where table_schema = 'public' and table_name = $1
     order by ordinal_position`,
    [table],
  );
  return rows.map((r) => r.column_name);
}

async function fetchProfiles(src) {
  const destCols = [
    "id",
    "email",
    "personal_email",
    "company_email",
    "name",
    "password_hash",
    "role",
    "is_founder",
    "avatar_url",
    "access_preference",
    "created_at",
    "updated_at",
  ];
  const { rows } = await src.query(`
    select
      p.id,
      p.email,
      p.personal_email,
      p.company_email,
      p.name,
      u.encrypted_password as password_hash,
      p.role,
      p.is_founder,
      p.avatar_url,
      p.access_preference,
      p.created_at,
      p.updated_at
    from public.profiles p
    left join auth.users u on u.id = p.id
  `);
  return { cols: destCols, rows };
}

async function fetchGeneric(src, table, cols) {
  const colList = cols.map((c) => `"${c}"`).join(", ");
  const { rows } = await src.query(`select ${colList} from public.${table}`);
  return { cols, rows };
}

async function insertRows(dest, table, cols, rows) {
  if (rows.length === 0) return;
  const colList = cols.map((c) => `"${c}"`).join(", ");
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `insert into public.${table} (${colList}) values (${placeholders})`;
  for (const row of rows) {
    await dest.query(
      sql,
      cols.map((c) => row[c] ?? null),
    );
  }
}

async function main() {
  const src = new Client({ connectionString: sourceUrl, ssl: { rejectUnauthorized: false } });
  const dest = new Client({ connectionString: destUrl, ssl: { rejectUnauthorized: false } });
  await src.connect();
  await dest.connect();

  try {
    await dest.query("begin");
    for (const table of [...TABLES].reverse()) {
      await dest.query(`truncate table public.${table} cascade`);
    }

    for (const table of TABLES) {
      let payload;
      if (table === "profiles") {
        payload = await fetchProfiles(src);
      } else {
        const destCols = await columnNames(dest, table);
        const srcCols = await columnNames(src, table);
        const cols = destCols.filter((c) => srcCols.includes(c));
        payload = await fetchGeneric(src, table, cols);
      }
      console.log(`${table}: ${payload.rows.length} rows`);
      await insertRows(dest, table, payload.cols, payload.rows);
    }

    await dest.query("commit");
    console.log("Migration complete.");
  } catch (err) {
    await dest.query("rollback");
    console.error(err);
    process.exit(1);
  } finally {
    await src.end();
    await dest.end();
  }
}

void main();
