"use client";

import Link from "next/link";
import { useAppStore } from "../../store/create-app-store";
import { getBusinessCoverageSummary } from "../../lib/coverage-engine";
import { APP_COPY, type AppId } from "../../lib/apps";
import { formatCurrency } from "../../lib/utils";
import type { Order } from "../../types/index";
import { buildingAccessLabel } from "../../lib/delivery-access";

export const NEXT_ORDER_STATUS: Partial<Record<Order["status"], Order["status"]>> = {
  new: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "runr_assigned",
  runr_assigned: "picked_up",
  picked_up: "delivering",
  delivering: "delivered",
};

const APP_PACKAGES: Record<AppId, string> = {
  porter: "com.porter.porter",
  runr: "com.porter.runner",
  vendr: "com.porter.vendor",
  staff: "com.porter.command",
};

export function StaffOrdersPanel() {
  const { businesses, orders, updateOrderStatus } = useAppStore();

  if (orders.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const biz = businesses.find((b) => b.id === order.businessId);
        const next = NEXT_ORDER_STATUS[order.status];
        const closed = order.status === "delivered" || order.status === "cancelled";
        return (
          <div
            key={order.id}
            className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">
                #{order.id.slice(-6)} · {biz?.name ?? "Business"}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {order.items.length} items · {formatCurrency(order.total)} ·{" "}
                {order.status.replace(/_/g, " ")}
                {order.buildingAccess ? ` · ${buildingAccessLabel(order.buildingAccess)}` : ""}
              </p>
              {order.accessNote ? <p className="text-xs text-[var(--muted)]">{order.accessNote}</p> : null}
            </div>
            {!closed && (
              <div className="flex flex-wrap gap-2">
                {next && (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(order.id, next)}
                    className="tap-target rounded-full bg-[#7048F8] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Mark {next.replace(/_/g, " ")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => updateOrderStatus(order.id, "cancelled")}
                  className="tap-target rounded-full border border-red-400/40 px-3 py-1.5 text-xs font-semibold text-red-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StaffCoveragePanel() {
  const { businesses, updateBusinessCapacity } = useAppStore();

  if (businesses.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No vendors yet.</p>;
  }

  return (
    <div className="space-y-4">
      {businesses.map((b) => {
        const c = getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns);
        return (
          <div key={b.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{b.name}</p>
                <p className="text-xs text-[var(--muted)]">
                  {b.city} · {c.scheduledRunrs}/{c.maxRunrs} Runners
                  {c.gap > 0 ? ` · ${c.gap} needed` : " · full"}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {b.coverageRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[var(--muted)]">
                    {rule.startTime}–{rule.endTime}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="tap-target flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
                      onClick={() =>
                        updateBusinessCapacity(b.id, rule.id, Math.max(0, rule.maxRunrs - 1))
                      }
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold">{rule.maxRunrs}</span>
                    <button
                      type="button"
                      className="tap-target flex h-8 w-8 items-center justify-center rounded-full bg-[#7048F8] text-white"
                      onClick={() => updateBusinessCapacity(b.id, rule.id, rule.maxRunrs + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StaffUsersPanel() {
  const marketplaceUsers = useAppStore((s) => s.marketplaceUsers);

  if (marketplaceUsers.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">No profiles yet. Run schema.sql in Supabase.</p>
    );
  }

  return (
    <div className="space-y-3">
      {marketplaceUsers.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-semibold">{u.name}</p>
            <p className="truncate text-xs text-[var(--muted)]">{u.email}</p>
          </div>
          <span className="shrink-0 rounded-full bg-[#7048F8]/30 px-3 py-1 text-xs uppercase text-[#A0F878]">
            {u.staffTitle ?? u.role}
          </span>
        </div>
      ))}
    </div>
  );
}

export function StaffAppsPanel({ downloadHref }: { downloadHref?: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(Object.keys(APP_COPY) as AppId[]).map((id) => {
        const app = APP_COPY[id];
        return (
          <div key={id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{app.shortName}</h3>
              <span className="text-xs text-[#A0F878]">{app.role}</span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">{app.tagline}</p>
            <p className="mt-2 font-mono text-xs text-[var(--muted)]">{APP_PACKAGES[id]}</p>
            {downloadHref ? (
              <Link
                href={downloadHref}
                className="mt-4 inline-flex rounded-full bg-[#7048F8] px-3 py-1.5 text-xs font-semibold text-white"
              >
                Open download page
              </Link>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
