"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListOrdered,
  Map,
  Settings,
  Users,
} from "lucide-react";

const nav = [
  { href: "/business", label: "Operations", icon: LayoutDashboard },
  { href: "/business/orders", label: "Orders", icon: ListOrdered },
  { href: "/business/runrs", label: "RUNRs", icon: Users },
  { href: "/business/coverage", label: "Coverage", icon: Map },
  { href: "/business/settings", label: "Settings", icon: Settings },
];

export function BusinessLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-4 lg:block">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-runr-md bg-runr-primary font-bold text-white">
            R
          </div>
          <div>
            <p className="font-bold">RUNR</p>
            <p className="text-[10px] text-[var(--muted)]">Business</p>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-runr-md px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-runr-primary-muted text-runr-primary"
                  : "text-[var(--muted)] hover:bg-runr-neutral-100 dark:hover:bg-runr-neutral-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] lg:hidden">
        <div className="flex justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {nav.slice(0, 4).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium",
                pathname === href ? "text-runr-primary" : "text-[var(--muted)]"
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
