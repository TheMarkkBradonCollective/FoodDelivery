"use client";

import { EarningsCard } from "@runr/shared/components/ui/EarningsCard";
import { useAppStore } from "@/store";
import { formatCurrency } from "@runr/shared/lib/utils";

export default function RunrEarningsPage() {
  const { earnings } = useAppStore();

  const deliveryPay = earnings.reduce((s, e) => s + e.basePay + e.distancePay, 0);
  const tips = earnings.reduce((s, e) => s + e.tip, 0);
  const total = earnings.reduce((s, e) => s + e.total, 0);

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Per-delivery pay — not hourly guaranteed income
      </p>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Today
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <EarningsCard label="Delivery earnings" amount={deliveryPay} />
          <EarningsCard label="Tips" amount={tips} />
          <EarningsCard label="Bonuses" amount={0} />
          <EarningsCard label="Total" amount={total} highlight />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Delivery History
        </h2>
        <div className="space-y-3">
          {earnings.map((e) => (
            <div
              key={e.id}
              className="rounded-runr-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{e.businessName}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(e.completedAt).toLocaleTimeString()}
                  </p>
                </div>
                <p className="font-bold text-runr-success">{formatCurrency(e.total)}</p>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-[var(--muted)]">
                <span>Pay {formatCurrency(e.basePay + e.distancePay)}</span>
                <span>Tip {formatCurrency(e.tip)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
