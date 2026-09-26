"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UserRole } from "../../types/index";
import { authenticate, getAppForRole, registerAccount, sendPasswordReset } from "../../lib/auth";
import { signOut } from "../../lib/supabase/auth";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { useAppStore } from "../../store/create-app-store";
import { APP_COPY } from "../../lib/apps";
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
    brand: APP_COPY.porter.shortName,
    line: "Get what you",
    highlight: "need.",
    pills: APP_COPY.porter.flow.map((label, i) => ({ label, lime: i % 2 === 0 })),
    grid: true,
    showMark: true,
  },
  runr: {
    brand: APP_COPY.runr.shortName,
    line: "Choose your window.",
    highlight: "Earn per drop.",
    pills: APP_COPY.runr.flow.map((label, i) => ({ label, lime: i % 2 === 0 })),
    showMark: true,
  },
  business: {
    brand: APP_COPY.vendr.shortName,
    line: "Set capacity.",
    highlight: "Serve your queue.",
    pills: APP_COPY.vendr.flow.slice(0, 4).map((label, i) => ({ label, lime: i % 2 === 0 })),
  },
  staff: {
    brand: APP_COPY.staff.shortName,
    line: "Run the",
    highlight: "marketplace.",
    pills: APP_COPY.staff.flow.map((label, i) => ({ label, lime: i % 2 === 0 })),
  },
};

type Mode = "signin" | "signup" | "forgot";

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Email or password is incorrect.";
  }
  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return "Check your inbox to verify this email, then sign in.";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }
  return message;
}

export function SignInPrompt({ role }: { role: UserRole }) {
  const appName = role === "staff" ? "Porter Command Portal" : getAppForRole(role);
  const copy = WELCOME[role];
  const setUser = useAppStore((s) => s.setUser);
  const showToast = useAppStore((s) => s.showToast);
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const result = await authenticate(email, password);
    setLoading(false);
    if (!result.success) {
      setError(friendlyAuthError(result.error));
      return;
    }
    if (result.session.user.role !== role) {
      await signOut();
      setError(`This account is for ${getAppForRole(result.session.user.role)}, not ${appName}.`);
      return;
    }
    setUser(result.session.user);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    setLoading(true);
    const result = await registerAccount(email, password, name, role);
    setLoading(false);
    if (!result.success) {
      if (result.error.toLowerCase().includes("check your email")) {
        setInfo(result.error);
        setMode("signin");
        return;
      }
      setError(friendlyAuthError(result.error));
      return;
    }
    if (result.session.user.role !== role) {
      await signOut();
      setError(`This account is for ${getAppForRole(result.session.user.role)}, not ${appName}.`);
      return;
    }
    setUser(result.session.user);
    showToast(`Welcome to ${appName}`);
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const result = await sendPasswordReset(email);
    setLoading(false);
    if (!result.success) {
      setError(friendlyAuthError(result.error));
      return;
    }
    setInfo("If that email is registered, a reset link is on its way. Check your inbox.");
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
            {mode !== "forgot" && (
            <div className="signin-tabs" role="tablist" aria-label="Account">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signin"}
                className={`signin-tab ${mode === "signin" ? "is-active" : ""}`}
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setInfo("");
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                className={`signin-tab ${mode === "signup" ? "is-active" : ""}`}
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setInfo("");
                }}
              >
                Create account
              </button>
            </div>
            )}

            {mode === "signin" && (
              <>
                <p className="signin-title">Sign in to continue</p>
                <p className="signin-copy">Use your Porter account. Marketplace data loads after sign-in.</p>
                <form onSubmit={handleSignIn} className="signin-form">
                  <label className="field-label" htmlFor="auth-email">
                    Email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@email.com"
                    className="signin-field"
                  />
                  <label className="field-label" htmlFor="auth-password">
                    Password
                  </label>
                  <div className="signin-field-row">
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Password"
                      className="signin-field"
                    />
                    <button
                      type="button"
                      className="signin-eye"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {error && <p className="signin-error">{error}</p>}
                  {info && <p className="signin-info">{info}</p>}
                  <button type="submit" className="signin-cta" disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                </form>
                <button
                  type="button"
                  className="signin-link"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                    setInfo("");
                  }}
                >
                  Forgot password?
                </button>
              </>
            )}

            {mode === "signup" && (
              <>
                <p className="signin-title">Create your {appName} account</p>
                <p className="signin-copy">Same Runner login, scoped to this app. You will stay signed in on this device.</p>
                <form onSubmit={handleSignUp} className="signin-form">
                  <label className="field-label" htmlFor="signup-name">
                    Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className="signin-field"
                  />
                  <label className="field-label" htmlFor="signup-email">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@email.com"
                    className="signin-field"
                  />
                  <label className="field-label" htmlFor="signup-password">
                    Password
                  </label>
                  <div className="signin-field-row">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className="signin-field"
                    />
                    <button
                      type="button"
                      className="signin-eye"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {error && <p className="signin-error">{error}</p>}
                  <button type="submit" className="signin-cta" disabled={loading}>
                    {loading ? "Creating account…" : "Create account"}
                  </button>
                </form>
              </>
            )}

            {mode === "forgot" && (
              <>
                <p className="signin-title">Reset your password</p>
                <p className="signin-copy">We will email a reset link if this address has a Porter account.</p>
                <form onSubmit={handleForgot} className="signin-form">
                  <label className="field-label" htmlFor="reset-email">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@email.com"
                    className="signin-field"
                  />
                  {error && <p className="signin-error">{error}</p>}
                  {info && <p className="signin-info">{info}</p>}
                  <button type="submit" className="signin-cta" disabled={loading}>
                    {loading ? "Sending…" : "Send reset link"}
                  </button>
                </form>
                <button
                  type="button"
                  className="signin-link"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setInfo("");
                  }}
                >
                  Back to sign in
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export const AuthScreen = SignInPrompt;
