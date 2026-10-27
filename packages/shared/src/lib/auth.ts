import type { User, UserRole } from "../types/index";
import { APP_COPY, roleToApp } from "./apps";
import { isDemoMode } from "./api/config";
import { demoSession } from "./demo-auth";
import { signInWithEmail as apiSignIn, signUpWithEmail, requestPasswordReset } from "./api/auth";

export interface AuthSession {
  user: User;
  token: string;
  loggedInAt: string;
}

export async function authenticate(
  email: string,
  password: string,
  role: UserRole = "customer"
): Promise<{ success: true; session: AuthSession } | { success: false; error: string }> {
  if (isDemoMode()) return { success: true, session: demoSession(role, email) };
  return apiSignIn(email, password);
}

export async function registerAccount(
  email: string,
  password: string,
  name: string,
  role: UserRole
) {
  if (isDemoMode()) return { success: true as const, session: demoSession(role, email, name) };
  return signUpWithEmail(email, password, name, role);
}

export async function sendPasswordReset(email: string) {
  if (isDemoMode()) return { success: true as const };
  return requestPasswordReset(email);
}

export function getRoleLabel(role: UserRole): string {
  const copy = APP_COPY[roleToApp(role)];
  return `${copy.shortName} · ${copy.role}`;
}

export function getAppForRole(role: UserRole): string {
  return APP_COPY[roleToApp(role)].shortName;
}
