import { handle, HttpError, json, preflight, requireUser } from "@/lib/http";
import { assertWrite, SELF_PROFILE_FIELDS, WRITABLE_TABLES, type Ctx } from "@/lib/rules";
import { keyMatch, matches, readTable, readTableRows, remove, upsert, type Row } from "@/lib/sheets";

export const OPTIONS = preflight;

/**
 * POST /api/db/:table
 *   { op: "upsert", row }            insert or merge by primary key
 *   { op: "update", match, patch }   patch matching rows
 *   { op: "delete", match }          clear matching rows
 */
export const POST = handle(async (req, { params }) => {
  const { table } = await params;
  if (!WRITABLE_TABLES.has(table)) throw new HttpError(404, "Unknown table");
  const user = await requireUser(req);
  const body = (await req.json()) as { op: string; row?: Row; match?: Row; patch?: Row };
  const businesses = table === "businesses" ? [] : await readTable("businesses");
  const rows = await readTableRows(table);
  const ctx: Ctx = { user, businesses: table === "businesses" ? rows.map((r) => r.data) : businesses };
  delete body.row?.password_hash;
  delete body.patch?.password_hash;

  const guardProfile = (prev: Row | null, change: Row) => {
    if (table !== "profiles" || user.role === "staff") return;
    for (const k of Object.keys(change)) {
      if (k !== "id" && !SELF_PROFILE_FIELDS.has(k)) throw new HttpError(403, `Cannot change ${k}`);
    }
    void prev;
  };

  if (body.op === "upsert" && body.row) {
    const match = keyMatch(table, body.row);
    const prev = rows.find((r) => matches(r.data, match))?.data ?? null;
    guardProfile(prev, body.row);
    assertWrite(table, prev, { ...(prev ?? {}), ...body.row }, ctx);
    return json(req, { row: await upsert(table, body.row, rows) });
  }

  if (body.op === "update" && body.match && body.patch) {
    const targets = rows.filter((r) => matches(r.data, body.match!));
    guardProfile(null, body.patch);
    for (const t of targets) assertWrite(table, t.data, { ...t.data, ...body.patch }, ctx);
    const { update } = await import("@/lib/sheets");
    return json(req, { rows: await update(table, body.match, body.patch, targets) });
  }

  if (body.op === "delete" && body.match) {
    if (table !== "favorites" && user.role !== "staff") throw new HttpError(403, "Delete not allowed");
    const targets = rows.filter((r) => matches(r.data, body.match!));
    for (const t of targets) assertWrite(table, t.data, t.data, ctx);
    return json(req, { deleted: await remove(table, body.match, targets) });
  }

  throw new HttpError(400, "Bad request");
});
