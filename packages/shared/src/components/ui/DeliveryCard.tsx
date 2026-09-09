"use client";

import { cn, formatCurrency } from "../../lib/utils";
import type { Delivery } from "../../types/index";
import { PrimaryButton } from "./PrimaryButton";
import { MapPin, Clock, DollarSign } from "lucide-react";

interface DeliveryCardProps {
  delivery: Delivery;
  businessName: string;
  onAccept?: () => void;
  onNavigate?: () => void;
  variant?: "offer" | "pickup" | "dropoff" | "complete";
  className?: string;
}

export function DeliveryCard({
  delivery,
  businessName,
  onAccept,
  onNavigate,
  variant = "offer",
  className,
}: DeliveryCardProps) {
  return (
    <div
      className={cn(
        "rounded-runr-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-runr-card",
        variant === "offer" && "border-runr-primary/30 ring-2 ring-runr-primary/10",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-runr-primary">
        {variant === "offer" && "New Delivery"}
        {variant === "pickup" && "Pickup"}
        {variant === "dropoff" && "Deliver To"}
        {variant === "complete" && "Delivery Complete"}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
        {variant === "dropoff" ? delivery.customerName : businessName}
      </h3>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <MapPin className="h-4 w-4" />
          <span>{delivery.distanceMiles.toFixed(1)} miles</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Clock className="h-4 w-4" />
          <span>{delivery.estimatedMinutes} min estimated</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
          <DollarSign className="h-4 w-4 text-runr-success" />
          <span>
            {formatCurrency(delivery.totalEarnings)} delivery earnings
            {variant === "complete" && delivery.tip > 0 && (
              <> + {formatCurrency(delivery.tip)} tip</>
            )}
          </span>
        </div>
      </div>

      {delivery.instructions && variant === "dropoff" && (
        <p className="mt-3 rounded-runr-md bg-[var(--background)] px-3 py-2 text-sm">
          {delivery.instructions}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {variant === "offer" && onAccept && (
          <PrimaryButton className="w-full" onClick={onAccept}>
            Accept
          </PrimaryButton>
        )}
        {(variant === "pickup" || variant === "dropoff") && onNavigate && (
          <PrimaryButton className="w-full" onClick={onNavigate}>
            Navigate
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
