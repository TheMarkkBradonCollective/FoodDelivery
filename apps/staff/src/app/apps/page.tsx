"use client";

import { StaffAppsPanel } from "@porter/shared/components/staff/StaffOpsPanels";

export default function StaffAppsPage() {
  return (
    <div className="px-5 pb-8 pt-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-porter-accent-bright">Portr Command</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold">Apps</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Live packages on the Portr network</p>
      <div className="mt-5">
        <StaffAppsPanel />
      </div>
    </div>
  );
}
