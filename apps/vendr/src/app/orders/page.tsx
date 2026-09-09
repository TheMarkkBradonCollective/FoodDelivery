"use client";

import { useAppStore } from "@/store";
import { StatusBadge } from "@runr/shared/components/ui/StatusBadge";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { selectVendorBusiness } from "@runr/shared/lib/utils";
import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";

export default function BusinessOrdersPage() {
  const { orders, businesses, user, updateOrderStatus } = useAppStore();
  const business = selectVendorBusiness(businesses, user?.id);
  const visible = business ? orders.filter((o) => o.businessId === business.id) : orders;

  const nextStatus: Record<string, string | undefined> = {
    new: "accepted",
    accepted: "preparing",
    preparing: "ready",
    ready: "runr_assigned",
  };

  return (
    <div className="px-5 py-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple">VENDR</p>
      <h1 className="mt-1 text-2xl font-extrabold">Orders</h1>
      <div className="mt-6 space-y-3">
        {visible.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Orders from PORTER show up here in real time."
          />
        ) : (
          visible.map((order) => (
            <div
              key={order.id}
              className="rounded-runr-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">Order #{order.id.slice(-4)}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")} · $
                    {order.total.toFixed(2)}
                  </p>
                </div>
                <StatusBadge label={order.status.replace("_", " ")} variant="primary" />
              </div>
              {nextStatus[order.status] && (
                <PrimaryButton
                  className="mt-3"
                  onClick={() =>
                    updateOrderStatus(order.id, nextStatus[order.status] as typeof order.status)
                  }
                >
                  Mark {nextStatus[order.status]?.replace("_", " ")}
                </PrimaryButton>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
