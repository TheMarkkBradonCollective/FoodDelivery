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
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "pill mb-2",
            featured
              ? "bg-runr-primary text-white"
              : "bg-runr-primary-muted text-runr-primary"
          )}
        >
          {business.cuisine}
        </span>
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "truncate text-lg font-extrabold tracking-tight",
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
          {distance.toFixed(1)} mi · {business.etaMinutes} min · Delivery{" "}
          {formatCurrency(business.deliveryFee)}
        </p>
        <p className="mt-2 text-sm font-semibold">★ {business.rating}</p>
      </div>
      <CoverageBadge status={coverage.status} gap={coverage.gap} size="sm" />
    </div>
  );

  const classes = cn(
    "block w-full rounded-runr-xl p-5 text-left shadow-runr-card transition-transform active:scale-[0.99]",
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
