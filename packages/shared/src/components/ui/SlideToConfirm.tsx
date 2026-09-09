"use client";

import { useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export function SlideToConfirm({
  label,
  onConfirm,
  disabled,
  className,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const locked = useRef(false);

  function updateFromX(clientX: number) {
    const el = trackRef.current;
    if (!el || disabled || locked.current) return;
    const rect = el.getBoundingClientRect();
    const thumb = 40;
    const max = Math.max(1, rect.width - thumb - 8);
    const next = Math.max(0, Math.min(1, (clientX - rect.left - 4 - thumb / 2) / max));
    setPct(next);
    if (next >= 0.9) {
      locked.current = true;
      setPct(1);
      onConfirm();
      window.setTimeout(() => {
        locked.current = false;
        setPct(0);
      }, 400);
    }
  }

  function endDrag() {
    if (locked.current) return;
    setPct(0);
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onConfirm();
        }
      }}
      onPointerDown={(e) => {
        if (disabled) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        updateFromX(e.clientX);
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "relative h-12 w-full touch-none select-none overflow-hidden rounded-full bg-[var(--background)] ring-1 ring-[var(--border)]",
        disabled && "opacity-50",
        className,
      )}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-purple/20"
        style={{ width: `${Math.max(pct * 100, 12)}%` }}
      />
      <p className="pointer-events-none absolute inset-0 flex items-center justify-center pl-8 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <span
        className="absolute top-1 flex h-10 w-10 items-center justify-center rounded-full bg-purple text-white shadow-sm"
        style={{ left: `calc(4px + ${pct} * (100% - 48px))` }}
      >
        <ChevronRight size={18} strokeWidth={2.6} />
      </span>
    </div>
  );
}
