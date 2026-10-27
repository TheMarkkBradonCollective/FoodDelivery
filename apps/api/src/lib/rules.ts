/**
 * Row-level rules ported from docs/supabase/complete-schema.sql RLS policies.
 * Every API read and write goes through these; clients never touch the Sheet directly.
 */
import type { Claims } from "./auth";
import { publicProfile } from "./auth";
import type { Row } from "./sheets";
import { HttpError } from "./http";

export interface Ctx {
  user: Claims;
  businesses: Row[];
}

const isStaff = (c: Ctx) => c.user.role === "staff";
const ownsBusiness = (c: Ctx, businessId: unknown) =>
  c.businesses.some((b) => String(b.id) === String(businessId) && String(b.owner_id) === c.user.sub);
const me = (c: Ctx, id: unknown) => String(id ?? "") === c.user.sub;

/** Which rows of each table a user may read. */
export function canRead(table: string, row: Row, c: Ctx): boolean {
  switch (table) {
    case "orders":
      return me(c, row.customer_id) || me(c, row.runr_id) || ownsBusiness(c, row.business_id) || isStaff(c) || c.user.role === "runr";
    case "earnings":
      return me(c, row.runr_id) || isStaff(c);
    case "notifications":
      return me(c, row.user_id) || isStaff(c);
    case "favorites":
      return me(c, row.user_id);
    case "staff_messages":
      return isStaff(c);
    case "profiles":
      return true; // trimmed by shapeProfile
    default:
      return true; // businesses, menu_items, coverage_rules, runs, deliveries: any signed-in user
  }
}

/** Non-staff only see id/name/role/avatar of other profiles. */
export function shapeProfile(row: Row, c: Ctx): Row {
  const p = publicProfile(row);
  if (isStaff(c) || me(c, row.id)) return p;
  return { id: p.id, name: p.name, role: p.role, avatar_url: p.avatar_url };
}

/** May the user write `next` (merged row) given `prev` (existing row or null)? */
export function assertWrite(table: string, prev: Row | null, next: Row, c: Ctx): void {
  const ok = (() => {
    switch (table) {
      case "businesses":
        return isStaff(c) || (me(c, next.owner_id) && (!prev || me(c, prev.owner_id)));
      case "menu_items":
      case "coverage_rules":
        return isStaff(c) || (ownsBusiness(c, next.business_id) && (!prev || ownsBusiness(c, prev.business_id)));
      case "orders":
        if (!prev) return me(c, next.customer_id) || isStaff(c);
        return (
          me(c, prev.customer_id) || me(c, prev.runr_id) || ownsBusiness(c, prev.business_id) || isStaff(c) || c.user.role === "runr"
        );
      case "runs":
        if (!prev) return me(c, next.runr_id) || isStaff(c);
        return me(c, prev.runr_id) || ownsBusiness(c, prev.business_id) || isStaff(c);
      case "deliveries":
        return true; // del_write: any signed-in user (claims are guarded in /api/deliveries/accept)
      case "earnings":
        return !prev && (me(c, next.runr_id) || isStaff(c));
      case "notifications":
        // Owner manages own; runners/vendors/staff may create a notification for someone else.
        return prev ? me(c, prev.user_id) : true;
      case "favorites":
        return me(c, next.user_id);
      case "staff_messages":
        return !prev && isStaff(c) && me(c, next.author_id);
      case "profiles":
        return isStaff(c) || (me(c, next.id) && !!prev);
      default:
        return false;
    }
  })();
  if (!ok) throw new HttpError(403, `Not allowed to write ${table}`);
}

/** Columns a non-staff user may change on their own profile. */
export const SELF_PROFILE_FIELDS = new Set(["name", "avatar_url", "access_preference"]);
export const WRITABLE_TABLES = new Set([
  "businesses", "menu_items", "coverage_rules", "orders", "runs", "deliveries",
  "earnings", "notifications", "favorites", "staff_messages", "profiles",
]);
