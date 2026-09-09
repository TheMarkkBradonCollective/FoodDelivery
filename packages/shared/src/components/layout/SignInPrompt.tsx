"use client";

import { useState } from "react";
import type { UserRole } from "../../types/index";
import { authenticate, getAppForRole } from "../../lib/auth";
import { signOut } from "../../lib/supabase/auth";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { PrimaryButton } from "../ui/PrimaryButton";
import { useAppStore } from "../../store/create-app-store";

const WELCOME: Record<UserRole, { highlight: string; line: string; pills: string[] }> = {
  customer: {
    highlight: "need.",
    line: "Get what you",
    pills: ["Discover", "Order", "Track", "Receive"],
  },
  runr: {
    highlight: "time.",
    line: "Pick your place. Run your",
    pills: ["Choose", "RUN", "Deliver", "Earn"],
  },
  business: {
    highlight: "grow.",
    line: "Sell. Manage.",
    pills: ["Sell", "Dispatch", "Fulfill", "Grow"],
  },
  staff: {
    highlight: "operate.",
    line: "Monitor. Manage.",
    pills: ["Users", "Coverage", "Orders", "Apps"],
  },
};

export function SignInPrompt({ role }: { role: UserRole }) {
  const appName = role === "staff" ? "Staff Portal" : getAppForRole(role);
  const copy = WELCOME[role];
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

  return (
    <div className="brand-hero relative flex min-h-[100dvh] flex-col overflow-hidden">
      <div className="brand-blob -left-16 top-10 h-40 w-40 bg-runr-accent/30" />
      <div className="brand-blob -right-10 top-32 h-28 w-28 bg-runr-accent-bright/25" />
      <div className="brand-blob bottom-40 left-8 h-16 w-16 bg-white/10" />

      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-4 pt-16 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-runr-accent-bright">
          {appName}
        </p>
        <h1 className="mt-4 max-w-sm text-4xl font-extrabold leading-[1.05] tracking-tight">
          {copy.line}{" "}
          <span className="inline-block rounded-xl bg-white px-2 py-0.5 text-runr-ink">{copy.highlight}</span>
        </h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {copy.pills.map((pill, i) => (
            <span
              key={pill}
              className={`pill ${
                i % 2 === 0 ? "bg-runr-accent-bright text-runr-ink" : "bg-white/15 text-white"
              }`}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 rounded-t-[2rem] bg-[#F6F1E8] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-7 text-[#1A1224]">
        {!isSupabaseConfigured() ? (
          <p className="text-sm text-[var(--muted)]">
            Supabase is not configured for this build. Add your project URL and publishable key.
          </p>
        ) : (
          <>
            <p className="text-lg font-extrabold tracking-tight">Sign in to continue</p>
            <p className="mt-1 text-sm text-[#6F6678]">
              Use your RUNR account. Marketplace data loads after sign-in.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="Email"
                className="w-full rounded-[1.25rem] border-[1.5px] border-[#E8E0D4] bg-white px-4 py-3 text-sm text-[#1A1224] outline-none focus:border-[#6B3FA0]"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Password"
                className="w-full rounded-[1.25rem] border-[1.5px] border-[#E8E0D4] bg-white px-4 py-3 text-sm text-[#1A1224] outline-none focus:border-[#6B3FA0]"
              />
              {error && (
                <p className="rounded-runr-md bg-runr-critical-muted px-3 py-2 text-sm text-runr-critical">
                  {error}
                </p>
              )}
              <PrimaryButton type="submit" className="w-full !bg-[#6B3FA0] !text-white hover:!bg-[#5A3282]" size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Get started"}
              </PrimaryButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
