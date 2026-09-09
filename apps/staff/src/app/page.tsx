"use client";

import { useAppStore } from "@/store";
import { getBusinessCoverageSummary } from "@runr/shared/lib/coverage-engine";
import { Panel, Stat } from "@/components/StaffUi";

export default function StaffOverviewPage() {
  const { businesses, orders, scheduledRuns } = useAppStore();

  const totalGaps = businesses.filter((b) => {
    const c = getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns);
    return c.gap > 0;
  }).length;

  return (
    <div className="p-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">STAFF</p>
      <h1 className="mt-1 text-2xl font-extrabold">Overview</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">RUNR platform at a glance</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Businesses" value={String(businesses.length)} />
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Active RUNs" value={String(scheduledRuns.length)} />
        <Stat label="Coverage gaps" value={String(totalGaps)} alert={totalGaps > 0} />
      </div>

      <Panel title="Platform Status" className="mt-6">
        <p className="text-sm text-[var(--muted)]">
          PORTER, RUNR, VENDR, and STAFF connect to this marketplace. Manage users,
          businesses, and operations from this app.
        </p>
      </Panel>
    </div>
  );
}
