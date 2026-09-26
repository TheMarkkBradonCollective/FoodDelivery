"use client";

import { StaffCoveragePanel } from "@porter/shared/components/staff/StaffOpsPanels";

export default function StaffCoveragePage() {
  return (
    <div className="px-5 pb-8 pt-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-porter-accent-bright">Porter Command</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold">Coverage</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Raise or lower Runner slots per vendor</p>
      <div className="mt-5">
        <StaffCoveragePanel />
      </div>
    </div>
  );
}
