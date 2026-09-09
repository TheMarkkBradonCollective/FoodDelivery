"use client";

import { useAppStore } from "../../store/create-app-store";
import { cn } from "../../lib/utils";

export function CatalogPreviewBanner({ className }: { className?: string }) {
  const catalogPreview = useAppStore((s) => s.catalogPreview);
  if (!catalogPreview) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#7048F8]/25 bg-[#EEE8FF] px-4 py-3 text-sm text-[#1A1224]",
        className
      )}
    >
      <p className="font-extrabold">Preview kitchens</p>
      <p className="mt-0.5 text-xs text-[#6F6678]">
        Live marketplace tables are empty. Tony&apos;s Pizza, Golden Gate Burgers, and Mission
        Tacos are loaded so you can test tonight. Run{" "}
        <code className="rounded bg-white px-1">docs/supabase/schema.sql</code> in Supabase for
        live data.
      </p>
    </div>
  );
}

