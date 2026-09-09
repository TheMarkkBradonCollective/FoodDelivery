"use client";

import { useAppStore } from "@/store";
import { getBusinessCoverageSummary } from "@runr/shared/lib/coverage-engine";
import { Panel } from "@/components/StaffUi";

export default function StaffBusinessesPage() {
  const { businesses } = useAppStore();

  return (
    <div className="p-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">STAFF</p>
      <h1 className="mt-1 text-2xl font-extrabold">Businesses</h1>
      <Panel title="On marketplace" className="mt-6">
        <div className="space-y-3">
          {businesses.map((b) => {
            const c = getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns);
            return (
              <div
                key={b.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {b.cuisine} · {b.city} · ★ {b.rating}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>RUNRs: {c.scheduledRunrs}/{c.maxRunrs}</span>
                  {c.gap > 0 ? (
                    <span className="text-orange-400">{c.gap} gap</span>
                  ) : (
                    <span className="text-green-400">Full</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
