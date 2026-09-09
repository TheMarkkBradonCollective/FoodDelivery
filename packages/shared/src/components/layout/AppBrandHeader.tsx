"use client";

import Image from "next/image";
import { cn } from "../../lib/utils";

export interface AppBrandProps {
  name: string;
  tagline: string;
  emoji?: string;
  iconUrl?: string;
  accentClass?: string;
  compact?: boolean;
  className?: string;
}

export function AppBrandHeader({
  name,
  tagline,
  emoji,
  iconUrl,
  accentClass = "bg-runr-primary",
  compact,
  className,
}: AppBrandProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt={`${name} logo`}
          width={compact ? 36 : 44}
          height={compact ? 36 : 44}
          className={cn("shrink-0 rounded-2xl", compact ? "h-9 w-9" : "h-11 w-11")}
        />
      ) : (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl font-black text-white",
            accentClass,
            compact ? "h-9 w-9 text-sm" : "h-11 w-11 text-base"
          )}
        >
          {emoji ?? name.charAt(0)}
        </div>
      )}
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
        "inline-flex rounded-full bg-runr-accent-bright px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-runr-ink",
        className
      )}
    >
      {label}
    </span>
  );
}
