"use client";

import { Panel } from "@/components/StaffUi";

export default function StaffUsersPage() {
  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-2xl font-bold">Users</h1>
      <Panel title="Marketplace users" className="mt-6">
        <p className="text-sm text-[var(--muted)]">
          User management loads from Supabase profiles.
        </p>
      </Panel>
    </div>
  );
}
