"use client";

import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-white px-6 py-10 text-center shadow-sm">
      <p className="font-extrabold text-ink">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink/60">{description}</p>}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
