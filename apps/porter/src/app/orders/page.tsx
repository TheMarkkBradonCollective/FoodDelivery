"use client";

import Link from "next/link";
import { useAppStore } from "@/store";
import { formatCurrency } from "@runr/shared/lib/utils";
import { StatusBadge } from "@runr/shared/components/ui/StatusBadge";
import { ScreenHeader } from "@runr/shared/components/layout/ScreenHeader";

export default function CustomerOrdersPage() {
  const { orders, businesses } = useAppStore();

  return (
    <div className="min-h-screen">
      <ScreenHeader title="Orders" subtitle="Track → Receive" eyebrow="PORTER" flush />

      <div className="space-y-3 px-4 pt-2">
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
