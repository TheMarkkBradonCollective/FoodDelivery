"use client";

import { AppFrame } from "@porter/shared/components/layout/AppFrame";
import { Heart, Home, List, Activity, User } from "lucide-react";

export const porterNav = [
  { href: "/", label: "Discover", icon: Home },
  { href: "/orders", label: "Orders", icon: List },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/profile", label: "Profile", icon: User },
];

export function PorterLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AppFrame app="porter" tabs={porterNav}>
      {children}
    </AppFrame>
  );
}
