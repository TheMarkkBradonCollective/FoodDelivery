"use client";

import type { UserRole } from "../../types/index";
import { getAppForRole } from "../../lib/auth";

export function SignInPrompt({ role }: { role: UserRole }) {
  const appName = role === "staff" ? "Staff Portal" : getAppForRole(role);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-6 py-12">
      <div className="max-w-sm text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-runr-primary">
          {appName}
        </p>
        <h1 className="mt-3 text-2xl font-bold">Sign in to continue</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Account sign-in will connect to Supabase soon. Once linked, your profile,
          orders, and marketplace data will load here.
        </p>
      </div>
    </div>
  );
}
