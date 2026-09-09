"use client";

import { useAppStore } from "@/store";
import { getBusinessCoverageSummary } from "@runr/shared/lib/coverage-engine";
import { Panel, Stat } from "@/components/StaffUi";
import { DesktopManageBanner } from "@/components/DesktopManageBanner";
import { CatalogPreviewBanner } from "@runr/shared/components/ui/CatalogPreviewBanner";

export default function StaffStatusPage() {
  const { businesses, orders } = useAppStore();

  const liveOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const platformRuns = businesses.flatMap((b) => b.scheduledRuns).filter((r) => r.status !== "cancelled");
  const gaps = businesses
    .map((b) => ({
      name: b.name,
      coverage: getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns),
    }))
    .filter((x) => x.coverage.gap > 0);

  return (
    <div className="p-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">STAFF</p>
      <h1 className="mt-1 text-2xl font-extrabold">Status</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Quick read of the marketplace</p>

      <div className="mt-5 space-y-3">
        <CatalogPreviewBanner />
        <DesktopManageBanner />
      </div>

      <div className="mt-6 grid gap-4">
        <Stat label="Live orders" value={String(liveOrders.length)} />
        <Stat label="Coverage gaps" value={String(gaps.length)} alert={gaps.length > 0} />
        <Stat label="Scheduled RUNs" value={String(platformRuns.length)} />
        <Stat label="Kitchens" value={String(businesses.length)} />
      </div>

      <Panel title="Coverage gaps" className="mt-6">
        {gaps.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">All kitchens are covered.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {gaps.map((g) => (
              <li key={g.name} className="flex justify-between">
                <span>{g.name}</span>
                <span className="font-semibold text-runr-warning">{g.coverage.gap} needed</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Live orders" className="mt-4">
        {liveOrders.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No live orders.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {liveOrders.slice(0, 8).map((order) => (
              <li key={order.id} className="flex justify-between">
                <span>#{order.id.slice(-6)}</span>
                <span className="uppercase text-[var(--muted)]">{order.status.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
