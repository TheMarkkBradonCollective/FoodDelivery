"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store/create-app-store";
import { PrimaryButton } from "../ui/PrimaryButton";

export function StaffChat({ compact }: { compact?: boolean }) {
  const user = useAppStore((s) => s.user);
  const messages = useAppStore((s) => s.staffMessages);
  const sendStaffMessage = useAppStore((s) => s.sendStaffMessage);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    sendStaffMessage(draft);
    setDraft("");
  }

  return (
    <div className={`flex flex-col ${compact ? "h-[28rem]" : "h-[min(36rem,70vh)]"}`}>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No staff messages yet. This channel is for status, handoffs, and on-call notes.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.authorId === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "bg-porter-primary text-[var(--on-primary,#fff)]"
                      : "bg-[var(--surface-elevated)] text-[var(--foreground)]"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                    {m.authorName}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-60">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Status update or handoff…"
          className="min-w-0 flex-1 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm outline-none focus:border-porter-primary"
        />
        <PrimaryButton type="submit" disabled={!draft.trim()}>
          Send
        </PrimaryButton>
      </form>
    </div>
  );
}
