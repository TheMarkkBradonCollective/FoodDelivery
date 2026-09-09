"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { BrandLockup, BrandMark } from "../ui/BrandMark";
import type { AppId } from "../../lib/apps";

export type AppTab = { href: string; label: string; icon: LucideIcon };

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

export function AppFrame({
  app,
  tabs,
  children,
  tone = "light",
  footer,
}: {
  app: AppId;
  tabs: AppTab[];
  children: ReactNode;
  tone?: "light" | "dark";
  footer?: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const dark = tone === "dark";

  return (
    <div
      className={clsx(
        "min-h-dvh md:flex",
        dark ? "bg-[#100814] text-cream" : "bg-[var(--background)] text-[var(--foreground)]",
      )}
    >
      <aside
        className={clsx(
          "hidden w-[4.75rem] shrink-0 flex-col border-r md:flex lg:hidden",
          dark ? "border-white/10 bg-[#1A1224]" : "border-[var(--border)] bg-[var(--surface-elevated)]",
        )}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex justify-center px-2 py-5">
          <BrandMark size="sm" inverted={dark || app === "staff"} />
        </div>
        <nav className="flex flex-1 flex-col items-center gap-1 px-2" aria-label="Main">
          {tabs.map((tab) => {
            const active = isActive(pathname, tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                title={tab.label}
                className={clsx(
                  "tap-target flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                  active
                    ? "bg-purple text-white"
                    : dark
                      ? "text-cream/60 hover:bg-white/5 hover:text-cream"
                      : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]",
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              </Link>
            );
          })}
        </nav>
        {footer ? <div className="mt-auto px-1.5 pb-6">{footer}</div> : null}
      </aside>

      <aside
        className={clsx(
          "hidden w-64 shrink-0 flex-col border-r lg:flex",
          dark ? "border-white/10 bg-[#1A1224]" : "border-[var(--border)] bg-[var(--surface-elevated)]",
        )}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="px-5 py-6">
          <BrandLockup app={app} />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Main">
          {tabs.map((tab) => {
            const active = isActive(pathname, tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-colors",
                  active
                    ? "bg-purple text-white"
                    : dark
                      ? "text-cream/60 hover:bg-white/5 hover:text-cream"
                      : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]",
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
        {footer ? <div className="mt-auto px-4 pb-6">{footer}</div> : null}
      </aside>

      <div
        className="min-w-0 flex-1"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <div className="mx-auto min-h-dvh w-full max-w-6xl pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:pb-8">
          {children}
        </div>
      </div>

      <nav
        className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 md:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
        aria-label="Main"
      >
        <div className="pointer-events-auto flex w-full max-w-md items-center justify-around rounded-full bg-ink px-2 py-2 shadow-2xl">
          {tabs.map((tab) => {
            const active = isActive(pathname, tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "tap-target flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                  active ? "bg-purple text-white" : "text-white/55",
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                <span className="sr-only">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
