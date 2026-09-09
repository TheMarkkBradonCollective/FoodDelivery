"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapView } from "@runr/shared/components/map";
import { SearchBar } from "@runr/shared/components/ui/SearchBar";
import { BusinessCard } from "@runr/shared/components/ui/BusinessCard";
import { useAppStore } from "@/store";
import { cuisineCategories } from "@runr/shared/data/constants";
import { CatalogPreviewBanner } from "@runr/shared/components/ui/CatalogPreviewBanner";
import { BrandMark } from "@runr/shared/components/ui/BrandMark";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { getBusinessCoverageSummary, getMarkerColor } from "@runr/shared/lib/coverage-engine";

export default function PorterDiscoverPage() {
  const { businesses, location, searchQuery, setSearchQuery, theme, user, favoriteBusinessIds, toggleFavorite, cart } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = businesses;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.cuisine.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter((b) => b.cuisine === selectedCategory);
    }
    return result;
  }, [businesses, searchQuery, selectedCategory]);

  const markers = filtered.map((b) => {
    const c = getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns);
    return {
      id: b.id,
      position: b.location,
      color: getMarkerColor(c.status),
      title: b.name,
      subtitle: `${b.cuisine} · ${b.etaMinutes} min`,
    };
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen">
      <div className="brand-hero brand-hero--flush px-5 pb-10 pt-5">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">
              PORTER
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
              Hey, {firstName}
            </h1>
            <p className="mt-1 text-sm text-white/75">Get what you need nearby.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full">
            <BrandMark size="sm" />
          </div>
        </div>
        <div className="relative z-10 mt-5">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search restaurants, stores, products..."
          />
        </div>
      </div>

      <div className="relative -mt-2 h-52 overflow-hidden px-4">
        <div className="h-full overflow-hidden rounded-runr-xl shadow-runr-card">
          <MapView
            center={location}
            markers={markers}
            dark={theme === "dark"}
            className="h-full"
          />
        </div>
      </div>

      <div className="px-4 py-5">
        <CatalogPreviewBanner className="mb-3" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
              !selectedCategory
                ? "bg-runr-ink text-white"
                : "border border-[var(--border)] bg-[var(--surface-elevated)]"
            }`}
          >
            All
          </button>
          {cuisineCategories.slice(0, 6).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                selectedCategory === cat
                  ? "bg-runr-ink text-white"
                  : "border border-[var(--border)] bg-[var(--surface-elevated)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Nearby kitchens</h2>
            <p className="text-sm text-[var(--muted)]">Fulfilled by RUNRs in your area</p>
          </div>
        </div>
        <div className="mt-3 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              title="No businesses yet"
              description="No listings match your search. Nearby kitchens appear after you sign in."
            />
          ) : (
            <>
              {featured && (
                <Link href={`/restaurant/${featured.id}`}>
                  <BusinessCard
                    business={featured}
                    userLocation={location}
                    featured
                    isFavorite={favoriteBusinessIds.includes(featured.id)}
                    onFavoriteToggle={() => toggleFavorite(featured.id)}
                  />
                </Link>
              )}
              {rest.map((b) => (
                <Link key={b.id} href={`/restaurant/${b.id}`}>
                  <BusinessCard
                    business={b}
                    userLocation={location}
                    isFavorite={favoriteBusinessIds.includes(b.id)}
                    onFavoriteToggle={() => toggleFavorite(b.id)}
                  />
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
      {cart.length > 0 && (
        <Link
          href="/cart"
          className="fixed bottom-24 left-4 right-4 z-20 rounded-full bg-runr-primary py-3 text-center text-sm font-extrabold text-white shadow-runr-card"
        >
          View cart ({cart.reduce((s, i) => s + i.quantity, 0)})
        </Link>
      )}
    </div>
  );
}
