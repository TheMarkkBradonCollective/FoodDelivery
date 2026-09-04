"use client";

import { Heart, Home, List, Activity, User } from "lucide-react";

const customerNav = [
  { href: "/customer", label: "Home", icon: Home },
  { href: "/customer/orders", label: "Orders", icon: List },
  { href: "/customer/favorites", label: "Favorites", icon: Heart },
  { href: "/customer/activity", label: "Activity", icon: Activity },
  { href: "/customer/profile", label: "Profile", icon: User },
];

export function CustomerLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--background)] pb-20">
      {children}
    </div>
  );
}

export { customerNav };
