"use client";

import { cn } from "../../lib/utils";

type Option<T extends string> = { value: T; label: string };

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
}: {
  options: readonly Option<T>[] | Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex w-full items-center rounded-full bg-[var(--background)] p-1 ring-1 ring-[var(--border)]",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative min-w-0 flex-1 rounded-full font-bold transition-colors",
              size === "sm" ? "h-8 px-2 text-[11px]" : "h-9 px-2 text-[13px]",
              active
                ? "bg-purple text-white shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            <span className="block truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
