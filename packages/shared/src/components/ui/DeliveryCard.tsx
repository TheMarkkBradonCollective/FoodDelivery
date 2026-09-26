"use client";

import { cn, formatCurrency } from "../../lib/utils";
import type { Delivery } from "../../types/index";
import { SlideToConfirm } from "./SlideToConfirm";

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
        "rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5",
        variant === "offer" && "border-porter-primary/30 ring-2 ring-porter-primary/10",
        className
      )}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-porter-primary">
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
        <p className="mt-2 rounded-porter-md bg-[var(--background)] px-3 py-2 text-sm">
          {delivery.instructions}
        </p>
      )}

      {variant === "offer" && onAccept ? (
        <SlideToConfirm className="mt-3" label="Slide to accept" onConfirm={onAccept} />
      ) : null}

      {(variant === "pickup" || variant === "dropoff") && (onNavigate || onComplete) ? (
        <div className="mt-3 space-y-2">
          {onComplete ? (
            <SlideToConfirm label={completeLabel ?? "Slide to complete"} onConfirm={onComplete} />
          ) : null}
          {onNavigate ? (
            <button
              type="button"
              onClick={onNavigate}
              className="h-9 w-full rounded-full text-xs font-bold text-purple"
            >
              Open map
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
