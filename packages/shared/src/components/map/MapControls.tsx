"use client";

import { Navigation2 } from "lucide-react";
import { clsx } from "clsx";

interface MapControlsProps {
  onRecenter: () => void;
  className?: string;
}

export function MapControls({ onRecenter, className }: MapControlsProps) {
  return (
    <div className={clsx("absolute right-3 top-24 z-[1000] flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={onRecenter}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-elevated)] text-purple shadow-porter-card ring-1 ring-[var(--border)]"
        aria-label="Recenter map"
      >
        <Navigation2 className="h-4 w-4 text-[var(--foreground)]" />
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
    <button
      type="button"
      onClick={onViewRun}
      className="map-dock rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-3.5 text-left shadow-porter-sheet backdrop-blur-md"
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-porter-success">
        Active shift · Checked in
      </p>
      <h3 className="mt-0.5 text-base font-extrabold text-[var(--foreground)]">{businessName}</h3>
      <p className="text-xs text-[var(--muted)]">
        {timeRange} · {deliveries} drops · ${earnings.toFixed(2)}
      </p>
    </button>
  );
}
