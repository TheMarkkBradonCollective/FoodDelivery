"use client";

import { cn, formatCurrency } from "../../lib/utils";
import type { Delivery } from "../../types/index";
import { PrimaryButton } from "./PrimaryButton";

interface DeliveryCardProps {
  delivery: Delivery;
  businessName: string;
  onAccept?: () => void;
  onNavigate?: () => void;
  onComplete?: () => void;
  completeLabel?: string;
  variant?: "offer" | "pickup" | "dropoff" | "complete";
  className?: string;
}

export function DeliveryCard({
  delivery,
  businessName,
  onAccept,
  onNavigate,
  onComplete,
  completeLabel,
  variant = "offer",
  className,
}: DeliveryCardProps) {
  return (
    <div
      className={cn(
        "rounded-runr-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-runr-card",
        variant === "offer" && "border-runr-primary/30 ring-2 ring-runr-primary/10",
        className
      )}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-runr-primary">
        {variant === "offer" && "New Delivery"}
        {variant === "pickup" && "Pickup"}
        {variant === "dropoff" && "Deliver To"}
        {variant === "complete" && "Delivery Complete"}
      </p>
      <h3 className="mt-0.5 text-base font-extrabold text-[var(--foreground)]">
        {variant === "dropoff" ? delivery.customerName : businessName}
      </h3>

      <p className="mt-2 text-xs text-[var(--muted)]">
        {delivery.distanceMiles.toFixed(1)} mi · {delivery.estimatedMinutes} min ·{" "}
        <span className="font-semibold text-[var(--foreground)]">
          {formatCurrency(delivery.totalEarnings)}
        </span>
      </p>

      {delivery.instructions && variant === "dropoff" && (
        <p className="mt-2 rounded-runr-md bg-[var(--background)] px-3 py-2 text-sm">
          {delivery.instructions}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {variant === "offer" && onAccept && (
          <PrimaryButton className="w-full" onClick={onAccept}>
            Accept
          </PrimaryButton>
        )}
        {(variant === "pickup" || variant === "dropoff") && onNavigate && (
          <PrimaryButton className="flex-1" variant="secondary" onClick={onNavigate}>
            Navigate
          </PrimaryButton>
        )}
        {(variant === "pickup" || variant === "dropoff") && onComplete && (
          <PrimaryButton className="flex-1" onClick={onComplete}>
            {completeLabel ?? "Complete"}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
