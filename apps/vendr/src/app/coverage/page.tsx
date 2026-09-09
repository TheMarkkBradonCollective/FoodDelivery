"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { CoverageTimeline } from "@runr/shared/components/ui/CoverageTimeline";
import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";
import {
  calculateCoverageTimeline,
} from "@runr/shared/lib/coverage-engine";
import { formatTimeRange } from "@runr/shared/lib/utils";
import { selectVendorBusiness } from "@runr/shared/lib/utils";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";

export default function BusinessCoveragePage() {
  const { businesses, updateBusinessCapacity, user } = useAppStore();
  const business = selectVendorBusiness(businesses, user?.id);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);

  const timeline = business
    ? calculateCoverageTimeline(business.coverageRules, business.scheduledRuns).filter(
        (i) => i.maxRunrs > 0
      )
    : [];

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <EmptyState title="No business connected" description="Sign in with your VENDR account." />
      </div>
    );
  }

  return (
    <div className="px-5 py-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple">VENDR</p>
      <h1 className="mt-1 text-2xl font-extrabold">Coverage Schedule</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Define maximum RUNRs needed per time period
      </p>

      <section className="mt-6">
        <h2 className="mb-3 font-semibold">Live Timeline</h2>
        <CoverageTimeline intervals={timeline} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold">Capacity Rules</h2>
        <div className="space-y-3">
          {business.coverageRules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-runr-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {formatTimeRange(rule.startTime, rule.endTime)}
                  </p>
                  {editingRuleId === rule.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-sm text-[var(--muted)]">Max RUNRs:</label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        className="w-20 rounded-runr-md border border-[var(--border)] px-2 py-1 text-sm"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--muted)]">
                      Maximum RUNRs: {rule.maxRunrs}
                    </p>
                  )}
                </div>
                {editingRuleId === rule.id ? (
                  <PrimaryButton
                    size="sm"
                    onClick={() => {
                      updateBusinessCapacity(business.id, rule.id, editValue);
                      setEditingRuleId(null);
                    }}
                  >
                    Save
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingRuleId(rule.id);
                      setEditValue(rule.maxRunrs);
                    }}
                  >
                    Edit
                  </PrimaryButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
