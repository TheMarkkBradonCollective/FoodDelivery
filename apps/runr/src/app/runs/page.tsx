"use client";

import { useState } from "react";
import Link from "next/link";
import { RunCard } from "@runr/shared/components/ui/RunCard";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { ConfirmDialog } from "@runr/shared/components/ui/ConfirmDialog";
import { SlideToConfirm } from "@runr/shared/components/ui/SlideToConfirm";
import { useAppStore } from "@/store";
import { getBusinessCoverageSummary } from "@runr/shared/lib/coverage-engine";
import { calculateDistanceMiles, formatCurrency } from "@runr/shared/lib/utils";
import { Bike } from "lucide-react";
import { CatalogPreviewBanner } from "@runr/shared/components/ui/CatalogPreviewBanner";

export default function RunrRunsPage() {
  const {
    scheduledRuns,
    runHistory,
    activeRun,
    businesses,
    location,
    checkInRun,
    checkOutRun,
    cancelRun,
  } = useAppStore();
  const [cancelId, setCancelId] = useState<string | null>(null);

  const available = businesses
    .map((b) => {
      const coverage = getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns);
      const miles = calculateDistanceMiles(location, b.location);
      const payout = b.deliveryFee + 4.5 + miles * 1.25;
      return { business: b, coverage, miles, payout };
    })
    .filter((row) => row.coverage.status !== "full")
    .sort((a, b) => b.payout - a.payout);

  return (
    <div>
      <div className="px-5 pt-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">RUNR</p>
        <h1 className="mt-0.5 text-[1.375rem] font-extrabold text-[var(--foreground)]">RUNs</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cover a VENDR from a time you pick. PORTER orders match to that window.
        </p>
      </div>
      <div className="px-5 pb-8 pt-3">
        <CatalogPreviewBanner className="mb-3" />
        <section>
          <h2 className="mb-2 text-base font-extrabold">Available RUNs</h2>
          {available.length === 0 ? (
            <EmptyState
              title="No open RUNs right now"
              description="Businesses with coverage gaps show up here. Check the map to schedule a window."
            />
          ) : (
            <div className="space-y-3">
              {available.map(({ business, coverage, miles, payout }) => (
                <Link
                  key={business.id}
                  href={`/?kitchen=${business.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A0F878]">
                    <Bike className="h-5 w-5 text-[#1A1224]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">{business.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {miles.toFixed(1)} mi · {coverage.gap} RUNR{coverage.gap === 1 ? "" : "s"} needed
                    </p>
                  </div>
                  <p className="text-sm font-extrabold text-[#6B8F5A]">{formatCurrency(payout)}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

      {activeRun && (
        <section className="mt-6">
          <h2 className="mb-2 text-base font-extrabold text-runr-success">Active RUN</h2>
          <RunCard
            run={activeRun}
            businessName={
              businesses.find((b) => b.id === activeRun.businessId)?.name ?? "Business"
            }
          />
          <div className="mt-2">
            {activeRun.status === "scheduled" && (
              <SlideToConfirm label="Slide to check in" onConfirm={checkInRun} />
            )}
            {activeRun.status === "checked_in" && (
              <button
                type="button"
                onClick={checkOutRun}
                className="h-10 w-full rounded-full text-sm font-bold text-[var(--muted)]"
              >
                End RUN
              </button>
            )}
          </div>
        </section>
      )}

      {scheduledRuns.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-base font-extrabold">Upcoming</h2>
          <div className="space-y-2">
            {scheduledRuns.map((run) => (
              <div key={run.id}>
                <RunCard
                  run={run}
                  businessName={
                    businesses.find((b) => b.id === run.businessId)?.name ?? "Business"
                  }
                />
                <button
                  type="button"
                  className="mt-1 h-9 w-full text-xs font-bold text-[var(--muted)]"
                  onClick={() => setCancelId(run.id)}
                >
                  Cancel RUN
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-base font-extrabold">RUN history</h2>
        <div className="space-y-3">
          {runHistory.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Completed RUNs land here after you check out.</p>
          ) : (
            runHistory.map((run) => (
              <RunCard
                key={run.id}
                run={run}
                businessName={
                  businesses.find((b) => b.id === run.businessId)?.name ?? "Business"
                }
              />
            ))
          )}
        </div>
      </section>
      </div>
      <ConfirmDialog
        open={Boolean(cancelId)}
        title="Cancel this RUN?"
        description="The coverage window will open back up for other RUNRs. You can book another kitchen from the map."
        confirmLabel="Cancel RUN"
        destructive
        onCancel={() => setCancelId(null)}
        onConfirm={() => {
          if (cancelId) cancelRun(cancelId);
          setCancelId(null);
        }}
      />
    </div>
  );
}
