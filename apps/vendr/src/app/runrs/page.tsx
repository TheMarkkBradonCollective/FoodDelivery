"use client";

import { useAppStore } from "@/store";
import { StatusBadge } from "@runr/shared/components/ui/StatusBadge";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { selectVendorBusiness } from "@runr/shared/lib/utils";

export default function BusinessRunrsPage() {
  const { businesses, user } = useAppStore();
  const business = selectVendorBusiness(businesses, user?.id);

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <EmptyState title="No business connected" description="Sign in with your VENDR account." />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 lg:pb-6">
      <h1 className="text-2xl font-bold">Active RUNRs</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        RUNRs currently scheduled at {business.name}
      </p>

      <div className="mt-6 space-y-3">
        {business.scheduledRuns.length === 0 ? (
          <EmptyState
            title="No RUNRs scheduled"
            description="Coverage gaps show on the map until a RUNR books a window."
          />
        ) : (
          business.scheduledRuns.map((run) => (
            <div
              key={run.id}
              className="rounded-runr-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">RUNR #{run.runrId.slice(-4)}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {run.startTime} – {run.endTime}
                  </p>
                </div>
                <StatusBadge label={run.status} variant="success" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
