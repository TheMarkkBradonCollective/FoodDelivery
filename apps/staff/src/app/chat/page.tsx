"use client";

import { StaffChat } from "@runr/shared/components/staff/StaffChat";
import { DesktopManageBanner } from "@/components/DesktopManageBanner";

export default function StaffChatPage() {
  return (
    <div className="p-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">STAFF</p>
      <h1 className="mt-1 text-2xl font-extrabold">Chat</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">On-call notes shared with the desktop console</p>
      <div className="mt-5">
        <DesktopManageBanner />
      </div>
      <div className="mt-5 rounded-runr-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <StaffChat compact />
      </div>
    </div>
  );
}
