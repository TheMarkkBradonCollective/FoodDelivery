"use client";

import { cn } from "../../lib/utils";

export interface AppBrandProps {
  name: string;
  tagline: string;
  emoji?: string;
  accentClass?: string;
  compact?: boolean;
  className?: string;
}

export function AppBrandHeader({
  name,
  tagline,
  emoji,
  accentClass = "bg-runr-primary",
  compact,
  className,
}: AppBrandProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-runr-md font-black text-white",
          accentClass,
          compact ? "h-9 w-9 text-sm" : "h-11 w-11 text-base"
        )}
      >
        {emoji ?? name.charAt(0)}
      </div>
      <div className="min-w-0">
        <p className={cn("font-bold tracking-tight", compact ? "text-base" : "text-lg")}>
          {name}
        </p>
        <p className="truncate text-xs text-[var(--muted)]">{tagline}</p>
      </div>
    </div>
  );
}

export function FlowBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-[var(--surface-elevated)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] border border-[var(--border)]",
        className
      )}
    >
      {label}
    </span>
  );
}
