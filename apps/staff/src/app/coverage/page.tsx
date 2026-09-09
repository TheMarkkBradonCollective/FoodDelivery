"use client";

import { StaffCoveragePanel } from "@runr/shared/components/staff/StaffOpsPanels";

export default function StaffCoveragePage() {
  return (
    <div className="px-5 pb-8 pt-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">STAFF</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold">Coverage</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Raise or lower RUNR slots per kitchen</p>
      <div className="mt-5">
        <StaffCoveragePanel />
      </div>
    </div>
  );
}
