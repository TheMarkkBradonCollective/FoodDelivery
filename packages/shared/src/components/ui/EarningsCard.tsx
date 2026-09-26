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
        "rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3",
        highlight && "border-porter-primary/20 bg-porter-primary-muted",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-lg font-extrabold tabular-nums",
          highlight ? "text-porter-primary" : "text-[var(--foreground)]"
        )}
      >
        {formatCurrency(amount)}
      </p>
    </div>
  );
}
