"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CoverageTimeline } from "@runr/shared/components/ui/CoverageTimeline";
import { CoverageBadge } from "@runr/shared/components/ui/CoverageBadge";
import { CoverageRing } from "@runr/shared/components/ui/CoverageRing";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { CatalogPreviewBanner } from "@runr/shared/components/ui/CatalogPreviewBanner";
import { JobLoop, MarketplaceJob } from "@runr/shared/components/ui/JobLoop";
import { useAppStore } from "@/store";
import {
  calculateCoverageTimeline,
  getBusinessCoverageSummary,
} from "@runr/shared/lib/coverage-engine";
import { selectVendorBusiness } from "@runr/shared/lib/utils";

export default function BusinessOperationsPage() {
  const { businesses, orders, user } = useAppStore();
  const business = selectVendorBusiness(businesses, user?.id);

  const coverage = business
    ? getBusinessCoverageSummary(business.coverageRules, business.scheduledRuns)
    : null;

  const timeline = useMemo(
    () =>
      business
        ? calculateCoverageTimeline(business.coverageRules, business.scheduledRuns).filter(
            (i) => i.maxRunrs > 0
          )
        : [],
    [business]
  );

  const businessOrders = business ? orders.filter((o) => o.businessId === business.id) : [];
  const liveOrders = businessOrders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const activeDeliveries = businessOrders.filter((o) =>
    ["runr_assigned", "picked_up", "delivering"].includes(o.status)
  ).length;
  const coveragePercent = coverage
    ? coverage.maxRunrs === 0
      ? 0
      : Math.round((coverage.scheduledRunrs / coverage.maxRunrs) * 100)
    : 0;

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <EmptyState
          title="No business connected"
          description="Sign in with vendr@test.runr.com to load Tony's Pizza, Golden Gate Burgers, and Mission Tacos."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="px-5 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7048F8]">VENDR</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
          {business.name}
        </h1>
        <JobLoop app="vendr" className="mt-1" />
        <MarketplaceJob app="vendr" className="mt-1" />
        <p className="mt-1 text-sm text-[var(--muted)]">
          Set how many RUNRs you need. PORTER orders come in. The network fills the gaps.
        </p>
      </div>

      <div className="mt-4 px-4">
        <CatalogPreviewBanner />
      </div>

      <div className="space-y-5 px-4 pt-1">
        {coverage && (
          <section className="flex items-center gap-4 rounded-[1.75rem] bg-[var(--surface-elevated)] p-4 shadow-runr-card ring-1 ring-[var(--border)]">
            <CoverageRing percent={coveragePercent} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Coverage
              </p>
              <p className="text-lg font-extrabold text-[var(--foreground)]">
                Needed {coverage.maxRunrs} · Covered {coverage.scheduledRunrs}
                {coverage.gap > 0 ? ` · Gap ${coverage.gap}` : " · Full"}
              </p>
              <Link
                href="/coverage"
                className="mt-3 inline-flex rounded-full bg-[#A0F878] px-4 py-2 text-xs font-extrabold text-[#1A1224]"
              >
                Manage coverage
              </Link>
            </div>
          </section>
        )}

        {coverage && (
          <section className="grid grid-cols-2 gap-3">
            <StatCard
              label="RUNRs"
              value={`${coverage.scheduledRunrs}/${coverage.maxRunrs}`}
            />
            <StatCard label="Orders" value={String(liveOrders.length)} />
            <StatCard label="Deliveries" value={String(activeDeliveries)} />
            <StatCard
              label="Coverage"
              value={coverage.status === "full" ? "FULL" : coverage.status.toUpperCase()}
              emphasis={coverage.status !== "full"}
            />
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-[var(--foreground)]">Coverage Timeline</h2>
            {coverage && <CoverageBadge status={coverage.status} gap={coverage.gap} size="sm" />}
          </div>
          <CoverageTimeline intervals={timeline.slice(0, 5)} compact />
        </section>

        <section>
          <h2 className="mb-3 font-extrabold text-[var(--foreground)]">Recent Orders</h2>
          {businessOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="PORTER orders will appear here when customers place them."
            />
          ) : (
            <div className="space-y-3">
              {liveOrders.slice(0, 8).map((order) => (
                <Link
                  key={order.id}
                  href="/orders"
                  className="flex items-center justify-between rounded-2xl bg-[var(--surface-elevated)] px-4 py-3 shadow-runr-card ring-1 ring-[var(--border)]"
                >
                  <div>
                    <p className="font-extrabold text-[var(--foreground)]">Order #{order.id.slice(-4)}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {order.items.length} items · ${order.total.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide text-[#7048F8]">
                    {order.status.replace("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-[var(--surface-elevated)] p-4 shadow-runr-card ring-1 ring-[var(--border)]">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${emphasis ? "text-[#7048F8]" : "text-[#7048F8]"}`}>
        {value}
      </p>
    </div>
  );
}
