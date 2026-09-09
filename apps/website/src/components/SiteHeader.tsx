"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { getAppForRole } from "@runr/shared/lib/auth";
import { LogIn, User, Shield } from "lucide-react";

const nav = [
  { href: "/download", label: "Download Apps" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#ecosystem", label: "Ecosystem" },
  { href: "/#company", label: "Company" },
];

export function SiteHeader() {
  const { session, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[#F6F1E8]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#7048F8] text-sm font-black text-white">
            R
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">RUNR</p>
            <p className="text-[10px] text-[var(--muted)]">Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              {label}
            </a>
          ))}
          {!isLoading && session?.user.role === "staff" && (
            <Link
              href="/staff"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Staff Portal
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!isLoading && session ? (
            <>
              {session.user.role === "staff" ? (
                <Link
                  href="/staff"
                  className="hidden items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium sm:inline-flex"
                >
                  <Shield className="h-4 w-4" />
                  Manage
                </Link>
              ) : (
                <Link
                  href="/account"
                  className="hidden items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium sm:inline-flex"
                >
                  <User className="h-4 w-4" />
                  {getAppForRole(session.user.role)}
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#7048F8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5C36E0]"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
