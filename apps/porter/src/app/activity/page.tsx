"use client";

import { useAppStore } from "@/store";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { ScreenHeader } from "@runr/shared/components/layout/ScreenHeader";
import Link from "next/link";

export default function CustomerActivityPage() {
  const { notifications, markNotificationRead } = useAppStore();

  return (
    <div>
      <ScreenHeader title="Activity" subtitle="Order updates and alerts" eyebrow="Porter" />
      <div className="space-y-3 px-5 pb-8 lg:mx-auto lg:max-w-2xl lg:px-8">
        {notifications.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Place an order and Porter Vendor or Runner updates will show up here."
            action={
              <Link href="/" className="inline-flex h-11 items-center rounded-full bg-purple px-5 text-sm font-bold text-white">
                Discover businesses
              </Link>
            }
          />
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markNotificationRead(n.id)}
              className={`w-full rounded-2xl p-3.5 text-left ring-1 ${
                n.read ? "bg-[var(--surface-elevated)] ring-[var(--border)] opacity-70" : "bg-runr-primary-muted ring-purple/20"
              }`}
            >
              <p className="font-extrabold text-[var(--foreground)]">{n.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{n.body}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                {n.read ? "Read" : "New"} · tap to mark read
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
