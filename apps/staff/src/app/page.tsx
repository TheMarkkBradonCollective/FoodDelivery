"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store";
import { getBusinessCoverageSummary } from "@runr/shared/lib/coverage-engine";
import { Panel, Stat } from "@/components/StaffUi";
import { CatalogPreviewBanner } from "@runr/shared/components/ui/CatalogPreviewBanner";
import { ConfirmDialog } from "@runr/shared/components/ui/ConfirmDialog";
import { Bell, LogOut } from "lucide-react";

export default function StaffStatusPage() {
  const { businesses, orders, notifications, logout } = useAppStore();
  const [confirmOut, setConfirmOut] = useState(false);

  const liveOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const platformRuns = businesses.flatMap((b) => b.scheduledRuns).filter((r) => r.status !== "cancelled");
  const gaps = businesses
    .map((b) => ({
      id: b.id,
      name: b.name,
      coverage: getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns),
    }))
    .filter((x) => x.coverage.gap > 0);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="px-5 pb-8 pt-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">Porter Command</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold">Status</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Live marketplace — work from this phone</p>

      <div className="mt-4">
        <CatalogPreviewBanner />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="Live orders" value={String(liveOrders.length)} />
        <Stat label="Coverage gaps" value={String(gaps.length)} alert={gaps.length > 0} />
        <Stat label="Scheduled RUNs" value={String(platformRuns.length)} />
        <Stat label="Vendors" value={String(businesses.length)} />
      </div>

      {unread > 0 && (
        <Link
          href="/alerts"
          className="mt-4 flex items-center justify-between rounded-2xl bg-purple px-3.5 py-3 text-white"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <Bell size={16} /> {unread} unread alert{unread === 1 ? "" : "s"}
          </span>
          <span className="text-xs text-lime">Open</span>
        </Link>
      )}

      <Panel title="Needs attention" className="mt-4">
        {gaps.length === 0 && liveOrders.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Marketplace is clear.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {gaps.map((g) => (
              <li key={g.id}>
                <Link href="/coverage" className="flex justify-between text-[#A0F878]">
                  <span>{g.name}</span>
                  <span className="font-semibold">{g.coverage.gap} needed</span>
                </Link>
              </li>
            ))}
            {liveOrders.slice(0, 6).map((order) => (
              <li key={order.id}>
                <Link href="/orders" className="flex justify-between text-[#A0F878]">
                  <span>#{order.id.slice(-6)}</span>
                  <span className="uppercase">{order.status.replace(/_/g, " ")}</span>
                </Link>
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
        title="Sign out of Porter Command?"
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
