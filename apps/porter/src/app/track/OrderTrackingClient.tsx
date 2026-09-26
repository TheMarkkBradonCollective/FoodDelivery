"use client";

import Link from "next/link";
import { MapView } from "@porter/shared/components/map";
import { useAppStore } from "@/store";
import { formatCurrency } from "@porter/shared/lib/utils";
import { StatusBadge } from "@porter/shared/components/ui/StatusBadge";
import { IconButton } from "@porter/shared/components/ui/IconButton";
import { EmptyState } from "@porter/shared/components/ui/EmptyState";
import { ArrowLeft } from "lucide-react";

const deliverySteps = [
  { key: "new", label: "Order placed" },
  { key: "accepted", label: "Business accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready for Runner" },
  { key: "runr_assigned", label: "Runner assigned" },
  { key: "picked_up", label: "Picked up" },
  { key: "delivering", label: "On the way" },
  { key: "delivered", label: "Received" },
];

const pickupSteps = [
  { key: "new", label: "Order placed" },
  { key: "accepted", label: "Business accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready for pickup" },
  { key: "delivered", label: "Received" },
];

export function OrderTrackingClient({ orderId }: { orderId: string }) {
  const { orders, businesses, location, theme, updateOrderStatus, showToast } = useAppStore();

  const order = orders.find((o) => o.id === orderId);
  const business = order ? businesses.find((b) => b.id === order.businessId) : null;

  if (!order || !business) {
    return (
      <div className="px-5 py-8">
        <EmptyState
          title="Order not found"
          description="This order isn’t on this device. Open it from Orders after you place it."
          action={
            <Link href="/orders" className="inline-flex h-11 items-center rounded-full bg-purple px-5 text-sm font-bold text-white">
              View orders
            </Link>
          }
        />
      </div>
    );
  }

  const statusSteps = order.fulfillment === "pickup" ? pickupSteps : deliverySteps;
  const currentStep = Math.max(0, statusSteps.findIndex((s) => s.key === order.status));
  const canConfirmReceive =
    order.fulfillment === "pickup"
      ? order.status === "ready"
      : order.status === "delivering" || order.status === "picked_up";

  return (
    <div>
      <div className="relative h-52 overflow-hidden md:h-72 lg:h-[20rem]">
        <MapView
          center={location}
          markers={[
            {
              id: "restaurant",
              position: business.location,
              color: "#7048F8",
              title: business.name,
              subtitle: "Pickup",
            },
            {
              id: "customer",
              position: location,
              color: "#A0F878",
              title: order.fulfillment === "pickup" ? "Pickup" : "Drop-off",
            },
          ]}
          route={
            order.fulfillment === "pickup"
              ? undefined
              : { from: business.location, to: location }
          }
          showUserLocation={false}
          dark={theme === "dark"}
          className="absolute inset-0"
        />
        <div className="absolute left-4 top-4">
          <IconButton href="/orders" label="Back to orders">
            <ArrowLeft size={18} />
          </IconButton>
        </div>
      </div>

      <div className="-mt-6 px-5 pb-8 lg:mx-auto lg:max-w-xl">
        <div className="rounded-2xl bg-[var(--surface-elevated)] p-4 shadow-porter-card ring-1 ring-[var(--border)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[1.25rem] font-extrabold text-[var(--foreground)]">{business.name}</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Order #{order.id.slice(-4)} · {formatCurrency(order.total)}
              </p>
              {order.fulfillment === "pickup" ? (
                <p className="mt-1 text-sm text-[var(--muted)]">Pickup at {business.address}</p>
              ) : order.deliveryAddress ? (
                <p className="mt-1 text-sm text-[var(--muted)]">Deliver to {order.deliveryAddress}</p>
              ) : null}
              {order.scheduledFor ? (
                <p className="mt-1 text-sm text-[var(--muted)]">Scheduled for {order.scheduledFor}</p>
              ) : null}
            </div>
            <StatusBadge label={order.status.replace(/_/g, " ")} variant="primary" />
          </div>

          <div className="mt-4 space-y-2.5">
            {statusSteps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${i <= currentStep ? "bg-purple" : "bg-[var(--border)]"}`} />
                <span className={`text-sm ${i <= currentStep ? "font-bold text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm text-[var(--muted)]">
            {order.fulfillment === "pickup"
              ? `Collect at the business. Estimated ready in ${business.etaMinutes} minutes.`
              : `Watch your Runner on the map. Estimated ${business.etaMinutes} minutes after pickup.`}
          </p>

          {canConfirmReceive ? (
            <button
              type="button"
              className="tap-target mt-5 h-12 w-full rounded-full bg-purple text-sm font-extrabold text-white"
              onClick={() => {
                updateOrderStatus(order.id, "delivered");
                showToast("Order received");
              }}
            >
              I received this order
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
