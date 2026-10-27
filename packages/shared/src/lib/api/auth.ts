import type { AuthSession } from "../auth";
import type { UserRole } from "../../types/index";
import { api, getToken, setToken } from "./client";
import { isApiConfigured } from "./config";
import { profileToUser } from "./user";

interface AuthResponse {
  token: string;
  profile: Record<string, unknown>;
}

function toSession(res: AuthResponse): AuthSession {
  setToken(res.token);
  return { user: profileToUser(res.profile), token: res.token, loggedInAt: new Date().toISOString() };
}

const NOT_CONFIGURED = "The Portr API is not configured. Set NEXT_PUBLIC_API_URL.";
const message = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ success: true; session: AuthSession } | { success: false; error: string }> {
  if (!isApiConfigured()) return { success: false, error: NOT_CONFIGURED };
  try {
    return { success: true, session: toSession(await api<AuthResponse>("/api/auth/login", { body: { email, password } })) };
  } catch (e) {
    return { success: false, error: message(e) };
  }
}

export async function signOut(): Promise<void> {
  setToken(null);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  role: UserRole,
): Promise<{ success: true; session: AuthSession } | { success: false; error: string }> {
  if (!isApiConfigured()) return { success: false, error: NOT_CONFIGURED };
  try {
    return {
      success: true,
      session: toSession(await api<AuthResponse>("/api/auth/signup", { body: { email, password, name, role } })),
    };
  } catch (e) {
    return { success: false, error: message(e) };
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isApiConfigured()) return { success: false, error: NOT_CONFIGURED };
  try {
    await api("/api/auth/reset", { body: { email } });
    return { success: true };
  } catch (e) {
    return { success: false, error: message(e) };
  }
}

/** Restores the stored session (refreshing the token) or returns null. */
export async function getCurrentAuthSession(): Promise<AuthSession | null> {
  if (!isApiConfigured() || !getToken()) return null;
  try {
    return toSession(await api<AuthResponse>("/api/auth/me"));
  } catch {
    setToken(null);
    return null;
  }
}
