"use client";

import { useMemo } from "react";
import { MapView } from "@runr/shared/components/map";
import { CoverageTimeline } from "@runr/shared/components/ui/CoverageTimeline";
import { CoverageBadge } from "@runr/shared/components/ui/CoverageBadge";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { useAppStore } from "@/store";
import {
  calculateCoverageTimeline,
  getBusinessCoverageSummary,
} from "@runr/shared/lib/coverage-engine";
import { DEFAULT_LOCATION } from "@runr/shared/data/constants";
import { selectVendorBusiness } from "@runr/shared/lib/utils";

export default function BusinessOperationsPage() {
  const { businesses, orders, theme, user } = useAppStore();
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

  const businessOrders = business
    ? orders.filter((o) => o.businessId === business.id)
    : [];

  const mapCenter = business?.location ?? DEFAULT_LOCATION;

  const markers = business
    ? [
        {
          id: "business",
          position: business.location,
          color: "#A0F878",
          title: business.name,
          subtitle: "Your restaurant",
        },
      ]
    : [];

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
    <div className="flex h-screen flex-col lg:flex-row">
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:hidden">
        <p className="text-[10px] font-bold uppercase tracking-wider text-runr-primary">VENDR Business</p>
        <p className="text-sm font-semibold">Sell → Prepare → Dispatch → Fulfill → Grow</p>
        <p className="text-xs text-[var(--muted)]">PORTER orders flow in · RUNRs fill coverage gaps</p>
      </div>

      <div className="relative h-[45vh] lg:h-auto lg:flex-1">
        <MapView
          center={mapCenter}
          markers={markers}
          dark={theme === "dark"}
          zoom={15}
          className="absolute inset-0"
        />
        <div className="absolute left-4 top-4 rounded-runr-lg bg-[var(--surface)]/95 px-4 py-2 shadow-runr-card backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Live Operations
          </p>
          <p className="font-bold">{business.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border-t border-[var(--border)] lg:w-96 lg:shrink-0 lg:border-l lg:border-t-0">
        <div className="space-y-6 p-4 pb-24 lg:pb-4">
          {coverage && (
            <section className="grid grid-cols-2 gap-3">
              <StatCard
                label="RUNRs"
                value={`${coverage.scheduledRunrs} / ${coverage.maxRunrs}`}
                sub={coverage.gap > 0 ? `${coverage.gap} needed` : "FULL"}
                alert={coverage.gap > 0}
              />
              <StatCard label="Active Orders" value={String(businessOrders.length)} />
              <StatCard label="Active Deliveries" value="0" />
              <StatCard
                label="Coverage"
                value={coverage.status === "full" ? "FULL" : "LOW"}
                alert={coverage.status !== "full"}
              />
            </section>
          )}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Coverage Timeline</h2>
              {coverage && (
                <CoverageBadge status={coverage.status} gap={coverage.gap} size="sm" />
              )}
            </div>
            <CoverageTimeline intervals={timeline.slice(0, 5)} compact />
          </section>

          <section>
            <h2 className="mb-3 font-semibold">Recent Orders</h2>
            {businessOrders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                description="PORTER orders will appear here when customers place them."
              />
            ) : (
              businessOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-runr-lg border border-[var(--border)] p-4"
                >
                  <div className="flex justify-between">
                    <p className="font-semibold">Order #{order.id.slice(-4)}</p>
                    <span className="text-xs uppercase text-[var(--muted)]">{order.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {order.items.length} items · ${order.total.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  alert,
}: {
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-runr-lg border p-3 ${
        alert ? "border-runr-warning/30 bg-runr-warning-muted" : "border-[var(--border)] bg-[var(--surface-elevated)]"
      }`}
    >
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
      {sub && (
        <p className={`text-xs ${alert ? "text-runr-warning font-semibold" : "text-[var(--muted)]"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
