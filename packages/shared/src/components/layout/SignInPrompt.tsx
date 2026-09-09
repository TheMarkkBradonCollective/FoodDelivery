"use client";

import { useState } from "react";
import type { UserRole } from "../../types/index";
import { authenticate, getAppForRole } from "../../lib/auth";
import { signOut } from "../../lib/supabase/auth";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { useAppStore } from "../../store/create-app-store";

const WELCOME: Record<UserRole, { highlight: string; line: string; pills: string[]; account: string }> = {
  customer: {
    highlight: "need.",
    line: "Get what you",
    pills: ["Discover", "Order", "Track", "Receive"],
    account: "PORTER",
  },
  runr: {
    highlight: "time.",
    line: "Pick your place. Run your",
    pills: ["Choose", "RUN", "Deliver", "Earn"],
    account: "RUNR",
  },
  business: {
    highlight: "grow.",
    line: "Sell. Manage.",
    pills: ["Sell", "Dispatch", "Fulfill", "Grow"],
    account: "VENDR",
  },
  staff: {
    highlight: "chat.",
    line: "Quick status. Shared",
    pills: ["Status", "Chat", "Alerts", "Desktop"],
    account: "STAFF",
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
    <div className="brand-hero signin-screen">
      <div className="brand-blob" style={{ left: "-4rem", top: "2.5rem", width: "10rem", height: "10rem", background: "rgb(107 143 90 / 0.3)" }} />
      <div className="brand-blob" style={{ right: "-2.5rem", top: "8rem", width: "7rem", height: "7rem", background: "rgb(160 248 120 / 0.25)" }} />
      <div className="brand-blob" style={{ left: "2rem", bottom: "10rem", width: "4rem", height: "4rem", background: "rgb(255 255 255 / 0.1)" }} />

      <div className="signin-hero">
        <p className="signin-brand">{appName}</p>
        <h1 className="signin-headline">
          {copy.line}
          <span className="signin-chip">{copy.highlight}</span>
        </h1>
        <div className="signin-pills">
          {copy.pills.map((pill, i) => (
            <span key={pill} className={`pill ${i % 2 === 0 ? "signin-pill-lime" : "signin-pill-ghost"}`}>
              {pill}
            </span>
          ))}
        </div>
      </div>

      <div className="signin-sheet">
        {!isSupabaseConfigured() ? (
          <p className="signin-copy">
            Supabase is not configured for this build. Add your project URL and publishable key.
          </p>
        ) : (
          <>
            <p className="signin-title">Sign in to continue</p>
            <p className="signin-copy">
              Use your {copy.account} account. Marketplace data loads after sign-in.
            </p>
            <form onSubmit={handleSubmit} className="signin-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="Email"
                className="signin-field"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Password"
                className="signin-field"
              />
              {error && <p className="signin-error">{error}</p>}
              <button type="submit" className="signin-cta" disabled={loading}>
                {loading ? "Signing in..." : "Get started"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
