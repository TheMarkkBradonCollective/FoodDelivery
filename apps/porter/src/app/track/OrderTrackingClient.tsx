"use client";

import Link from "next/link";
import { MapView } from "@runr/shared/components/map";
import { useAppStore } from "@/store";
import { formatCurrency } from "@runr/shared/lib/utils";
import { StatusBadge } from "@runr/shared/components/ui/StatusBadge";
import { IconButton } from "@runr/shared/components/ui/IconButton";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { ArrowLeft } from "lucide-react";

const statusSteps = [
  { key: "new", label: "Order placed" },
  { key: "accepted", label: "Kitchen accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready for RUNR" },
  { key: "runr_assigned", label: "RUNR assigned" },
  { key: "picked_up", label: "Picked up" },
  { key: "delivering", label: "On the way" },
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

  const currentStep = Math.max(0, statusSteps.findIndex((s) => s.key === order.status));
  const canConfirmReceive = order.status === "delivering" || order.status === "picked_up";

  return (
    <div>
      <div className="relative h-64 overflow-hidden md:h-80 lg:h-[22rem]">
        <MapView
          center={location}
          markers={[
            {
              id: "restaurant",
              position: business.location,
              color: "#7048F8",
              title: business.name,
              subtitle: "Kitchen",
            },
            {
              id: "customer",
              position: location,
              color: "#A0F878",
              title: "Drop-off",
            },
          ]}
          dark={theme === "dark"}
          className="absolute inset-0"
        />
        <div className="absolute left-4 top-4">
          <IconButton href="/orders" label="Back to orders">
            <ArrowLeft size={18} />
          </IconButton>
        </div>
      </div>

      <div className="-mt-8 px-4 pb-8 lg:mx-auto lg:max-w-xl">
        <div className="rounded-[28px] bg-[var(--surface-elevated)] p-5 shadow-runr-card ring-1 ring-[var(--border)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-[var(--foreground)]">{business.name}</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Order #{order.id.slice(-4)} · {formatCurrency(order.total)}
              </p>
              {order.deliveryAddress ? (
                <p className="mt-1 text-sm text-[var(--muted)]">Deliver to {order.deliveryAddress}</p>
              ) : null}
            </div>
            <StatusBadge label={order.status.replace(/_/g, " ")} variant="primary" />
          </div>

          <div className="mt-6 space-y-3">
            {statusSteps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${i <= currentStep ? "bg-purple" : "bg-[var(--border)]"}`} />
                <span className={`text-sm ${i <= currentStep ? "font-bold text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm text-[var(--muted)]">Estimated arrival {business.etaMinutes} minutes after pickup.</p>

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
