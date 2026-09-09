"use client";

import { useState } from "react";
import Link from "next/link";
import { RunCard } from "@runr/shared/components/ui/RunCard";
import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { ConfirmDialog } from "@runr/shared/components/ui/ConfirmDialog";
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
    <div className="min-h-screen">
      <div className="px-5 pt-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">RUNR</p>
        <h1 className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">RUNs</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Choose → RUN → Deliver → Earn</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cover a VENDR from a time you pick. PORTER orders match to that window.
        </p>
      </div>
      <div className="px-4 pt-2">
        <CatalogPreviewBanner className="mb-3" />
        <section className="mt-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Available RUNs
          </h2>
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
                  className="flex items-center gap-3 rounded-runr-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-runr-card"
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
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-runr-success">
            Active RUN
          </h2>
          <RunCard
            run={activeRun}
            businessName={
              businesses.find((b) => b.id === activeRun.businessId)?.name ?? "Business"
            }
          />
          <div className="mt-3 flex gap-2">
            {activeRun.status === "scheduled" && (
              <PrimaryButton className="flex-1" onClick={checkInRun}>
                Check In
              </PrimaryButton>
            )}
            {activeRun.status === "checked_in" && (
              <PrimaryButton className="flex-1" variant="secondary" onClick={checkOutRun}>
                End RUN
              </PrimaryButton>
            )}
          </div>
        </section>
      )}

      {scheduledRuns.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Upcoming
          </h2>
          <div className="space-y-3">
            {scheduledRuns.map((run) => (
              <div key={run.id}>
                <RunCard
                  run={run}
                  businessName={
                    businesses.find((b) => b.id === run.businessId)?.name ?? "Business"
                  }
                />
                <PrimaryButton
                  className="mt-2 w-full"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCancelId(run.id)}
                >
                  Cancel RUN
                </PrimaryButton>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          RUN History
        </h2>
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
