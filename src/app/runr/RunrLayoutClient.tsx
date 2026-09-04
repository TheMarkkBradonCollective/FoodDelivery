"use client";

import { BottomNavigation } from "@/components/ui/BottomNavigation";
import {
  Activity,
  DollarSign,
  List,
  Map,
  User,
} from "lucide-react";

const runrNav = [
  { href: "/runr", label: "Map", icon: Map },
  { href: "/runr/runs", label: "RUNs", icon: List },
  { href: "/runr/earnings", label: "Earnings", icon: DollarSign },
  { href: "/runr/activity", label: "Activity", icon: Activity },
  { href: "/runr/profile", label: "Profile", icon: User },
];

export function RunrLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--background)] pb-20">
      {children}
      <BottomNavigation items={runrNav} />
    </div>
  );
}
