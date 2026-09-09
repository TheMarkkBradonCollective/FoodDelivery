"use client";

import { useState } from "react";
import { BrandLockup } from "../ui/BrandMark";
import { JobLoop } from "../ui/JobLoop";
import { APP_COPY, type AppId } from "../../lib/apps";

const STEPS: Record<AppId, { title: string; body: string; visual: string }[]> = {
  porter: [
    {
      title: "Get what you need.",
      body: "Find nearby restaurants, stores, and more. Browse catalogs, save favorites, and check out in one place.",
      visual: "🛍️",
    },
    {
      title: "Order, then track.",
      body: "Request delivery or pick it up. Watch your RUNR on the map from the business to your door.",
      visual: "📍",
    },
    {
      title: "Receive on the PORTER marketplace.",
      body: "Tip, rate, keep receipts, and reorder. VENDR prepares it. RUNR moves it.",
      visual: "📦",
    },
  ],
  runr: [
    {
      title: "Choose where you work.",
      body: "RUNRs don’t sit and wait for random pings. Pick a business that needs coverage.",
      visual: "🗺️",
    },
    {
      title: "Cover a window.",
      body: "Say “I’m covering this business from 5:30–8:00.” Check in, then the marketplace assigns pickups.",
      visual: "⏱️",
    },
    {
      title: "Deliver. Earn.",
      body: "Navigate, confirm pickup, complete the drop. Pay is per delivery — base, distance, and tips.",
      visual: "💵",
    },
  ],
  vendr: [
    {
      title: "Sell on PORTER.",
      body: "Your catalog, hours, and location are what customers discover. Orders land here to accept and prepare.",
      visual: "🏪",
    },
    {
      title: "Set how many RUNRs you need.",
      body: "Don’t ask for “a driver.” Set Needed vs Covered by time. Gaps show so RUNRs can fill them.",
      visual: "📡",
    },
    {
      title: "Dispatch stays on the network.",
      body: "Mark orders ready. Matching goes to RUNRs covering your window — then you grow from sales and ratings.",
      visual: "🚚",
    },
  ],
  staff: [
    {
      title: "Founder ops phone",
      body: "Status, chat, and alerts for the people who run RUNR.",
      visual: "🛡️",
    },
    {
      title: "Stay in the loop",
      body: "Alerts and a shared founder thread — nothing decorative.",
      visual: "💬",
    },
    {
      title: "Signed in as staff",
      body: "This app is staff-only. Founder and ops accounts land here.",
      visual: "✅",
    },
  ],
};

export function Onboarding({ app, onDone }: { app: AppId; onDone: () => void }) {
  const copy = APP_COPY[app];
  const steps = STEPS[app];
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const last = index === steps.length - 1;

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)]">
      <div
        className="flex items-center justify-between px-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <div className="flex flex-1 gap-1.5 pr-4">
          {steps.map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i <= index ? "bg-[var(--foreground)]" : "bg-[var(--border)]"}`} />
          ))}
        </div>
        <button type="button" onClick={onDone} className="tap-target text-sm font-bold text-[var(--muted)]">
          Skip
        </button>
      </div>

      <div
        className="flex flex-1 flex-col px-6 pt-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
      >
        <BrandLockup app={app} />
        <JobLoop app={app} className="mt-3" />
        <div className="surface-card mt-8 flex flex-1 flex-col items-center justify-center rounded-[36px] p-8">
          <span className="text-7xl" aria-hidden>
            {step.visual}
          </span>
          <h1 className="mt-8 text-center font-display text-3xl font-bold leading-tight text-[var(--foreground)]">{step.title}</h1>
          <p className="mt-3 max-w-sm text-center text-sm leading-6 text-[var(--muted)]">{step.body}</p>
        </div>
        <button
          type="button"
          onClick={() => (last ? onDone() : setIndex((i) => i + 1))}
          className="tap-target mt-6 h-14 w-full rounded-full bg-ink text-base font-bold text-white"
        >
          {last ? `Get started with ${copy.shortName}` : "Next"}
        </button>
      </div>
    </div>
  );
}
