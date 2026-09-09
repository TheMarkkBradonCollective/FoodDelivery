"use client";

import { useState } from "react";
import type { UserRole } from "../../types/index";
import { authenticate, getAppForRole } from "../../lib/auth";
import { signOut } from "../../lib/supabase/auth";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { PrimaryButton } from "../ui/PrimaryButton";
import { useAppStore } from "../../store/create-app-store";

export function SignInPrompt({ role }: { role: UserRole }) {
  const appName = role === "staff" ? "Staff Portal" : getAppForRole(role);
  const setUser = useAppStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await authenticate(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (result.session.user.role !== role) {
      await signOut();
      setError(`This account is for ${getAppForRole(result.session.user.role)}, not ${appName}.`);
      return;
    }

    setUser(result.session.user);
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-6 py-12">
        <div className="max-w-sm text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-runr-primary">
            {appName}
          </p>
          <h1 className="mt-3 text-2xl font-bold">Sign in to continue</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Supabase is not configured for this build. Add your project URL and publishable key.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-runr-primary">
            {appName}
          </p>
          <h1 className="mt-3 text-2xl font-bold">Sign in to continue</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Use your RUNR account. Marketplace data loads after sign-in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-runr-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-runr-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
            />
          </div>

          {error && (
            <p className="rounded-runr-md bg-runr-critical-muted px-3 py-2 text-sm text-runr-critical">
              {error}
            </p>
          )}

          <PrimaryButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
