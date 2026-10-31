import type { User } from "../../types/index";
import { STAFF_TITLES, type StaffTitle, type UserRole } from "../../types/index";
import { parseRunnerAccess } from "../delivery-access";
import { apiFetch } from "./client";
import { isApiConfigured } from "./config";

const VALID_ROLES: UserRole[] = ["customer", "runr", "business", "staff"];

export function staffTitleFromValue(value: unknown): StaffTitle | undefined {
  if (typeof value !== "string") return undefined;
  const title = value.toLowerCase();
  return (STAFF_TITLES as readonly string[]).includes(title) ? (title as StaffTitle) : undefined;
}

function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;
  const role = value.toLowerCase();
  if (role === "staff" || staffTitleFromValue(role)) return "staff";
  return (VALID_ROLES as readonly string[]).includes(role) ? (role as UserRole) : null;
}

export function mapApiUser(raw: Record<string, unknown>): User {
  const role = normalizeRole(raw.role) ?? "customer";
  const staffTitle =
    staffTitleFromValue(raw.staffTitle) ?? staffTitleFromValue(raw.role);
  return {
    id: String(raw.id),
    name: String(raw.name ?? raw.email ?? "User"),
    email: String(raw.email ?? ""),
    role,
    staffTitle,
    avatarUrl: raw.avatarUrl ? String(raw.avatarUrl) : undefined,
    accessPreference: parseRunnerAccess(raw.accessPreference),
  };
}

export async function resolveAppUser(userId: string): Promise<User> {
  if (!isApiConfigured()) {
    return { id: userId, name: "User", email: "", role: "customer" };
  }
  const data = await apiFetch<{ user: Record<string, unknown> }>("/auth/me");
  return mapApiUser(data.user);
}
