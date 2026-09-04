"use client";

import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { customerNav } from "../CustomerLayoutClient";

export default function CustomerActivityPage() {
  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold">Activity</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Order updates and notifications</p>
      <BottomNavigation items={customerNav} />
    </div>
  );
}
