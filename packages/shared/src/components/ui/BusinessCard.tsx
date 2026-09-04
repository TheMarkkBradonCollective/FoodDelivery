"use client";

import { cn } from "../../lib/utils";
import { Star } from "lucide-react";
import type { Business } from "../../types/index";
import { CoverageBadge } from "./CoverageBadge";
import { calculateDistanceMiles, formatCurrency } from "../../lib/utils";
import { getBusinessCoverageSummary } from "../../lib/coverage-engine";

interface BusinessCardProps {
  business: Business;
  userLocation: { lat: number; lng: number };
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onClick?: () => void;
  className?: string;
}

export function BusinessCard({
  business,
  userLocation,
  isFavorite,
  onFavoriteToggle,
  onClick,
  className,
}: BusinessCardProps) {
  const distance = calculateDistanceMiles(userLocation, business.location);
  const coverage = getBusinessCoverageSummary(
    business.coverageRules,
    business.scheduledRuns
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-runr-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-left shadow-runr-card transition-transform active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-[var(--foreground)]">
              {business.name}
            </h3>
            {onFavoriteToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle();
                }}
                className="shrink-0"
                aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    isFavorite
                      ? "fill-runr-warning text-runr-warning"
                      : "text-runr-neutral-300"
                  )}
                />
              </button>
            )}
          </div>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            {business.cuisine} · {distance.toFixed(1)} mi · {business.etaMinutes} min
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium">★ {business.rating}</span>
            <span className="text-xs text-[var(--muted)]">
              Delivery {formatCurrency(business.deliveryFee)}
            </span>
          </div>
        </div>
        <CoverageBadge status={coverage.status} gap={coverage.gap} size="sm" />
      </div>
    </button>
  );
}
