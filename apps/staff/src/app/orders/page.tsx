"use client";

import { useAppStore } from "@/store";
import { formatCurrency } from "@runr/shared/lib/utils";
import { Panel } from "@/components/StaffUi";

export default function StaffOrdersPage() {
  const { orders, businesses, runHistory, earnings } = useAppStore();

  return (
    <div className="p-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">STAFF</p>
      <h1 className="mt-1 text-2xl font-extrabold">Orders</h1>
      <Panel title="All marketplace orders" className="mt-6">
        {orders.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => {
              const biz = businesses.find((b) => b.id === order.businessId);
              return (
                <div
                  key={order.id}
                  className="flex justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
                >
                  <span>
                    #{order.id.slice(-6)} · {biz?.name} · {order.status}
                  </span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-4 text-xs text-[var(--muted)]">
          Completed RUNs: {runHistory.length} · RUNR earnings tracked:{" "}
          {formatCurrency(earnings.reduce((s, e) => s + e.total, 0))}
        </p>
      </Panel>
    </div>
  );
}
