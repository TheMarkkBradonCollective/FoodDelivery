import type { ProfileRow, Sql } from "./db";
import { rows } from "./db";

export function isStaff(profile: ProfileRow): boolean {
  return (
    profile.role === "staff" ||
    ["support", "moderator", "administrator", "manager", "director", "founder"].includes(profile.role)
  );
}

export async function ownsBusiness(sql: Sql, userId: string, businessId: string): Promise<boolean> {
  return rows(await sql`
    select 1 from businesses where id = ${businessId}::uuid and owner_id = ${userId}::uuid limit 1
  `).length > 0;
}

export async function canReadOrder(
  sql: Sql,
  profile: ProfileRow,
  order: { customer_id: string; runr_id: string | null; business_id: string },
): Promise<boolean> {
  if (order.customer_id === profile.id || order.runr_id === profile.id) return true;
  if (isStaff(profile)) return true;
  if (profile.role === "runr") return true;
  return ownsBusiness(sql, profile.id, order.business_id);
}
