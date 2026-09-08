import type { User, UserRole } from "../types/index";

export interface AuthSession {
  user: User;
  token: string;
  loggedInAt: string;
}

export function authenticate(
  _email: string,
  _password: string
): { success: true; session: AuthSession } | { success: false; error: string } {
  return {
    success: false,
    error: "Sign-in is not configured yet. Supabase auth will be connected soon.",
  };
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
    staff: "Admin Portal",
  };
  return apps[role];
}
