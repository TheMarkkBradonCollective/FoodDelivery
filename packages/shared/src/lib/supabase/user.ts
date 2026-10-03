import type { User as SupabaseUser } from "@supabase/supabase-js";
import { STAFF_TITLES, type StaffTitle, type User, type UserRole } from "../../types/index";
import { parseRunnerAccess } from "../delivery-access";
import { getSupabaseClient } from "./client";

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

function roleFromMetadata(user: SupabaseUser): UserRole | null {
  return (
    normalizeRole(user.app_metadata?.role) ??
    normalizeRole(user.user_metadata?.role) ??
    null
  );
}

function nameFromMetadata(user: SupabaseUser): string {
  const meta = user.user_metadata ?? {};
  if (typeof meta.name === "string" && meta.name.trim()) return meta.name.trim();
  if (typeof meta.full_name === "string" && meta.full_name.trim()) {
    return meta.full_name.trim();
  }
  return user.email?.split("@")[0] ?? "User";
}

export async function resolveAppUser(user: SupabaseUser): Promise<User> {
  let role = roleFromMetadata(user);
  let name = nameFromMetadata(user);
  let staffTitle =
    staffTitleFromValue(user.app_metadata?.role) ??
    staffTitleFromValue(user.user_metadata?.role);
  let avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : undefined;
  let accessPreference = parseRunnerAccess(user.user_metadata?.access_preference);

  try {
    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      role = normalizeRole(profile.role) ?? role;
      staffTitle = staffTitleFromValue(profile.role) ?? staffTitle;
      if (typeof profile.name === "string" && profile.name.trim()) {
        name = profile.name.trim();
      }
      if (typeof profile.avatar_url === "string" && profile.avatar_url.trim()) {
        avatarUrl = profile.avatar_url;
      }
    }

    const { data: accessRow, error: accessError } = await supabase
      .from("profiles")
      .select("access_preference")
      .eq("id", user.id)
      .maybeSingle();
    if (!accessError) {
      accessPreference = parseRunnerAccess(accessRow?.access_preference) ?? accessPreference;
    }
  } catch {
    // profiles table may not exist yet — metadata is enough for auth
  }

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    role: role ?? "customer",
    staffTitle,
    avatarUrl,
    accessPreference,
  };
}
