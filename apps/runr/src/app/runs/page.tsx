"use client";

import { RunCard } from "@runr/shared/components/ui/RunCard";
import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";
import { useAppStore } from "@/store";

export default function RunrRunsPage() {
  const { scheduledRuns, runHistory, activeRun, businesses, checkInRun, checkOutRun, cancelRun } =
    useAppStore();

  return (
    <div className="min-h-screen">
      <div className="brand-hero brand-hero--flush px-5 pb-10 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">RUNR</p>
        <h1 className="mt-1 text-2xl font-extrabold text-white">RUNs</h1>
        <p className="mt-1 text-sm text-white/75">Scheduled, active, and completed</p>
      </div>
      <div className="px-4 pt-2">

      {activeRun && (
        <section className="mt-6">
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
                  onClick={() => cancelRun(run.id)}
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
          {runHistory.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              businessName={
                businesses.find((b) => b.id === run.businessId)?.name ?? "Business"
              }
            />
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
