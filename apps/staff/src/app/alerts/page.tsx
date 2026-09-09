"use client";

import { useAppStore } from "@/store";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { DesktopManageBanner } from "@/components/DesktopManageBanner";

export default function StaffAlertsPage() {
  const { notifications, markNotificationRead } = useAppStore();

  return (
    <div className="p-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">STAFF</p>
      <h1 className="mt-1 text-2xl font-extrabold">Alerts</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Marketplace pings — manage from desktop</p>
      <div className="mt-5">
        <DesktopManageBanner />
      </div>
      <div className="mt-5 space-y-3">
        {notifications.length === 0 ? (
          <EmptyState title="No alerts" description="Order and coverage updates show up here." />
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markNotificationRead(n.id)}
              className={`w-full rounded-runr-lg border p-4 text-left ${
                n.read
                  ? "border-[var(--border)] bg-[var(--surface)] opacity-70"
                  : "border-runr-primary/30 bg-runr-primary/15"
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
