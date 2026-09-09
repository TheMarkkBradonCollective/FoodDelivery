"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getCurrentAuthSession, signOut } from "@runr/shared/lib/supabase/auth";
import { sendPasswordReset } from "@runr/shared/lib/auth";
import { Eye, EyeOff, LogIn, Shield, Smartphone } from "lucide-react";

export default function LoginPage() {
  const { login, session } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"app" | "staff">("app");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetNote, setResetNote] = useState("");

  useEffect(() => {
    if (session) {
      router.replace(session.user.role === "staff" ? "/staff/" : "/account/");
    }
  }, [session, router]);

  if (session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7048F8] border-t-transparent" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    const authSession = await getCurrentAuthSession();
    const role = authSession?.user.role;
    if (mode === "staff" && role !== "staff") {
      await signOut();
      setError("This account does not have staff access. Sign in as App Users for billing and settings.");
      return;
    }

    router.push(role === "staff" ? "/staff/" : "/account/");
  }

  return (
    <div className="min-h-[80vh] bg-[var(--surface)] py-16">
      <div className="mx-auto max-w-md px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in to RUNR</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Customers, RUNRs, and businesses sign in for billing, profile, preferences, and
            ratings. Only staff can work the marketplace from this site — or from the STAFF app.
          </p>
        </div>

        <div className="mt-8 flex rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-1">
          <button
            type="button"
            onClick={() => setMode("app")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              mode === "app" ? "bg-[#7048F8] text-white" : "text-[var(--muted)]"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            App Users
          </button>
          <button
            type="button"
            onClick={() => setMode("staff")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              mode === "staff" ? "bg-[#2A1478] text-white" : "text-[var(--muted)]"
            }`}
          >
            <Shield className="h-4 w-4" />
            Staff Portal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6">
          {mode === "staff" && (
            <p className="rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-600">
              Staff sign in to manage orders, coverage, and users here or in the STAFF app.
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[#7048F8]"
              placeholder={mode === "staff" ? "staff@runr.com" : "you@example.com"}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 pr-12 text-sm outline-none focus:border-[#7048F8]"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-[var(--muted)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          {resetNote && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{resetNote}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white disabled:opacity-50 ${
              mode === "staff" ? "bg-[#2A1478] hover:bg-[#1A0C4C]" : "bg-[#7048F8] hover:bg-[#5C36E0]"
            }`}
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-center text-sm font-semibold text-[#7048F8]"
          onClick={async () => {
            setError("");
            setResetNote("");
            if (!email.trim()) {
              setError("Enter your email first, then request a reset link.");
              return;
            }
            const result = await sendPasswordReset(email);
            if (!result.success) {
              setError(result.error);
              return;
            }
            setResetNote("If that email is registered, a reset link is on its way.");
          }}
        >
          Forgot password?
        </button>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link href="/" className="hover:text-[#7048F8]">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
