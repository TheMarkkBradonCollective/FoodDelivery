"use client";

import { RunCard } from "@/components/ui/RunCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAppStore } from "@/store/app-store";

export default function RunrRunsPage() {
  const { scheduledRuns, runHistory, activeRun, businesses, checkInRun, checkOutRun, cancelRun } =
    useAppStore();

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold">RUNs</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Scheduled, active, and completed RUNs
      </p>

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
  );
}
