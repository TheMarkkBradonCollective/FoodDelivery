"use client";

import { useState } from "react";
import type { UserRole } from "../../types/index";
import { authenticate, getAppForRole } from "../../lib/auth";
import { signOut } from "../../lib/supabase/auth";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { useAppStore } from "../../store/create-app-store";
import { BrandMark } from "../ui/BrandMark";

const WELCOME: Record<
  UserRole,
  {
    brand: string;
    line: string;
    stack?: string[];
    highlight: string;
    pills: { label: string; lime: boolean }[];
    grid?: boolean;
    showMark?: boolean;
  }
> = {
  customer: {
    brand: "PORTER",
    line: "Get what you",
    highlight: "need.",
    pills: [
      { label: "Discover", lime: true },
      { label: "Track", lime: true },
      { label: "Order", lime: false },
      { label: "Receive", lime: false },
    ],
    grid: true,
    showMark: true,
  },
  runr: {
    brand: "RUNR",
    line: "Run your",
    stack: ["Pick your place."],
    highlight: "time.",
    pills: [
      { label: "Choose", lime: true },
      { label: "RUN", lime: false },
      { label: "Deliver", lime: true },
      { label: "Eat", lime: false },
    ],
    showMark: true,
  },
  business: {
    brand: "VENDR",
    line: "Sell. Manage.",
    highlight: "grow.",
    pills: [
      { label: "Sell", lime: true },
      { label: "Dispatch", lime: false },
      { label: "Fulfill", lime: true },
      { label: "Grow", lime: false },
    ],
  },
  staff: {
    brand: "STAFF PORTAL",
    line: "Quick status. Shared",
    highlight: "chat.",
    pills: [
      { label: "Status", lime: true },
      { label: "Chat", lime: false },
      { label: "Alerts", lime: true },
      { label: "Desktop", lime: false },
    ],
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
        <p className="signin-brand">{copy.brand}</p>
        {copy.showMark && <BrandMark className="signin-mark" />}
        <h1 className={`signin-headline ${copy.stack ? "signin-headline--stack" : ""}`}>
          {copy.stack?.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <span>
            {copy.line} <span className="signin-chip">{copy.highlight}</span>
          </span>
        </h1>
        <div className={`signin-pills ${copy.grid ? "signin-pills-grid" : ""}`}>
          {copy.pills.map((pill) => (
            <span key={pill.label} className={`pill ${pill.lime ? "signin-pill-lime" : "signin-pill-ghost"}`}>
              {pill.label}
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
              Use your RUNR account. Marketplace data loads after sign-in.
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
