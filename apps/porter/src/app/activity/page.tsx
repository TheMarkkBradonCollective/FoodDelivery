"use client";

import { useAppStore } from "@/store";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { ScreenHeader } from "@runr/shared/components/layout/ScreenHeader";
import Link from "next/link";

export default function CustomerActivityPage() {
  const { notifications, markNotificationRead } = useAppStore();

  return (
    <div>
      <ScreenHeader title="Activity" subtitle="Order updates and alerts" eyebrow="PORTER" />
      <div className="space-y-3 px-5 pb-8 lg:mx-auto lg:max-w-2xl lg:px-8">
        {notifications.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Place an order and kitchen or RUNR updates will show up here."
            action={
              <Link href="/" className="inline-flex h-11 items-center rounded-full bg-purple px-5 text-sm font-bold text-white">
                Browse kitchens
              </Link>
            }
          />
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markNotificationRead(n.id)}
              className={`w-full rounded-[24px] p-4 text-left shadow-sm ring-1 ${
                n.read ? "bg-white ring-ink/8 opacity-70" : "bg-runr-primary-muted ring-purple/20"
              }`}
            >
              <p className="font-extrabold text-ink">{n.title}</p>
              <p className="mt-1 text-sm text-ink/60">{n.body}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                {n.read ? "Read" : "New"} · tap to mark read
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
