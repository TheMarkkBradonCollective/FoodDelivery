"use client";

import Link from "next/link";
import { useAppStore } from "@/store";
import { BusinessCard } from "@runr/shared/components/ui/BusinessCard";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { ScreenHeader } from "@runr/shared/components/layout/ScreenHeader";

export default function CustomerFavoritesPage() {
  const { businesses, favoriteBusinessIds, location, toggleFavorite } = useAppStore();
  const saved = businesses.filter((b) => favoriteBusinessIds.includes(b.id));

  return (
    <div className="min-h-screen">
      <ScreenHeader title="Favorites" subtitle="Kitchens you saved" eyebrow="PORTER" flush />
      <div className="space-y-3 px-4 pt-2">
        {saved.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Tap the star on a business in Discover to save it here."
          />
        ) : (
          saved.map((b) => (
            <div key={b.id} className="relative">
              <Link href={`/restaurant/?id=${b.id}`}>
                <BusinessCard business={b} userLocation={location} />
              </Link>
              <button
                type="button"
                onClick={() => toggleFavorite(b.id)}
                className="absolute right-3 top-3 rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
