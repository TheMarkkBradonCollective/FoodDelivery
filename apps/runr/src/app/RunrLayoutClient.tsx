"use client";

import { AppFrame } from "@porter/shared/components/layout/AppFrame";
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
    <AppFrame app="runr" tabs={runrNav}>
      {children}
    </AppFrame>
  );
}
