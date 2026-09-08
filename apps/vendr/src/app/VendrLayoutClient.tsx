"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@runr/shared/lib/utils";
import { AppBrandHeader } from "@runr/shared/components/layout/AppBrandHeader";
import {
  LayoutDashboard,
  ListOrdered,
  Map,
  Settings,
  Users,
} from "lucide-react";

export const vendrNav = [
  { href: "/", label: "Operations", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ListOrdered },
  { href: "/runrs", label: "RUNRs", icon: Users },
  { href: "/coverage", label: "Coverage", icon: Map },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function VendrLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[100dvh] bg-[var(--background)]">
      <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-4 pt-[calc(1rem+var(--safe-top))] lg:block">
        <AppBrandHeader
          name="VENDR"
          tagline="Sell. Manage. Grow."
          emoji="🏪"
          accentClass="bg-emerald-600"
          className="mb-8"
        />
        <nav className="space-y-1">
          {vendrNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-runr-md px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "text-[var(--muted)] hover:bg-runr-neutral-100 dark:hover:bg-runr-neutral-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="app-screen min-w-0 flex-1 lg:pb-0 lg:pt-[var(--safe-top)]">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex justify-around px-2">
          {vendrNav.slice(0, 4).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium",
                pathname === href ? "text-emerald-600" : "text-[var(--muted)]"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
