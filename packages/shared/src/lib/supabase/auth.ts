import type { Session } from "@supabase/supabase-js";
import type { AuthSession } from "../auth";
import { getSupabaseClient } from "./client";
import { isSupabaseConfigured } from "./config";
import { resolveAppUser } from "./user";

export async function sessionToAuthSession(session: Session): Promise<AuthSession> {
  const user = await resolveAppUser(session.user);
  return {
    user,
    token: session.access_token,
    loggedInAt: new Date().toISOString(),
  };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: true; session: AuthSession } | { success: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.session) {
    return { success: false, error: "Sign-in failed. No session was returned." };
  }

  return {
    success: true,
    session: await sessionToAuthSession(data.session),
  };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await getSupabaseClient().auth.signOut();
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  role: import("../../types/index").UserRole
): Promise<{ success: true; session: AuthSession } | { success: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured for this build." };
  }
  if (password.length < 8) {
    return { success: false, error: "Use a password with at least 8 characters." };
  }
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { name: name.trim() || email.split("@")[0], role },
    },
  });
  if (error) return { success: false, error: error.message };
  if (!data.session) {
    return {
      success: false,
      error: "Account created. Check your email to verify, then sign in.",
    };
  }
  return { success: true, session: await sessionToAuthSession(data.session) };
}

export async function requestPasswordReset(
  email: string
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured for this build." };
  }
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getCurrentAuthSession(): Promise<AuthSession | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error || !data.session) return null;

  return sessionToAuthSession(data.session);
}
