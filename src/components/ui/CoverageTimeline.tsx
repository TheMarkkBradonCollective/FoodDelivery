import { cn } from "@/lib/utils";
import type { CoverageInterval } from "@/types";
import { formatTimeRange } from "@/lib/utils";
import { CoverageBadge } from "./CoverageBadge";

interface CoverageTimelineProps {
  intervals: CoverageInterval[];
  className?: string;
  compact?: boolean;
}

export function CoverageTimeline({
  intervals,
  className,
  compact = false,
}: CoverageTimelineProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {intervals.map((interval) => (
        <div
          key={`${interval.startTime}-${interval.endTime}`}
          className={cn(
            "flex items-center justify-between rounded-runr-md border border-[var(--border)] bg-[var(--surface-elevated)]",
            compact ? "px-3 py-2" : "px-4 py-3"
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {formatTimeRange(interval.startTime, interval.endTime)}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {interval.scheduledRunrs} / {interval.maxRunrs} RUNRs
            </p>
          </div>
          <CoverageBadge status={interval.status} gap={interval.gap} size="sm" />
        </div>
      ))}
    </div>
  );
}
