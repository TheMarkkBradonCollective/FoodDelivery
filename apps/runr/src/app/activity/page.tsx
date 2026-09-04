"use client";

import { useAppStore } from "@/store";

export default function RunrActivityPage() {
  const { notifications, markNotificationRead } = useAppStore();

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold">Activity</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Notifications and delivery updates
      </p>

      <div className="mt-6 space-y-3">
        {notifications.map((n) => (
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
        ))}
      </div>
    </div>
  );
}
