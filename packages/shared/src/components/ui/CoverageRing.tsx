"use client";

import { Bike } from "lucide-react";

export function CoverageRing({
  percent,
  label,
}: {
  percent: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg viewBox="0 0 108 108" className="h-28 w-28 -rotate-90">
        <circle cx="54" cy="54" r={r} fill="none" stroke="#EEE8FF" strokeWidth="8" />
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke="#7048F8"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke="#A0F878"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${c * 0.12} ${c}`}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xl font-extrabold text-[#1A1224]">{Math.round(clamped)}%</p>
        {label && (
          <p className="text-[10px] uppercase tracking-wider text-[#6F6678]">{label}</p>
        )}
      </div>
    </div>
  );
}

export function LimeBikeMark({ className }: { className?: string }) {
  return <Bike className={className ?? "h-5 w-5 text-[#A0F878]"} />;
}
