"use client";

import { useAppStore } from "@/store";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";

export default function RunrActivityPage() {
  const { notifications, markNotificationRead } = useAppStore();

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">RUNR</p>
        <h1 className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">Activity</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Notifications and delivery updates</p>
      </div>
      <div className="space-y-3 px-4 pt-2">
        {notifications.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Coverage gaps, delivery offers, and payouts show up here."
          />
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markNotificationRead(n.id)}
              className={`w-full rounded-runr-lg border p-4 text-left transition-colors ${
                n.read
                  ? "border-[var(--border)] bg-[var(--surface-elevated)] opacity-70"
                  : "border-runr-primary/20 bg-runr-primary-muted"
              }`}
            >
              <p className="font-semibold text-[var(--foreground)]">{n.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{n.body}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
