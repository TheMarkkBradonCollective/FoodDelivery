"use client";

import { useAppStore } from "@/store";
import { StatusBadge } from "@porter/shared/components/ui/StatusBadge";
import { EmptyState } from "@porter/shared/components/ui/EmptyState";
import { selectVendorBusiness } from "@porter/shared/lib/utils";
import { SlideToConfirm } from "@porter/shared/components/ui/SlideToConfirm";
import { JobLoop } from "@porter/shared/components/ui/JobLoop";

export default function BusinessOrdersPage() {
  const { orders, businesses, user, updateOrderStatus } = useAppStore();
  const business = selectVendorBusiness(businesses, user?.id);
  const visible = business ? orders.filter((o) => o.businessId === business.id) : orders;

  return (
    <div className="px-5 pb-8 pt-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple">Porter Vendor</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold">Orders</h1>
      <JobLoop app="vendr" className="mt-1" />
      <p className="mt-1 text-sm text-[var(--muted)]">
        Accept, prepare, mark ready. Matching goes to Runners covering your window.
      </p>
      <div className="mt-4 space-y-2">
        {visible.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Porter orders from the marketplace show up here in real time."
          />
        ) : (
          visible.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-extrabold">Order #{order.id.slice(-4)}</p>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    {order.fulfillment === "pickup" ? "Pickup" : "Delivery"} ·{" "}
                    {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")} · $
                    {order.total.toFixed(2)}
                  </p>
                </div>
                <StatusBadge label={order.status.replace("_", " ")} variant="primary" />
              </div>
              {order.status === "new" && (
                <div className="mt-3 space-y-1">
                  <SlideToConfirm
                    label="Slide to accept"
                    onConfirm={() => updateOrderStatus(order.id, "accepted")}
                  />
                  <button
                    type="button"
                    className="h-9 w-full text-xs font-bold text-[var(--muted)]"
                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                  >
                    Decline
                  </button>
                </div>
              )}
              {order.status === "accepted" && (
                <SlideToConfirm
                  className="mt-3"
                  label="Slide to prepare"
                  onConfirm={() => updateOrderStatus(order.id, "preparing")}
                />
              )}
              {order.status === "preparing" && (
                <SlideToConfirm
                  className="mt-3"
                  label="Slide when ready"
                  onConfirm={() => updateOrderStatus(order.id, "ready")}
                />
              )}
              {order.status === "ready" && (
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {order.fulfillment === "pickup"
                    ? "Waiting for the customer to collect."
                    : "Waiting for a Runner covering this window."}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
