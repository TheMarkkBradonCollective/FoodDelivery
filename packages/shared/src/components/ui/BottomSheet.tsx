"use client";

import { cn } from "../../lib/utils";
import { useEffect, useRef, useState, type ReactNode } from "react";

type SnapPoint = "collapsed" | "half" | "expanded";

interface BottomSheetProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
  snap?: SnapPoint;
  stickyAction?: ReactNode;
  className?: string;
}

const snapHeights: Record<SnapPoint, string> = {
  collapsed: "h-[28vh]",
  half: "h-[55vh]",
  expanded: "h-[88vh]",
};

export function BottomSheet({
  open,
  onClose,
  children,
  title,
  snap = "half",
  stickyAction,
  className,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState<SnapPoint>(snap);
  const startY = useRef(0);

  useEffect(() => {
    if (open) setCurrentSnap(snap);
  }, [open, snap]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-runr-xl bg-[var(--surface)] shadow-runr-sheet animate-slide-up transition-[height] duration-300",
          snapHeights[currentSnap],
          className
        )}
      >
        <div
          className="flex shrink-0 cursor-grab flex-col items-center pt-3 pb-2 active:cursor-grabbing"
          onTouchStart={(e) => {
            startY.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].clientY - startY.current;
            if (delta > 60) {
              if (currentSnap === "expanded") setCurrentSnap("half");
              else if (currentSnap === "half") setCurrentSnap("collapsed");
              else onClose?.();
            } else if (delta < -60) {
              if (currentSnap === "collapsed") setCurrentSnap("half");
              else if (currentSnap === "half") setCurrentSnap("expanded");
            }
          }}
        >
          <div className="h-1 w-10 rounded-full bg-runr-neutral-300 dark:bg-runr-neutral-600" />
          {title && (
            <h2 className="mt-2.5 text-base font-extrabold text-[var(--foreground)]">
              {title}
            </h2>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>

        {stickyAction && (
          <div className="overlay-safe shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-3">
            {stickyAction}
          </div>
        )}
      </div>
    </>
  );
}
