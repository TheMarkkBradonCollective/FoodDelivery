"use client";

import Link from "next/link";
import { MapView } from "@runr/shared/components/map";
import { useAppStore } from "@/store";
import { formatCurrency } from "@runr/shared/lib/utils";
import { StatusBadge } from "@runr/shared/components/ui/StatusBadge";
import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";
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
  const { orders, businesses, location, theme, updateOrderStatus } = useAppStore();

  const order = orders.find((o) => o.id === orderId);
  const business = order ? businesses.find((b) => b.id === order.businessId) : null;

  if (!order || !business) {
    return <div className="p-6">Order not found</div>;
  }

  const currentStep = Math.max(0, statusSteps.findIndex((s) => s.key === order.status));
  const canConfirmReceive = order.status === "delivering" || order.status === "picked_up";

  return (
    <div className="min-h-screen">
      <div className="relative h-72">
        <MapView
          center={location}
          markers={[
            {
              id: "restaurant",
              position: business.location,
              color: "#7048F8",
              title: business.name,
              subtitle: "Restaurant",
            },
            {
              id: "customer",
              position: location,
              color: "#A0F878",
              title: "Your location",
            },
          ]}
          dark={theme === "dark"}
          className="absolute inset-0"
        />
        <Link
          href="/orders"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] shadow-runr-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{business.name}</h1>
          <StatusBadge label={order.status.replace("_", " ")} variant="primary" />
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Order #{order.id.slice(-4)} · {formatCurrency(order.total)}
        </p>
        {order.deliveryAddress && (
          <p className="mt-1 text-sm text-[var(--muted)]">Deliver to {order.deliveryAddress}</p>
        )}
        <p className="mt-2 text-xs text-[var(--muted)]">
          Track your RUNR on the map as your order moves
        </p>

        <div className="mt-6 space-y-3">
          {statusSteps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  i <= currentStep ? "bg-runr-primary" : "bg-runr-neutral-200"
                }`}
              />
              <span
                className={`text-sm ${
                  i <= currentStep
                    ? "font-medium text-[var(--foreground)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-[var(--muted)]">
          Estimated arrival: {business.etaMinutes} minutes
        </p>

        {canConfirmReceive && (
          <PrimaryButton className="mt-6 w-full" onClick={() => updateOrderStatus(order.id, "delivered")}>
            I received this order
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
