"use client";

import { EarningsCard } from "@porter/shared/components/ui/EarningsCard";
import { EmptyState } from "@porter/shared/components/ui/EmptyState";
import { ScreenHeader } from "@porter/shared/components/layout/ScreenHeader";
import { useAppStore } from "@/store";
import { formatCurrency } from "@porter/shared/lib/utils";

export default function RunrEarningsPage() {
  const { earnings } = useAppStore();

  const deliveryPay = earnings.reduce((s, e) => s + e.basePay + e.distancePay, 0);
  const tips = earnings.reduce((s, e) => s + e.tip, 0);
  const total = earnings.reduce((s, e) => s + e.total, 0);

  return (
    <div>
      <ScreenHeader
        eyebrow="Portr Runner"
        title="Earnings"
        subtitle="Per-delivery pay — base, distance, and tips. Not hourly."
      />
      <div className="px-5 pb-8">
        <h2 className="mb-2 text-base font-extrabold">Today</h2>
        <div className="grid grid-cols-3 gap-2">
          <EarningsCard label="Delivery pay" amount={deliveryPay} />
          <EarningsCard label="Tips" amount={tips} />
          <EarningsCard label="Total" amount={total} highlight />
        </div>

        <h2 className="mb-2 mt-6 text-base font-extrabold">Delivery history</h2>
        <div className="space-y-2">
          {earnings.length === 0 ? (
            <EmptyState
              title="No deliveries yet"
              description="Accept a RUN, pick up an order, and completed drops land here with pay and tips."
            />
          ) : (
            earnings.map((e) => (
              <div key={e.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-extrabold">{e.businessName}</p>
                    <p className="text-xs text-[var(--muted)]">{new Date(e.completedAt).toLocaleTimeString()}</p>
                  </div>
                  <p className="shrink-0 font-extrabold text-porter-success">{formatCurrency(e.total)}</p>
                </div>
                <div className="mt-1.5 flex gap-4 text-xs text-[var(--muted)]">
                  <span>Pay {formatCurrency(e.basePay + e.distancePay)}</span>
                  <span>Tip {formatCurrency(e.tip)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
