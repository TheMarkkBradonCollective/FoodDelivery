"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAppStore } from "../../store/create-app-store";
import { cn } from "../../lib/utils";

const DISMISS_KEY = "runr-preview-banner-dismissed";

export function CatalogPreviewBanner({ className }: { className?: string }) {
  const catalogPreview = useAppStore((s) => s.catalogPreview);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!catalogPreview || dismissed) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setDismissed(true);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border border-purple/30 bg-purple/10 px-3 py-2 text-xs text-[var(--foreground)]",
        className,
      )}
    >
      <p className="min-w-0 flex-1 leading-5">
        <span className="font-extrabold">Preview marketplace. </span>
        Live tables are empty — sample businesses are loaded so you can test the network.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss preview notice"
        className="tap-target flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-elevated)]"
      >
        <X size={14} />
      </button>
    </div>
  );
}
