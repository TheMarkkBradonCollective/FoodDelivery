"use client";

import { StaffChat } from "@porter/shared/components/staff/StaffChat";

export default function StaffChatPage() {
  return (
    <div className="px-5 pb-8 pt-4 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-porter-accent-bright">Porter Command</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold">Chat</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">On-call notes shared with desktop</p>
      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
        <StaffChat compact />
      </div>
    </div>
  );
}
