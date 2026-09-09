"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@runr/shared/lib/utils";
import { AppBrandHeader } from "@runr/shared/components/layout/AppBrandHeader";
import { useAppStore } from "@/store";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Package,
  Smartphone,
  Users,
} from "lucide-react";
import { signOut } from "@runr/shared/lib/supabase/auth";

export const staffNav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/apps", label: "Apps", icon: Smartphone },
  { href: "/users", label: "Users", icon: Users },
  { href: "/businesses", label: "Businesses", icon: Building2 },
  { href: "/orders", label: "Orders", icon: Package },
];

export function StaffLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  async function handleLogout() {
    await signOut();
    setUser(null);
  }

  return (
    <div className="flex min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-4 pt-[calc(1rem+var(--safe-top))] lg:block">
        <AppBrandHeader
          name="STAFF"
          tagline="Platform management"
          iconUrl="/icons/app-icon.png"
          className="mb-6"
        />
        {user && (
          <p className="mb-6 truncate text-xs text-[var(--muted)]">{user.email}</p>
        )}
        <nav className="space-y-1">
          {staffNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-runr-md px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-runr-primary text-white"
                  : "text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 inline-flex w-full items-center gap-2 rounded-runr-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </aside>

      <main className="app-screen min-w-0 flex-1 pb-[calc(var(--bottom-nav-height)+var(--safe-bottom))] lg:pb-0 lg:pt-[var(--safe-top)]">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex justify-around px-1">
          {staffNav.slice(0, 4).map(({ href, label, icon: Icon }) => (
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
