"use client";

import Link from "next/link";
import { useAppStore } from "@/store";
import { formatCurrency } from "@runr/shared/lib/utils";
import { StatusBadge } from "@runr/shared/components/ui/StatusBadge";

export default function CustomerOrdersPage() {
  const { orders, businesses } = useAppStore();

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="mt-6 space-y-3">
        {orders.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No orders yet. Add items from Discover.</p>
        ) : (
          orders.map((order) => {
          const business = businesses.find((b) => b.id === order.businessId);
          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-runr-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{business?.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {order.items.length} items · {formatCurrency(order.total)}
                  </p>
                </div>
                <StatusBadge label={order.status.replace("_", " ")} variant="primary" />
              </div>
            </Link>
          );
        })
        )}
      </div>

    </div>
  );
}
