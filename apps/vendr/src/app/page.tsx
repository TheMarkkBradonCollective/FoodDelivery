"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CoverageTimeline } from "@porter/shared/components/ui/CoverageTimeline";
import { CoverageBadge } from "@porter/shared/components/ui/CoverageBadge";
import { CoverageRing } from "@porter/shared/components/ui/CoverageRing";
import { EmptyState } from "@porter/shared/components/ui/EmptyState";
import { CatalogPreviewBanner } from "@porter/shared/components/ui/CatalogPreviewBanner";
import { JobLoop } from "@porter/shared/components/ui/JobLoop";
import { useAppStore } from "@/store";
import {
  calculateCoverageTimeline,
  getBusinessCoverageSummary,
} from "@porter/shared/lib/coverage-engine";
import { selectVendorBusiness } from "@porter/shared/lib/utils";

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
  const coveragePercent = coverage
    ? coverage.maxRunrs === 0
      ? 0
      : Math.round((coverage.scheduledRunrs / coverage.maxRunrs) * 100)
    : 0;

  if (!business) {
    return (
      <div className="px-5 py-8">
        <EmptyState
          title="No business connected"
          description="Sign in with vendr@test.portr.com to load Tony's Pizza, Golden Gate Burgers, and Mission Tacos."
        />
      </div>
    );
  }

  return (
    <div className="px-5 pb-8 pt-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple">Portr Vendor</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold tracking-tight text-[var(--foreground)]">
        {business.name}
      </h1>
      <JobLoop app="vendr" className="mt-1" />
      <p className="mt-1 text-sm text-[var(--muted)]">Needed · Covered · Gap. Portr orders in. Runners fill windows.</p>

      <div className="mt-3">
        <CatalogPreviewBanner />
      </div>

      <div className="mt-4 space-y-4">
        {coverage && (
          <section className="flex items-center gap-3 rounded-2xl bg-[var(--surface-elevated)] p-3.5 ring-1 ring-[var(--border)]">
            <CoverageRing percent={coveragePercent} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Coverage</p>
                <Link href="/coverage" className="text-[11px] font-extrabold text-purple">
                  Manage
                </Link>
              </div>
              <p className="mt-0.5 text-[15px] font-extrabold leading-snug text-[var(--foreground)]">
                Needed {coverage.maxRunrs} · Covered {coverage.scheduledRunrs}
                {coverage.gap > 0 ? ` · Gap ${coverage.gap}` : " · Full"}
              </p>
            </div>
          </section>
        )}

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-extrabold">Timeline</h2>
            {coverage && <CoverageBadge status={coverage.status} gap={coverage.gap} size="sm" />}
          </div>
          <CoverageTimeline intervals={timeline.slice(0, 4)} compact />
        </section>

        <section>
          <h2 className="mb-2 text-base font-extrabold">Live orders</h2>
          {liveOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Portr orders appear here when customers place them."
            />
          ) : (
            <div className="space-y-2">
              {liveOrders.slice(0, 8).map((order) => (
                <Link
                  key={order.id}
                  href="/orders"
                  className="flex items-center justify-between rounded-2xl bg-[var(--surface-elevated)] px-3.5 py-2.5 ring-1 ring-[var(--border)]"
                >
                  <div>
                    <p className="text-sm font-extrabold">Order #{order.id.slice(-4)}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {order.items.length} items · ${order.total.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-purple">
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
