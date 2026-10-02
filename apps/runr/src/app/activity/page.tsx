"use client";

import { useAppStore } from "@/store";
import { EmptyState } from "@porter/shared/components/ui/EmptyState";
import { ScreenHeader } from "@porter/shared/components/layout/ScreenHeader";

export default function RunrActivityPage() {
  const { notifications, markNotificationRead } = useAppStore();

  return (
    <div>
      <ScreenHeader eyebrow="Portr Runner" title="Activity" subtitle="Notifications and delivery updates" />
      <div className="space-y-2 px-5 pb-8">
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
              className={`w-full rounded-2xl p-3.5 text-left ring-1 ${
                n.read
                  ? "bg-[var(--surface-elevated)] ring-[var(--border)] opacity-70"
                  : "bg-porter-primary-muted ring-purple/20"
              }`}
            >
              <p className="font-extrabold text-[var(--foreground)]">{n.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{n.body}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
