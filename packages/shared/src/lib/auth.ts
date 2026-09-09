import type { User, UserRole } from "../types/index";
import { signInWithEmail as supabaseSignIn } from "./supabase/auth";

export interface AuthSession {
  user: User;
  token: string;
  loggedInAt: string;
}

export async function authenticate(
  email: string,
  password: string
): Promise<{ success: true; session: AuthSession } | { success: false; error: string }> {
  return supabaseSignIn(email, password);
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    customer: "PORTER Customer",
    runr: "RUNR Delivery",
    business: "VENDR Business",
    staff: "Platform Staff",
  };
  return labels[role];
}

export function getAppForRole(role: UserRole): string {
  const apps: Record<UserRole, string> = {
    customer: "PORTER",
    runr: "RUNR",
    business: "VENDR",
    staff: "STAFF",
  };
  return apps[role];
}
