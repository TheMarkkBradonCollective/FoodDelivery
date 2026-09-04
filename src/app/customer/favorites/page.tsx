"use client";

import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { customerNav } from "../CustomerLayoutClient";

export default function CustomerFavoritesPage() {
  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold">Favorites</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Your saved restaurants</p>
      <BottomNavigation items={customerNav} />
    </div>
  );
}
