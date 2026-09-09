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
    <div className="surface-card rounded-[28px] border-dashed px-6 py-10 text-center">
      <p className="font-extrabold text-[var(--foreground)]">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{description}</p>}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
