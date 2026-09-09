"use client";

import { clsx } from "clsx";
import { Minus, Plus } from "lucide-react";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export function QuantityStepper({ value, onChange, min = 0, max = 99, className }: Props) {
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-0.5 rounded-full bg-[var(--background)] p-0.5 ring-1 ring-[var(--border)]",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-elevated)] text-[var(--foreground)] disabled:opacity-40"
      >
        <Minus size={16} strokeWidth={2.4} />
      </button>
      <span className="min-w-8 text-center text-sm font-bold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-purple text-white disabled:opacity-40"
      >
        <Plus size={16} strokeWidth={2.4} />
      </button>
    </div>
  );
}
