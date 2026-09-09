"use client";

import { cn } from "../../lib/utils";
import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  trailing?: ReactNode;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search kitchens, dishes, cuisine…",
  className,
  trailing,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2.5 shadow-sm",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-purple" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
        enterKeyHint="search"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="tap-target rounded-full p-1 hover:bg-cream"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5 text-ink/40" />
        </button>
      )}
      {trailing}
    </div>
  );
}
