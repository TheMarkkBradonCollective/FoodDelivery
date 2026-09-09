"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple/20 border-t-purple" />
      <p className="text-sm font-semibold text-ink/55">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-ink/8">
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink/60">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Couldn’t load this",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-ink/8">
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink/60">{description}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="tap-target mt-5 h-11 rounded-full bg-purple px-6 text-sm font-bold text-white">
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-[24px] bg-ink/8", className)} />;
}
