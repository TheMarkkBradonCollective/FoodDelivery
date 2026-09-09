"use client";

import { useAppStore } from "@/store";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { ScreenHeader } from "@runr/shared/components/layout/ScreenHeader";

export default function CustomerActivityPage() {
  const { notifications, markNotificationRead } = useAppStore();

  return (
    <div className="min-h-screen">
      <ScreenHeader title="Activity" subtitle="Order updates and alerts" eyebrow="PORTER" flush />
      <div className="space-y-3 px-4 pt-2">
        {notifications.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Place an order and updates will show up here."
          />
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markNotificationRead(n.id)}
              className={`w-full rounded-runr-lg border p-4 text-left ${
                n.read
                  ? "border-[var(--border)] opacity-70"
                  : "border-runr-primary/20 bg-runr-primary-muted"
              }`}
            >
              <p className="font-semibold">{n.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{n.body}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
