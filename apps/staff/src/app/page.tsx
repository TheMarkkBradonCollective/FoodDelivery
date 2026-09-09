"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { getBusinessCoverageSummary } from "@runr/shared/lib/coverage-engine";
import { Panel, Stat } from "@/components/StaffUi";
import { DesktopManageBanner } from "@/components/DesktopManageBanner";
import { CatalogPreviewBanner } from "@runr/shared/components/ui/CatalogPreviewBanner";
import { ConfirmDialog } from "@runr/shared/components/ui/ConfirmDialog";
import { LogOut } from "lucide-react";

export default function StaffStatusPage() {
  const { businesses, orders, logout } = useAppStore();
  const [confirmOut, setConfirmOut] = useState(false);

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

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
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

      <button
        type="button"
        onClick={() => setConfirmOut(true)}
        className="tap-target mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/8 text-sm font-bold text-cream md:hidden"
      >
        <LogOut size={16} /> Sign out
      </button>

      <ConfirmDialog
        open={confirmOut}
        title="Sign out of STAFF?"
        description="You will need your staff email and password to get back in."
        confirmLabel="Sign out"
        destructive
        onCancel={() => setConfirmOut(false)}
        onConfirm={() => {
          logout();
          setConfirmOut(false);
        }}
      />
    </div>
  );
}
