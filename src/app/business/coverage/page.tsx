"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { CoverageTimeline } from "@/components/ui/CoverageTimeline";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  calculateCoverageTimeline,
} from "@/lib/coverage-engine";
import { formatTimeRange } from "@/lib/utils";

export default function BusinessCoveragePage() {
  const { businesses, updateBusinessCapacity } = useAppStore();
  const business = businesses[0];
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);

  const timeline = calculateCoverageTimeline(
    business.coverageRules,
    business.scheduledRuns
  ).filter((i) => i.maxRunrs > 0);

  return (
    <div className="px-4 py-6 pb-24 lg:pb-6">
      <h1 className="text-2xl font-bold">Coverage Schedule</h1>
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
