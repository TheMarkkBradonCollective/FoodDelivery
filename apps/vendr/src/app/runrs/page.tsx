"use client";

import { useAppStore } from "@/store";
import { StatusBadge } from "@porter/shared/components/ui/StatusBadge";
import { EmptyState } from "@porter/shared/components/ui/EmptyState";
import { selectVendorBusiness } from "@porter/shared/lib/utils";

export default function BusinessRunrsPage() {
  const { businesses, user } = useAppStore();
  const business = selectVendorBusiness(businesses, user?.id);

  if (!business) {
    return (
      <div className="px-5 py-8">
        <EmptyState title="No business connected" description="Sign in with your Portr Vendor account." />
      </div>
    );
  }

  return (
    <div className="px-5 pb-8 pt-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple">Portr Vendor</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold">Active Runners</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Runners covering {business.name} right now — not drivers you ping one order at a time.
      </p>

      <div className="mt-4 space-y-2">
        {business.scheduledRuns.length === 0 ? (
          <EmptyState
            title="No Runners scheduled"
            description="Coverage gaps show on the map until a Runner books a window."
          />
        ) : (
          business.scheduledRuns.map((run) => (
            <div
              key={run.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-3"
            >
              <div>
                <p className="font-semibold">Runner #{run.runrId.slice(-4)}</p>
                <p className="text-sm text-[var(--muted)]">
                  {run.startTime} – {run.endTime}
                </p>
              </div>
              <StatusBadge label={run.status} variant="success" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
