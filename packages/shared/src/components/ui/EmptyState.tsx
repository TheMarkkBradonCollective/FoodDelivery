"use client";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-runr-lg border border-dashed border-[var(--border)] bg-[var(--surface-elevated)] px-6 py-10 text-center">
      <p className="font-semibold">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
      )}
    </div>
  );
}
