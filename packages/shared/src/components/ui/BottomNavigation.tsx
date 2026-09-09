"use client";

import { cn } from "../../lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavigationProps {
  items: NavItem[];
  className?: string;
}

export function BottomNavigation({ items, className }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed inset-x-3 bottom-3 z-30 rounded-full border border-[var(--border)] bg-[var(--surface)]/95 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-runr-sheet backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors",
                active
                  ? "text-runr-primary"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  active && "bg-runr-primary-muted"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
