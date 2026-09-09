"use client";

import Link from "next/link";
import { useAppStore } from "@/store";
import { DishPhoto } from "@runr/shared/components/ui/CuisinePlate";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { ScreenHeader } from "@runr/shared/components/layout/ScreenHeader";
import { Heart } from "lucide-react";

export default function CustomerFavoritesPage() {
  const { businesses, favoriteBusinessIds, toggleFavorite } = useAppStore();
  const saved = businesses.filter((b) => favoriteBusinessIds.includes(b.id));

  return (
    <div>
      <ScreenHeader title="Favorites" subtitle="Kitchens you saved" eyebrow="PORTER" />
      <div className="px-5 pb-8 lg:px-8">
        {saved.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Tap the heart on a kitchen to save it here for quicker reordering."
            action={
              <Link href="/" className="inline-flex h-11 items-center rounded-full bg-purple px-5 text-sm font-bold text-white">
                Discover kitchens
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {saved.map((b) => (
              <article key={b.id} className="surface-card overflow-hidden rounded-[24px]">
                <Link href={`/restaurant/?id=${b.id}`} className="block">
                  <DishPhoto cuisine={b.cuisine} className="aspect-square w-full" />
                </Link>
                <div className="flex items-start justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[var(--foreground)]">{b.name}</p>
                    <p className="text-xs text-[var(--muted)]">{b.cuisine}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${b.name}`}
                    onClick={() => toggleFavorite(b.id)}
                    className="tap-target flex h-9 w-9 items-center justify-center rounded-full bg-[var(--background)] text-purple"
                  >
                    <Heart size={14} className="fill-purple" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
