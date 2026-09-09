"use client";

import { useAppStore } from "@/store";
import { StatusBadge } from "@runr/shared/components/ui/StatusBadge";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";

export default function BusinessOrdersPage() {
  const { orders } = useAppStore();

  return (
    <div className="px-4 py-6 pb-24 lg:pb-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="mt-6 space-y-3">
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Orders from PORTER will show up here once your business is live."
          />
        ) : (
          orders.map((order) => (
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
