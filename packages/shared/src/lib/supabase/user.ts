import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User, UserRole } from "../../types/index";
import { getSupabaseClient } from "./client";

const VALID_ROLES: UserRole[] = ["customer", "runr", "business", "staff"];

function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;
  const role = value.toLowerCase() as UserRole;
  return VALID_ROLES.includes(role) ? role : null;
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
  let avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : undefined;

  try {
    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      role = normalizeRole(profile.role) ?? role;
      if (typeof profile.name === "string" && profile.name.trim()) {
        name = profile.name.trim();
      }
      if (typeof profile.avatar_url === "string" && profile.avatar_url.trim()) {
        avatarUrl = profile.avatar_url;
      }
    }
  } catch {
    // profiles table may not exist yet — metadata is enough for auth
  }

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    role: role ?? "customer",
    avatarUrl,
  };
}
