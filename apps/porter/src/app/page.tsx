"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapView } from "@runr/shared/components/map";
import { SearchBar } from "@runr/shared/components/ui/SearchBar";
import { BusinessCard } from "@runr/shared/components/ui/BusinessCard";
import { AppBrandHeader, FlowBadge } from "@runr/shared/components/layout/AppBrandHeader";
import { useAppStore } from "@/store";
import { cuisineCategories } from "@runr/shared/data/constants";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { getBusinessCoverageSummary, getMarkerColor } from "@runr/shared/lib/coverage-engine";

export default function PorterDiscoverPage() {
  const { businesses, location, searchQuery, setSearchQuery, theme } = useAppStore();
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

  return (
    <div className="min-h-screen">
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <AppBrandHeader
          name="PORTER"
          tagline="Get what you need."
          emoji="🛍️"
          accentClass="bg-blue-600"
          compact
        />
        <FlowBadge label="Discover → Order → Track → Receive" className="mt-3" />
      </div>

      <div className="relative h-56">
        <MapView
          center={location}
          markers={markers}
          dark={theme === "dark"}
          className="absolute inset-0"
        />
        <div className="absolute inset-x-0 top-0 p-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search restaurants, stores, products..."
          />
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              !selectedCategory
                ? "bg-runr-primary text-white"
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
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                selectedCategory === cat
                  ? "bg-runr-primary text-white"
                  : "border border-[var(--border)] bg-[var(--surface-elevated)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <h2 className="mt-4 text-lg font-semibold">Nearby on the marketplace</h2>
        <p className="text-sm text-[var(--muted)]">
          Order from businesses fulfilled by RUNRs in your area
        </p>
        <div className="mt-3 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              title="No businesses yet"
              description="Marketplace listings will appear here once your account is connected to Supabase."
            />
          ) : (
            filtered.map((b) => (
              <Link key={b.id} href={`/restaurant/${b.id}`}>
                <BusinessCard business={b} userLocation={location} />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
