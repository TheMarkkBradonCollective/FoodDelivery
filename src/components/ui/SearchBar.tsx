"use client";

import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search businesses, cuisine, location...",
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-runr-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2.5 shadow-runr-card",
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-[var(--muted)]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-full p-1 hover:bg-runr-neutral-100 dark:hover:bg-runr-neutral-800"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5 text-[var(--muted)]" />
        </button>
      )}
    </div>
  );
}
