"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const MapView = dynamic(
  () => import("./MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-runr-neutral-100 dark:bg-runr-neutral-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-runr-primary" />
          <p className="text-sm text-[var(--muted)]">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export type { MapMarker, MapViewProps } from "./MapView";
