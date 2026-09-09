"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getCurrentAuthSession, signOut } from "@runr/shared/lib/supabase/auth";
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6B3FA0] border-t-transparent" />
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

    const expectedRole = mode === "staff" ? "staff" : undefined;
    if (expectedRole) {
      const authSession = await getCurrentAuthSession();
      if (authSession?.user.role !== "staff") {
        await signOut();
        setError("This account does not have staff access.");
        return;
      }
    }

    router.push(mode === "staff" ? "/staff/" : "/account/");
  }

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
              mode === "app" ? "bg-[#6B3FA0] text-white" : "text-[var(--muted)]"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            App Users
          </button>
          <button
            type="button"
            onClick={() => setMode("staff")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              mode === "staff" ? "bg-[#3D2458] text-white" : "text-[var(--muted)]"
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
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[#6B3FA0]"
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
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[#6B3FA0]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white disabled:opacity-50 ${
              mode === "staff" ? "bg-[#3D2458] hover:bg-[#2A1B3D]" : "bg-[#6B3FA0] hover:bg-[#5A3282]"
            }`}
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link href="/" className="hover:text-[#6B3FA0]">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
