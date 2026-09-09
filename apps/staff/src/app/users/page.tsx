"use client";

import { Panel } from "@/components/StaffUi";
import { useAppStore } from "@/store";

export default function StaffUsersPage() {
  const { marketplaceUsers } = useAppStore();

  return (
    <div className="p-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">STAFF</p>
      <h1 className="mt-1 text-2xl font-extrabold">Users</h1>
      <Panel title="Marketplace users" className="mt-6">
        {marketplaceUsers.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No profiles yet.</p>
        ) : (
          <div className="space-y-3">
            {marketplaceUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-xs text-[var(--muted)]">{u.email}</p>
                </div>
                <span className="rounded-full bg-runr-primary/20 px-2 py-0.5 text-xs font-semibold uppercase text-runr-primary">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
