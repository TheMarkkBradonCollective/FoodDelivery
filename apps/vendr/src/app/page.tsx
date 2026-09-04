"use client";

import { useMemo } from "react";
import { MapView } from "@runr/shared/components/map";
import { CoverageTimeline } from "@runr/shared/components/ui/CoverageTimeline";
import { CoverageBadge } from "@runr/shared/components/ui/CoverageBadge";
import { StatusBadge } from "@runr/shared/components/ui/StatusBadge";
import { useAppStore } from "@/store";
import {
  calculateCoverageTimeline,
  getBusinessCoverageSummary,
} from "@runr/shared/lib/coverage-engine";
import { mockOrders } from "@runr/shared/data/mock-data";

const mockActiveRunrs = [
  { name: "James", status: "available", deliveries: 3 },
  { name: "Marcus", status: "on_delivery", deliveries: 2 },
  { name: "Tasha", status: "available", deliveries: 4 },
  { name: "David", status: "returning", deliveries: 1 },
];

export default function BusinessOperationsPage() {
  const { businesses, theme } = useAppStore();
  const business = businesses[0]; // Tony's Pizza for demo

  const coverage = getBusinessCoverageSummary(
    business.coverageRules,
    business.scheduledRuns
  );

  const timeline = useMemo(
    () =>
      calculateCoverageTimeline(business.coverageRules, business.scheduledRuns).filter(
        (i) => i.maxRunrs > 0
      ),
    [business]
  );

  const runrOffsets = [
    { lat: 0.008, lng: -0.006 },
    { lat: -0.005, lng: 0.009 },
    { lat: 0.004, lng: 0.007 },
    { lat: -0.007, lng: -0.004 },
  ];

  const markers = useMemo(
    () => [
      {
        id: "business",
        position: business.location,
        color: "#FF4F00",
        title: business.name,
        subtitle: "Your restaurant",
      },
      ...mockActiveRunrs.map((r, i) => ({
        id: `runr-${i}`,
        position: {
          lat: business.location.lat + runrOffsets[i].lat,
          lng: business.location.lng + runrOffsets[i].lng,
        },
        color: r.status === "available" ? "#22C55E" : "#F97316",
        title: r.name,
        subtitle: r.status.replace("_", " "),
      })),
    ],
    [business]
  );

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:hidden">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">VENDR Business</p>
        <p className="text-sm font-semibold">Sell → Prepare → Dispatch → Fulfill → Grow</p>
        <p className="text-xs text-[var(--muted)]">PORTER orders flow in · RUNRs fill coverage gaps</p>
      </div>

      {/* Map - center on desktop, top on mobile */}
      <div className="relative h-[45vh] lg:h-auto lg:flex-1">
        <MapView
          center={business.location}
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

      {/* Operations panel */}
      <div className="flex-1 overflow-y-auto border-t border-[var(--border)] lg:w-96 lg:shrink-0 lg:border-l lg:border-t-0">
        <div className="space-y-6 p-4 pb-24 lg:pb-4">
          <section className="grid grid-cols-2 gap-3">
            <StatCard
              label="RUNRs"
              value={`${coverage.scheduledRunrs} / ${coverage.maxRunrs}`}
              sub={coverage.gap > 0 ? `${coverage.gap} needed` : "FULL"}
              alert={coverage.gap > 0}
            />
            <StatCard label="Active Orders" value="8" />
            <StatCard label="Active Deliveries" value="5" />
            <StatCard
              label="Coverage"
              value={coverage.status === "full" ? "FULL" : "LOW"}
              alert={coverage.status !== "full"}
            />
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Coverage Timeline</h2>
              <CoverageBadge status={coverage.status} gap={coverage.gap} size="sm" />
            </div>
            <CoverageTimeline intervals={timeline.slice(0, 5)} compact />
          </section>

          <section className="rounded-runr-lg border border-runr-warning/30 bg-runr-warning-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-runr-warning">
              Tonight — Estimated
            </p>
            <p className="mt-2 text-sm">Expected orders: <strong>87</strong></p>
            <p className="text-sm">Recommended RUNRs: <strong>5</strong></p>
            <p className="text-sm">Current scheduled: <strong>{coverage.scheduledRunrs}</strong></p>
            <p className="mt-2 text-sm font-semibold text-runr-warning">
              2 additional RUNRs recommended
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold">Active RUNRs</h2>
            <div className="space-y-2">
              {mockActiveRunrs.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between rounded-runr-md border border-[var(--border)] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        r.status === "available" ? "bg-runr-success" : "bg-runr-warning"
                      }`}
                    />
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <StatusBadge
                    label={r.status.replace("_", " ")}
                    variant={r.status === "available" ? "success" : "warning"}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-semibold">Recent Orders</h2>
            {mockOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-runr-lg border border-[var(--border)] p-4"
              >
                <div className="flex justify-between">
                  <p className="font-semibold">Order #{order.id.slice(-4)}</p>
                  <StatusBadge label={order.status} variant="primary" />
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {order.items.length} items · ${order.total.toFixed(2)}
                </p>
              </div>
            ))}
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
