"use client";

import { cn, formatCurrency } from "../../lib/utils";

interface EarningsCardProps {
  label: string;
  amount: number;
  highlight?: boolean;
  className?: string;
}

export function EarningsCard({
  label,
  amount,
  highlight,
  className,
}: EarningsCardProps) {
  return (
    <div
      className={cn(
        "rounded-runr-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4",
        highlight && "border-runr-primary/20 bg-runr-primary-muted",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          highlight ? "text-runr-primary" : "text-[var(--foreground)]"
        )}
      >
        {formatCurrency(amount)}
      </p>
    </div>
  );
}
