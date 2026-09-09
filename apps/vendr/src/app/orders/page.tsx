"use client";

import { useAppStore } from "@/store";
import { StatusBadge } from "@runr/shared/components/ui/StatusBadge";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { selectVendorBusiness } from "@runr/shared/lib/utils";
import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";
import { JobLoop } from "@runr/shared/components/ui/JobLoop";

export default function BusinessOrdersPage() {
  const { orders, businesses, user, updateOrderStatus } = useAppStore();
  const business = selectVendorBusiness(businesses, user?.id);
  const visible = business ? orders.filter((o) => o.businessId === business.id) : orders;

  return (
    <div className="px-5 py-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple">VENDR</p>
      <h1 className="mt-1 text-2xl font-extrabold">Orders</h1>
      <JobLoop app="vendr" className="mt-1" />
      <p className="mt-1 text-sm text-[var(--muted)]">
        Accept, prepare, mark ready. Matching goes to RUNRs covering your window — not “send me a driver.”
      </p>
      <div className="mt-6 space-y-3">
        {visible.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="PORTER orders from the marketplace show up here in real time."
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
                    {order.fulfillment === "pickup" ? "Pickup" : "Delivery"} ·{" "}
                    {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")} · $
                    {order.total.toFixed(2)}
                  </p>
                </div>
                <StatusBadge label={order.status.replace("_", " ")} variant="primary" />
              </div>
              {order.status === "new" && (
                <div className="mt-3 flex gap-2">
                  <PrimaryButton className="flex-1" onClick={() => updateOrderStatus(order.id, "accepted")}>
                    Accept
                  </PrimaryButton>
                  <PrimaryButton
                    className="flex-1"
                    variant="secondary"
                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                  >
                    Decline
                  </PrimaryButton>
                </div>
              )}
              {order.status === "accepted" && (
                <PrimaryButton className="mt-3 w-full" onClick={() => updateOrderStatus(order.id, "preparing")}>
                  Start preparing
                </PrimaryButton>
              )}
              {order.status === "preparing" && (
                <PrimaryButton className="mt-3 w-full" onClick={() => updateOrderStatus(order.id, "ready")}>
                  Mark ready
                </PrimaryButton>
              )}
              {order.status === "ready" && (
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {order.fulfillment === "pickup"
                    ? "Waiting for the customer to collect."
                    : "Waiting for a RUNR covering this window."}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
