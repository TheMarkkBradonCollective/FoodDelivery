"use client";

import { useRef, useState } from "react";
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
      body: "Request delivery or pick it up. Watch your Runner on the map from the business to your door.",
      visual: "📍",
    },
    {
      title: "Receive on the Porter marketplace.",
      body: "Tip, rate, keep receipts, and reorder. Porter Vendor prepares it. Porter Runner moves it.",
      visual: "📦",
    },
  ],
  runr: [
    {
      title: "Choose where you work.",
      body: "Runners don’t sit and wait for random pings. Pick a business that needs coverage.",
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
      title: "Sell on Porter.",
      body: "Your catalog, hours, and location are what customers discover. Orders land here to accept and prepare.",
      visual: "🏪",
    },
    {
      title: "Set how many Runners you need.",
      body: "Don’t ask for “a driver.” Set Needed vs Covered by time. Gaps show so Runners can fill them.",
      visual: "📡",
    },
    {
      title: "Dispatch stays on the network.",
      body: "Mark orders ready. Matching goes to Runners covering your window — then you grow from sales and ratings.",
      visual: "🚚",
    },
  ],
  staff: [
    {
      title: "Work from this phone",
      body: "Advance orders, set coverage, and look up users here — not only on the website.",
      visual: "🛡️",
    },
    {
      title: "Same marketplace",
      body: "Chat, alerts, and ops write to the live network. Desktop Porter Command Portal stays in sync.",
      visual: "💬",
    },
    {
      title: "Staff only",
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
  const startX = useRef(0);

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
        className="flex flex-1 flex-col px-5 pt-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
      >
        <BrandLockup app={app} />
        <JobLoop app={app} className="mt-2" />
        <div
          className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl px-5 py-6"
          onTouchStart={(e) => {
            startX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].clientX - startX.current;
            if (delta < -48 && !last) setIndex((i) => i + 1);
            if (delta > 48 && index > 0) setIndex((i) => i - 1);
          }}
        >
          <span className="text-5xl" aria-hidden>
            {step.visual}
          </span>
          <h1 className="mt-5 text-center font-display text-[1.625rem] font-extrabold leading-tight text-[var(--foreground)]">{step.title}</h1>
          <p className="mt-2 max-w-sm text-center text-sm leading-6 text-[var(--muted)]">{step.body}</p>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Swipe to continue</p>
        </div>
        <button
          type="button"
          onClick={() => (last ? onDone() : setIndex((i) => i + 1))}
          className="tap-target mt-4 h-12 w-full rounded-full bg-ink text-sm font-bold text-white"
        >
          {last ? `Get started with ${copy.shortName}` : "Next"}
        </button>
      </div>
    </div>
  );
}
