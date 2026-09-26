"use client";

import Link from "next/link";
import { useAppStore } from "@/store";
import { formatCurrency } from "@porter/shared/lib/utils";
import { StatusBadge } from "@porter/shared/components/ui/StatusBadge";
import { EmptyState } from "@porter/shared/components/ui/EmptyState";
import { ScreenHeader } from "@porter/shared/components/layout/ScreenHeader";
import { CuisinePlate } from "@porter/shared/components/ui/CuisinePlate";

export default function CustomerOrdersPage() {
  const { orders, businesses } = useAppStore();

  return (
    <div>
      <ScreenHeader title="Orders" subtitle="Track, receive, and keep receipts" eyebrow="FastFood" />
      <div className="space-y-3 px-5 pb-8 lg:mx-auto lg:max-w-2xl lg:px-8">
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Add items from Discover, check out, then follow your Runner here."
            action={
              <Link href="/" className="inline-flex h-11 items-center rounded-full bg-purple px-5 text-sm font-bold text-white">
                Start an order
              </Link>
            }
          />
        ) : (
          orders.map((order) => {
            const business = businesses.find((b) => b.id === order.businessId);
            return (
              <Link
                key={order.id}
                href={`/track/?id=${order.id}`}
                className="surface-card flex items-center gap-3 rounded-2xl p-3.5"
              >
                <CuisinePlate cuisine={business?.cuisine ?? "Restaurant"} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold text-[var(--foreground)]">{business?.name ?? "Business"}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {order.fulfillment === "pickup" ? "Pickup" : "Delivery"} · {order.items.length} items · {formatCurrency(order.total)}
                  </p>
                </div>
                <StatusBadge label={order.status.replace(/_/g, " ")} variant="primary" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
