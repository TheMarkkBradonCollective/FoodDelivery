"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple/20 border-t-purple" />
      <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
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
    <div className="surface-card rounded-[28px] p-8 text-center">
      <h3 className="font-display text-lg font-bold text-[var(--foreground)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{description}</p>
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
    <div className="surface-card rounded-[28px] p-8 text-center">
      <h3 className="font-display text-lg font-bold text-[var(--foreground)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{description}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="tap-target mt-5 h-11 rounded-full bg-purple px-6 text-sm font-bold text-white">
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-[24px] bg-[var(--border)]", className)} />;
}
