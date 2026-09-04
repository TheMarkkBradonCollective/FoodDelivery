"use client";

import { useAppStore } from "@/store/app-store";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockOrders } from "@/data/mock-data";

export default function BusinessOrdersPage() {
  const { orders } = useAppStore();
  const allOrders = [...orders, ...mockOrders];

  return (
    <div className="px-4 py-6 pb-24 lg:pb-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="mt-6 space-y-3">
        {allOrders.map((order) => (
          <div
            key={order.id}
            className="rounded-runr-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">Order #{order.id.slice(-4)}</p>
                <p className="text-sm text-[var(--muted)]">
                  {order.items.length} items · ${order.total.toFixed(2)}
                </p>
              </div>
              <StatusBadge label={order.status.replace("_", " ")} variant="primary" />
            </div>
            {order.status === "preparing" && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Estimated ready: 7:20 PM
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
