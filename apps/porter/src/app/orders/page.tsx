"use client";

import Link from "next/link";
import { useAppStore } from "@/store";
import { formatCurrency } from "@runr/shared/lib/utils";
import { StatusBadge } from "@runr/shared/components/ui/StatusBadge";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { ScreenHeader } from "@runr/shared/components/layout/ScreenHeader";
import { CuisinePlate } from "@runr/shared/components/ui/CuisinePlate";

export default function CustomerOrdersPage() {
  const { orders, businesses } = useAppStore();

  return (
    <div>
      <ScreenHeader title="Orders" subtitle="Track and receive" eyebrow="PORTER" />
      <div className="space-y-3 px-5 pb-8 lg:mx-auto lg:max-w-2xl lg:px-8">
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Add dishes from Discover, check out, then follow the RUN here."
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
                className="surface-card flex items-center gap-3 rounded-[24px] p-4"
              >
                <CuisinePlate cuisine={business?.cuisine ?? "Restaurant"} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold text-[var(--foreground)]">{business?.name ?? "Kitchen"}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {order.items.length} items · {formatCurrency(order.total)}
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
