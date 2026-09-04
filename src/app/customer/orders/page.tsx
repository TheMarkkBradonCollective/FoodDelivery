"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { customerNav } from "../CustomerLayoutClient";

export default function CustomerOrdersPage() {
  const { orders, businesses } = useAppStore();

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="mt-6 space-y-3">
        {orders.map((order) => {
          const business = businesses.find((b) => b.id === order.businessId);
          return (
            <Link
              key={order.id}
              href={`/customer/orders/${order.id}`}
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
        })}
      </div>

      <BottomNavigation items={customerNav} />
    </div>
  );
}
