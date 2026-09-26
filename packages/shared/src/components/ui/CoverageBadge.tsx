import { cn } from "../../lib/utils";
import type { CoverageStatus } from "../../types/index";

interface CoverageBadgeProps {
  status: CoverageStatus;
  gap?: number;
  className?: string;
  size?: "sm" | "md";
}

const statusStyles: Record<CoverageStatus, string> = {
  full: "bg-porter-success-muted text-porter-success border-porter-success/20",
  low: "bg-porter-warning-muted text-porter-warning border-porter-warning/20",
  gap: "bg-porter-critical-muted text-porter-critical border-porter-critical/20",
  over_capacity: "bg-porter-neutral-100 text-porter-neutral-600 border-porter-neutral-200",
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
          ? "1 RUNNER NEEDED"
          : `${gap} RUNNERS NEEDED`
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
