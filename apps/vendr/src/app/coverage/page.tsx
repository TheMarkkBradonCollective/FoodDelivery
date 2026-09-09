"use client";

import { useAppStore } from "@/store";
import { CoverageTimeline } from "@runr/shared/components/ui/CoverageTimeline";
import { calculateCoverageTimeline } from "@runr/shared/lib/coverage-engine";
import { formatTimeRange } from "@runr/shared/lib/utils";
import { selectVendorBusiness } from "@runr/shared/lib/utils";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";

export default function BusinessCoveragePage() {
  const { businesses, updateBusinessCapacity, user } = useAppStore();
  const business = selectVendorBusiness(businesses, user?.id);

  const timeline = business
    ? calculateCoverageTimeline(business.coverageRules, business.scheduledRuns).filter(
        (i) => i.maxRunrs > 0
      )
    : [];

  if (!business) {
    return (
      <div className="px-5 py-8">
        <EmptyState title="No business connected" description="Sign in with your VENDR account." />
      </div>
    );
  }

  return (
    <div className="px-5 pb-8 pt-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple">VENDR</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold">Coverage</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Slide Needed per window. Covered updates as RUNRs book.
      </p>

      <section className="mt-5">
        <h2 className="mb-2 text-base font-extrabold">Needed by window</h2>
        <div className="space-y-2">
          {business.coverageRules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-bold">{formatTimeRange(rule.startTime, rule.endTime)}</p>
                <p className="text-sm font-extrabold tabular-nums text-purple">{rule.maxRunrs}</p>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={1}
                value={rule.maxRunrs}
                aria-label={`Needed RUNRs ${formatTimeRange(rule.startTime, rule.endTime)}`}
                onChange={(e) => updateBusinessCapacity(business.id, rule.id, Number(e.target.value))}
                className="mt-2 h-8 w-full range-slider"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-base font-extrabold">Live timeline</h2>
        <CoverageTimeline intervals={timeline.slice(0, 4)} compact />
      </section>
    </div>
  );
}
