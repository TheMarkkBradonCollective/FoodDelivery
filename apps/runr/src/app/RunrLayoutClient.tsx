"use client";

import { BottomNavigation } from "@runr/shared/components/ui/BottomNavigation";
import { Activity, DollarSign, List, Map, User } from "lucide-react";

export const runrNav = [
  { href: "/", label: "Map", icon: Map },
  { href: "/runs", label: "RUNs", icon: List },
  { href: "/earnings", label: "Earnings", icon: DollarSign },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/profile", label: "Profile", icon: User },
];

export function RunrLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--background)] pb-20">
      {children}
      <BottomNavigation items={runrNav} />
    </div>
  );
}
