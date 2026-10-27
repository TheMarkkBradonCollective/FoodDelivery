import { STAFF_TITLES, type StaffTitle, type User, type UserRole } from "../../types/index";
import { parseRunnerAccess } from "../delivery-access";

const VALID_ROLES: UserRole[] = ["customer", "runr", "business", "staff"];

export function staffTitleFromValue(value: unknown): StaffTitle | undefined {
  if (typeof value !== "string") return undefined;
  const title = value.toLowerCase();
  return (STAFF_TITLES as readonly string[]).includes(title) ? (title as StaffTitle) : undefined;
}

export function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;
  const role = value.toLowerCase();
  if (role === "staff" || staffTitleFromValue(role)) return "staff";
  return (VALID_ROLES as readonly string[]).includes(role) ? (role as UserRole) : null;
}

/** Maps a profiles row from the API to the app's User. */
export function profileToUser(row: Record<string, unknown>): User {
  const email = String(row.email ?? "");
  return {
    id: String(row.id),
    name: String(row.name || email.split("@")[0] || "User"),
    email,
    role: normalizeRole(row.role) ?? "customer",
    staffTitle: staffTitleFromValue(row.role),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    accessPreference: parseRunnerAccess(row.access_preference),
  };
}
