"use client";

import Link from "next/link";
import { MapView } from "@runr/shared/components/map";
import { useAppStore } from "@/store";
import { formatCurrency } from "@runr/shared/lib/utils";
import { StatusBadge } from "@runr/shared/components/ui/StatusBadge";
import { ArrowLeft } from "lucide-react";

const statusSteps = [
  "accepted",
  "preparing",
  "runr_assigned",
  "picked_up",
  "delivering",
  "delivered",
];

export function OrderTrackingClient({ orderId }: { orderId: string }) {
  const { orders, businesses, location, theme } = useAppStore();

  const order = orders.find((o) => o.id === orderId);
  const business = order ? businesses.find((b) => b.id === order.businessId) : null;

  if (!order || !business) {
    return <div className="p-6">Order not found</div>;
  }

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen">
      <div className="relative h-72">
        <MapView
          center={location}
          markers={[
            {
              id: "restaurant",
              position: business.location,
              color: "#2563EB",
              title: business.name,
              subtitle: "Restaurant",
            },
            {
              id: "customer",
              position: location,
              color: "#3B82F6",
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
        <p className="mt-2 text-xs text-[var(--muted)]">
          Track your RUNR on the map as your order moves
        </p>

        <div className="mt-6 space-y-3">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  i <= currentStep ? "bg-runr-primary" : "bg-runr-neutral-200"
                }`}
              />
              <span
                className={`text-sm capitalize ${
                  i <= currentStep
                    ? "font-medium text-[var(--foreground)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {step.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-[var(--muted)]">
          Estimated arrival: {business.etaMinutes} minutes
        </p>
      </div>
    </div>
  );
}
