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
      <span className={clsx("flex h-11 w-11 items-center justify-center rounded-full", iconClassName ?? "bg-cream text-purple")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-bold text-ink">{title}</span>
        {subtitle ? <span className="block text-xs text-ink/50">{subtitle}</span> : null}
      </span>
      {trailing ?? <ChevronRight size={18} className="shrink-0 text-ink/30" />}
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
        "relative h-8 w-14 rounded-full transition-colors",
        on ? "bg-purple" : "bg-ink/20",
      )}
    >
      <span
        className={clsx(
          "absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
          on ? "left-7" : "left-1",
        )}
      />
    </button>
  );
}
