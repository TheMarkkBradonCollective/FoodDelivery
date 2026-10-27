import { handle, json, preflight, requireUser } from "@/lib/http";
import { canRead, shapeProfile, type Ctx } from "@/lib/rules";
import { lastWrite, readTables } from "@/lib/sheets";

export const OPTIONS = preflight;
export const dynamic = "force-dynamic";

const TABS = [
  "businesses", "menu_items", "coverage_rules", "runs", "orders", "deliveries",
  "earnings", "notifications", "favorites", "profiles", "staff_messages",
];

/**
 * GET /api/marketplace?updated_since=ISO
 * Returns { changed:false, serverTime } when nothing was written since the given time,
 * otherwise every tab the caller may read (RLS-equivalent filtering).
 */
export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const since = new URL(req.url).searchParams.get("updated_since");
  const serverTime = new Date().toISOString();
  if (since) {
    const lw = await lastWrite();
    if (lw && lw <= since) return json(req, { changed: false, serverTime });
  }
  const data = await readTables(TABS);
  const ctx: Ctx = { user, businesses: data.businesses };
  const tables: Record<string, unknown[]> = {};
  for (const t of TABS) {
    let rows = data[t].filter((r) => canRead(t, r, ctx));
    if (t === "profiles") rows = rows.map((r) => shapeProfile(r, ctx));
    if (t === "orders" || t === "notifications") {
      rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    }
    if (t === "earnings") rows.sort((a, b) => String(b.completed_at).localeCompare(String(a.completed_at)));
    if (t === "staff_messages") {
      rows.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
      rows = rows.slice(-200);
    }
    tables[t] = rows;
  }
  return json(req, { changed: true, serverTime, tables });
});
