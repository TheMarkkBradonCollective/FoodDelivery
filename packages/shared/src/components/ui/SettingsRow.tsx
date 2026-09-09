"use client";

import { clsx } from "clsx";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  trailing?: ReactNode;
};

export function SettingsRow({ icon, iconClassName, title, subtitle, onClick, trailing }: Props) {
  const inner = (
    <>
      <span className={clsx("flex h-10 w-10 items-center justify-center rounded-full", iconClassName ?? "bg-[var(--background)] text-purple")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-bold text-[var(--foreground)]">{title}</span>
        {subtitle ? <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">{subtitle}</span> : null}
      </span>
      {trailing ?? <ChevronRight size={16} className="shrink-0 text-[var(--muted)]" />}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="tap-target flex w-full items-center gap-3 rounded-2xl px-1 py-2 text-left">
        {inner}
      </button>
    );
  }

  return <div className="flex w-full items-center gap-3 rounded-2xl px-1 py-2">{inner}</div>;
}

export function ToggleSwitch({ on, onChange, label }: { on: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={clsx(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        on ? "bg-purple" : "bg-[var(--border)]",
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
