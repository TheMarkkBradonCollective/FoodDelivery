"use client";

import { cn, formatCurrency, formatTimeRange } from "@/lib/utils";
import type { Run } from "@/types";
import { StatusBadge } from "./StatusBadge";

interface RunCardProps {
  run: Run;
  businessName: string;
  className?: string;
  onClick?: () => void;
}

const statusVariant: Record<string, "success" | "warning" | "primary" | "neutral"> = {
  scheduled: "neutral",
  active: "primary",
  checked_in: "success",
  completed: "neutral",
  cancelled: "neutral",
};

export function RunCard({ run, businessName, className, onClick }: RunCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-runr-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-left shadow-runr-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">{businessName}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {formatTimeRange(run.startTime, run.endTime)}
          </p>
          {run.deliveryCount !== undefined && (
            <p className="mt-2 text-sm">
              {run.deliveryCount} deliveries · {formatCurrency(run.earnings ?? 0)}
            </p>
          )}
        </div>
        <StatusBadge
          label={run.status.replace("_", " ")}
          variant={statusVariant[run.status] ?? "neutral"}
        />
      </div>
    </button>
  );
}
