"use client";

import { StaffUsersPanel } from "@porter/shared/components/staff/StaffOpsPanels";

export default function StaffUsersPage() {
  return (
    <div className="px-5 pb-8 pt-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-porter-accent-bright">Porter Command</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold">Users</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Marketplace directory for support</p>
      <div className="mt-5">
        <StaffUsersPanel />
      </div>
    </div>
  );
}
