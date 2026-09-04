"use client";

import { MapPin, Navigation2 } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface MapControlsProps {
  onRecenter: () => void;
  onToggleTraffic?: () => void;
  showTraffic?: boolean;
}

export function MapControls({ onRecenter }: MapControlsProps) {
  return (
    <div className="absolute right-4 top-24 z-[1000] flex flex-col gap-2">
      <button
        type="button"
        onClick={onRecenter}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-runr-card"
        aria-label="Recenter map"
      >
        <Navigation2 className="h-5 w-5 text-[var(--foreground)]" />
      </button>
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-runr-card"
        aria-label="My location"
      >
        <MapPin className="h-5 w-5 text-runr-navigation" />
      </button>
    </div>
  );
}

interface ActiveRunBannerProps {
  businessName: string;
  timeRange: string;
  deliveries: number;
  earnings: number;
  onViewRun: () => void;
}

export function ActiveRunBanner({
  businessName,
  timeRange,
  deliveries,
  earnings,
  onViewRun,
}: ActiveRunBannerProps) {
  return (
    <div className="absolute inset-x-4 bottom-24 z-[1000] rounded-runr-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-runr-sheet backdrop-blur-md">
      <p className="text-xs font-semibold uppercase tracking-wider text-runr-success">
        Active RUN · Checked In
      </p>
      <h3 className="mt-1 font-semibold text-[var(--foreground)]">{businessName}</h3>
      <p className="text-sm text-[var(--muted)]">{timeRange}</p>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span>{deliveries} deliveries</span>
        <span className="font-semibold">${earnings.toFixed(2)}</span>
      </div>
      <PrimaryButton className="mt-3 w-full" size="sm" onClick={onViewRun}>
        View RUN
      </PrimaryButton>
    </div>
  );
}
