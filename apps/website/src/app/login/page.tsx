"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getDemoAccounts } from "@runr/shared/lib/auth";
import { LogIn, Shield, Smartphone } from "lucide-react";

export default function LoginPage() {
  const { login, session } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"app" | "staff">("app");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace(session.user.role === "staff" ? "/staff/" : "/account/");
    }
  }, [session, router]);

  if (session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff4f00] border-t-transparent" />
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
    const cred = getDemoAccounts().find((a) => a.email === email.trim().toLowerCase());
    if (cred?.role === "Staff" || email.trim().toLowerCase() === "staff@runr.com") {
      router.push("/staff/");
    } else {
      router.push("/account/");
    }
  }

  function fillDemo(account: (typeof demoAccounts)[0]) {
    setEmail(account.email);
    setPassword(account.password);
    if (account.role === "Staff") setMode("staff");
  }

  const demoAccounts = getDemoAccounts();
  const filteredDemos =
    mode === "staff"
      ? demoAccounts.filter((a) => a.role === "Staff")
      : demoAccounts.filter((a) => a.role !== "Staff");

  return (
    <div className="min-h-[80vh] bg-[var(--surface)] py-16">
      <div className="mx-auto max-w-md px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in to RUNR</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            One account across PORTER, RUNR, and VENDR — managed here on the web.
          </p>
        </div>

        <div className="mt-8 flex rounded-xl border border-[var(--border)] bg-white p-1">
          <button
            type="button"
            onClick={() => setMode("app")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              mode === "app" ? "bg-[#ff4f00] text-white" : "text-[var(--muted)]"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            App Users
          </button>
          <button
            type="button"
            onClick={() => setMode("staff")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              mode === "staff" ? "bg-[#0a0a0a] text-white" : "text-[var(--muted)]"
            }`}
          >
            <Shield className="h-4 w-4" />
            Staff Portal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-[var(--border)] bg-white p-6">
          {mode === "staff" && (
            <p className="rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-600">
              Staff sign in to manage the platform, apps, users, and marketplace operations.
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
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[#ff4f00]"
              placeholder={mode === "staff" ? "staff@runr.com" : "you@example.com"}
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
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[#ff4f00]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 ${
              mode === "staff" ? "bg-[#0a0a0a] hover:bg-zinc-800" : "bg-[#ff4f00] hover:bg-[#e64600]"
            }`}
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-dashed border-[var(--border)] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Demo accounts
          </p>
          <div className="mt-3 space-y-2">
            {filteredDemos.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemo(account)}
                className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-left text-sm hover:bg-[var(--surface)]"
              >
                <span>
                  <strong>{account.app}</strong>
                  <span className="ml-2 text-[var(--muted)]">{account.email}</span>
                </span>
                <span className="text-xs text-[var(--muted)]">Use</span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link href="/" className="hover:text-[#ff4f00]">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
