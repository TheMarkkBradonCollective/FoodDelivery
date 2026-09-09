import { cn } from "../../lib/utils";
import type { CoverageStatus } from "../../types/index";

interface CoverageBadgeProps {
  status: CoverageStatus;
  gap?: number;
  className?: string;
  size?: "sm" | "md";
}

const statusStyles: Record<CoverageStatus, string> = {
  full: "bg-runr-success-muted text-runr-success border-runr-success/20",
  low: "bg-runr-warning-muted text-runr-warning border-runr-warning/20",
  gap: "bg-runr-critical-muted text-runr-critical border-runr-critical/20",
  over_capacity: "bg-runr-neutral-100 text-runr-neutral-600 border-runr-neutral-200",
};

const statusLabels: Record<CoverageStatus, string> = {
  full: "FULL",
  low: "LOW COVERAGE",
  gap: "RUN GAP",
  over_capacity: "OVER CAPACITY",
};

export function CoverageBadge({
  status,
  gap = 0,
  className,
  size = "md",
}: CoverageBadgeProps) {
  const label =
    status === "full"
      ? "FULL"
      : status === "gap" || status === "low"
        ? gap === 1
          ? "1 RUNR NEEDED"
          : `${gap} RUNRS NEEDED`
        : statusLabels[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border font-semibold uppercase tracking-wide",
        statusStyles[status],
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        className
      )}
    >
      {label}
    </span>
  );
}
