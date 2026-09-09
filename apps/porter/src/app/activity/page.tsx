"use client";

import { useAppStore } from "@/store";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";

export default function CustomerActivityPage() {
  const { notifications, markNotificationRead } = useAppStore();

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold">Activity</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Order updates and notifications</p>
      <div className="mt-6 space-y-3">
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
