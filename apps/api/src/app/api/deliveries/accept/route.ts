import { handle, HttpError, json, preflight, requireUser } from "@/lib/http";
import { readTableRows, update } from "@/lib/sheets";

export const OPTIONS = preflight;

/**
 * POST /api/deliveries/accept { deliveryId, accessNotice? }
 * Check-then-write claim: re-reads the row, refuses if another runner holds it,
 * writes the claim, then re-reads to confirm it won (Sheets has no transactions).
 */
export const POST = handle(async (req) => {
  const user = await requireUser(req);
  if (user.role !== "runr") throw new HttpError(403, "Only runners accept deliveries");
  const { deliveryId, accessNotice } = (await req.json()) as { deliveryId?: string; accessNotice?: unknown };
  if (!deliveryId) throw new HttpError(400, "deliveryId required");

  const rows = await readTableRows("deliveries");
  const hit = rows.find((r) => String(r.data.id) === deliveryId);
  if (!hit) throw new HttpError(404, "Delivery not found");
  const holder = String(hit.data.runr_id ?? "");
  if (holder && holder !== user.sub) throw new HttpError(409, "Another runner already accepted this delivery");
  if (hit.data.status !== "offered" && holder !== user.sub) throw new HttpError(409, "Delivery is no longer available");

  await update("deliveries", { id: deliveryId }, { runr_id: user.sub, status: "accepted" }, [hit]);

  const confirm = (await readTableRows("deliveries")).find((r) => String(r.data.id) === deliveryId);
  if (String(confirm?.data.runr_id ?? "") !== user.sub) {
    throw new HttpError(409, "Another runner already accepted this delivery");
  }

  const orderPatch: Record<string, unknown> = { status: "runr_assigned", runr_id: user.sub };
  if (accessNotice) orderPatch.access_notice = accessNotice;
  await update("orders", { id: String(hit.data.order_id) }, orderPatch);
  return json(req, { delivery: confirm?.data });
});
