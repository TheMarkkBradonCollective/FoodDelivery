"use client";

import { cn } from "../../lib/utils";
import { Star } from "lucide-react";
import type { Business } from "../../types/index";
import { CoverageBadge } from "./CoverageBadge";
import { CuisinePlate } from "./CuisinePlate";
import { calculateDistanceMiles, formatCurrency } from "../../lib/utils";
import { getBusinessCoverageSummary } from "../../lib/coverage-engine";

interface BusinessCardProps {
  business: Business;
  userLocation: { lat: number; lng: number };
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onClick?: () => void;
  featured?: boolean;
  className?: string;
}

export function BusinessCard({
  business,
  userLocation,
  isFavorite,
  onFavoriteToggle,
  onClick,
  featured,
  className,
}: BusinessCardProps) {
  const distance = calculateDistanceMiles(userLocation, business.location);
  const coverage = getBusinessCoverageSummary(
    business.coverageRules,
    business.scheduledRuns
  );

  const body = (
    <div className="flex items-start justify-between gap-3">
      <CuisinePlate cuisine={business.cuisine} size={featured ? 56 : 48} />
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "pill mb-1.5 !px-2 !py-0.5 text-[10px]",
            featured ? "bg-ink text-white" : "bg-runr-primary-muted text-runr-primary",
          )}
        >
          {business.cuisine}
        </span>
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "truncate text-[15px] font-extrabold tracking-tight",
              featured ? "text-runr-ink" : "text-[var(--foreground)]"
            )}
          >
            {business.name}
          </h3>
          {onFavoriteToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
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
                    : featured
                      ? "text-runr-ink/40"
                      : "text-runr-neutral-300"
                )}
              />
            </button>
          )}
        </div>
        <p className={cn("mt-1 text-sm", featured ? "text-runr-ink/75" : "text-[var(--muted)]")}>
          ★ {business.rating} · {distance.toFixed(1)} mi · {business.etaMinutes} min ·{" "}
          {formatCurrency(business.deliveryFee)}
        </p>
      </div>
      <CoverageBadge status={coverage.status} gap={coverage.gap} size="sm" />
    </div>
  );

  const classes = cn(
    "block w-full rounded-2xl p-4 text-left transition-transform active:scale-[0.99]",
    featured
      ? "bg-runr-accent-bright text-runr-ink"
      : "border border-[var(--border)] bg-[var(--surface-elevated)]",
    className
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {body}
      </button>
    );
  }

  return <div className={classes}>{body}</div>;
}
