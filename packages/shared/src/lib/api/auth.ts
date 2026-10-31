import type { AuthSession } from "../auth";
import type { UserRole } from "../../types/index";
import { apiFetch, getAuthToken, setAuthToken } from "./client";
import { isApiConfigured } from "./config";
import { mapApiUser, resolveAppUser } from "./user";

export async function sessionToAuthSession(payload: {
  token: string;
  user: Record<string, unknown>;
}): Promise<AuthSession> {
  return {
    user: mapApiUser(payload.user),
    token: payload.token,
    loggedInAt: new Date().toISOString(),
  };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ success: true; session: AuthSession } | { success: false; error: string }> {
  if (!isApiConfigured()) {
    return {
      success: false,
      error: "API is not configured. Set NEXT_PUBLIC_API_URL for live data.",
    };
  }

  try {
    const data = await apiFetch<{ token: string; user: Record<string, unknown> }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      },
      false,
    );
    setAuthToken(data.token);
    return { success: true, session: await sessionToAuthSession(data) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Sign-in failed",
    };
  }
}

export async function signOut(): Promise<void> {
  setAuthToken(null);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  role: UserRole,
): Promise<{ success: true; session: AuthSession } | { success: false; error: string }> {
  if (!isApiConfigured()) {
    return { success: false, error: "API is not configured for this build." };
  }
  if (password.length < 8) {
    return { success: false, error: "Use a password with at least 8 characters." };
  }
  try {
    const data = await apiFetch<{ token: string; user: Record<string, unknown> }>(
      "/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim() || email.split("@")[0],
          role,
        }),
      },
      false,
    );
    setAuthToken(data.token);
    return { success: true, session: await sessionToAuthSession(data) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Sign-up failed",
    };
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isApiConfigured()) {
    return { success: false, error: "API is not configured for this build." };
  }
  try {
    await apiFetch(
      "/auth/reset-request",
      { method: "POST", body: JSON.stringify({ email: email.trim() }) },
      false,
    );
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Reset request failed",
    };
  }
}

export async function getCurrentAuthSession(): Promise<AuthSession | null> {
  if (!isApiConfigured()) return null;
  try {
    const data = await apiFetch<{ user: Record<string, unknown> }>("/auth/me");
    const token = getAuthToken();
    if (!token) return null;
    return {
      user: mapApiUser(data.user),
      token,
      loggedInAt: new Date().toISOString(),
    };
  } catch {
    setAuthToken(null);
    return null;
  }
}

export { resolveAppUser };
