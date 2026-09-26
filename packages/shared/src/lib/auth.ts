import type { User, UserRole } from "../types/index";
import { APP_COPY, roleToApp } from "./apps";
import { signInWithEmail as supabaseSignIn, signUpWithEmail, requestPasswordReset } from "./supabase/auth";

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

export async function registerAccount(
  email: string,
  password: string,
  name: string,
  role: UserRole
) {
  return signUpWithEmail(email, password, name, role);
}

export async function sendPasswordReset(email: string) {
  return requestPasswordReset(email);
}

export function getRoleLabel(role: UserRole): string {
  const copy = APP_COPY[roleToApp(role)];
  return `${copy.shortName} · ${copy.role}`;
}

export function getAppForRole(role: UserRole): string {
  return APP_COPY[roleToApp(role)].shortName;
}
