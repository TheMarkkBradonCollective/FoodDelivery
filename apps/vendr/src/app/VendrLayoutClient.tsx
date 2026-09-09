"use client";

import { AppFrame } from "@runr/shared/components/layout/AppFrame";
import { LayoutDashboard, ListOrdered, Map, Settings, Users } from "lucide-react";

export const vendrNav = [
  { href: "/", label: "Operations", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ListOrdered },
  { href: "/runrs", label: "RUNRs", icon: Users },
  { href: "/coverage", label: "Coverage", icon: Map },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function VendrLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AppFrame app="vendr" tabs={vendrNav}>
      {children}
    </AppFrame>
  );
}
