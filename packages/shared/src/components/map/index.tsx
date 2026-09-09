"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const MapView = dynamic(
  () => import("./MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#F6F1E8] dark:bg-[#100814]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-purple" />
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Mapping</p>
        </div>
      </div>
    ),
  }
);

export type { MapMarker, MapViewProps } from "./MapView";
