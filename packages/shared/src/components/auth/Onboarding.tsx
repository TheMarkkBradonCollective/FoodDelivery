"use client";

import { useState } from "react";
import { BrandLockup } from "../ui/BrandMark";
import { APP_COPY, type AppId } from "../../lib/apps";

const STEPS: Record<AppId, { title: string; body: string; visual: string }[]> = {
  porter: [
    {
      title: "Build your order, step by step",
      body: "Browse kitchens nearby, stack dishes your way, and check out in one tap.",
      visual: "🍔",
    },
    {
      title: "Hungry? Order and eat.",
      body: "Track your RUN from kitchen to door with live status and a mapped courier.",
      visual: "🛵",
    },
    {
      title: "Favorites, tips, and promos",
      body: "Save kitchens you love, add a tip, and apply RUNR5 or PORTER10 at checkout.",
      visual: "💚",
    },
  ],
  runr: [
    {
      title: "See nearby RUNs",
      body: "Available jobs appear on the map with payout, distance, and pickup kitchen.",
      visual: "🗺️",
    },
    {
      title: "Accept, pick up, deliver",
      body: "Two-step flow: confirm pickup at the kitchen, then complete at the door.",
      visual: "📦",
    },
    {
      title: "Earnings that add up",
      body: "Track tonight’s payouts, tips, and completed RUNs in one place.",
      visual: "💵",
    },
  ],
  vendr: [
    {
      title: "Live kitchen operations",
      body: "Incoming, preparing, and ready orders stay on one cream ops board.",
      visual: "👩‍🍳",
    },
    {
      title: "Set your coverage",
      body: "Turn availability on, pick a radius, and only receive nearby RUNs.",
      visual: "📡",
    },
    {
      title: "Menu and hours",
      body: "Keep dishes, hours, and kitchen details current for Porters.",
      visual: "📋",
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
