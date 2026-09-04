"use client";

import { BottomNavigation } from "@runr/shared/components/ui/BottomNavigation";
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
    <div className="relative min-h-screen bg-[var(--background)] pb-20">
      {children}
      <BottomNavigation items={porterNav} />
    </div>
  );
}
