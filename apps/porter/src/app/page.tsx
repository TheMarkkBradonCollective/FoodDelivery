"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, MapPin, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { MapView } from "@runr/shared/components/map";
import { SearchBar } from "@runr/shared/components/ui/SearchBar";
import { BusinessCard } from "@runr/shared/components/ui/BusinessCard";
import { DishCard } from "@runr/shared/components/ui/DishCard";
import { CuisinePlate } from "@runr/shared/components/ui/CuisinePlate";
import { BottomSheet } from "@runr/shared/components/ui/BottomSheet";
import { CatalogPreviewBanner } from "@runr/shared/components/ui/CatalogPreviewBanner";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { LoadingState, SkeletonCard } from "@runr/shared/components/ui/ScreenState";
import { IconButton } from "@runr/shared/components/ui/IconButton";
import { useAppStore } from "@/store";
import { cuisineCategories } from "@runr/shared/data/constants";
import { displayFirstName } from "@runr/shared/lib/apps";
import { getBusinessCoverageSummary, getMarkerColor } from "@runr/shared/lib/coverage-engine";
import type { MenuItem } from "@runr/shared/types";

type PopularDish = MenuItem & { businessId: string; cuisine: string; businessName: string };

export default function PorterDiscoverPage() {
  const {
    businesses,
    location,
    searchQuery,
    setSearchQuery,
    theme,
    user,
    favoriteBusinessIds,
    toggleFavorite,
    cart,
    addToCart,
    updateCartQuantity,
    deliveryAddress,
    marketplaceReady,
  } = useAppStore();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = businesses;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.cuisine.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.menu?.some((item) => item.name.toLowerCase().includes(q)),
      );
    }
    if (selectedCategory) {
      result = result.filter((b) => b.cuisine === selectedCategory);
    }
    return result;
  }, [businesses, searchQuery, selectedCategory]);

  const popularDishes = useMemo(() => {
    const dishes: PopularDish[] = [];
    for (const business of filtered) {
      for (const item of business.menu ?? []) {
        dishes.push({
          ...item,
          businessId: business.id,
          cuisine: item.category || business.cuisine,
          businessName: business.name,
        });
      }
    }
    dishes.sort((a, b) => Number(b.popular) - Number(a.popular));
    return dishes.slice(0, 8);
  }, [filtered]);

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

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const firstName = displayFirstName(user?.name, "PORTER");
  const categories = ["All", ...cuisineCategories];

  function qtyFor(itemId: string) {
    return cart.find((c) => c.menuItemId === itemId)?.quantity ?? 0;
  }

  function addDish(dish: PopularDish) {
    addToCart(dish.businessId, {
      menuItemId: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
    });
  }

  if (!marketplaceReady) {
    return (
      <div className="px-5 py-6">
        <SkeletonCard className="h-16 w-48" />
        <SkeletonCard className="mt-5 h-12 w-full" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-48" />
        </div>
        <LoadingState label="Finding kitchens nearby…" />
      </div>
    );
  }

  return (
    <div className="px-5 pb-6 pt-4 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
            <MapPin size={14} className="text-purple" />
            <span className="truncate">{deliveryAddress}</span>
          </p>
          <h1 className="mt-2 font-display text-[1.85rem] font-extrabold leading-tight tracking-tight text-[var(--foreground)]">
            Hungry? Get what you need.
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Hey {firstName} — kitchens around you are ready.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <IconButton href="/activity" label="Notifications">
            <Bell size={18} />
          </IconButton>
          <span className="relative inline-flex">
            <IconButton href="/cart" label="Cart" variant="dark">
              <ShoppingBag size={18} />
            </IconButton>
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1 text-[10px] font-extrabold text-ink">
                  {cartCount}
                </span>
              ) : null}
            </span>
        </div>
      </div>

      <div className="mt-5">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search kitchens and dishes"
          trailing={
            <button
              type="button"
              aria-label="Filters"
              onClick={() => setFiltersOpen(true)}
              className="tap-target flex h-9 w-9 items-center justify-center rounded-full bg-[var(--background)] text-[var(--foreground)]"
            >
              <SlidersHorizontal size={16} />
            </button>
          }
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-[28px] bg-purple px-5 py-5 text-white shadow-runr-card">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-lime">Tonight</p>
        <p className="mt-2 max-w-[16rem] text-xl font-extrabold leading-tight">$5 off with code RUNR5</p>
        <p className="mt-1 text-sm text-white/75">Or 10% off with PORTER10 at checkout.</p>
        <Link
          href={filtered[0] ? `/restaurant/?id=${filtered[0].id}` : "/"}
          className="mt-4 inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-extrabold text-ink"
        >
          Order now
        </Link>
      </div>

      <CatalogPreviewBanner className="mt-4" />

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const active = cat === "All" ? !selectedCategory : selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat === "All" ? null : cat)}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <span className={`rounded-full p-0.5 ${active ? "ring-2 ring-[var(--foreground)]" : ""}`}>
                <CuisinePlate cuisine={cat} size={56} />
              </span>
              <span className={`text-[11px] font-bold ${active ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>{cat}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 md:grid md:grid-cols-[minmax(0,1fr)_240px] md:items-start md:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[var(--foreground)]">Popular dishes</h2>
              <p className="text-sm text-[var(--muted)]">Tap + to add, or open a kitchen for the full menu</p>
            </div>
          </div>

          {popularDishes.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No dishes match"
                description="Try another search or category. Nearby kitchens appear after you sign in."
              />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {popularDishes.map((dish) => (
                <DishCard
                  key={`${dish.businessId}-${dish.id}`}
                  name={dish.name}
                  description={dish.businessName}
                  price={dish.price}
                  cuisine={dish.cuisine}
                  qty={qtyFor(dish.id)}
                  discountLabel={dish.popular ? "Popular" : undefined}
                  onOpen={() => router.push(`/restaurant/?id=${dish.businessId}`)}
                  onAdd={() => addDish(dish)}
                  onRemove={() => updateCartQuantity(dish.id, qtyFor(dish.id) - 1)}
                />
              ))}
            </div>
          )}

          <div className="mt-8 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[var(--foreground)]">Nearby kitchens</h2>
              <p className="text-sm text-[var(--muted)]">Fulfilled by RUNRs in your area</p>
            </div>
          </div>
          <div className="mt-3 space-y-3">
            {filtered.length === 0 ? (
              <EmptyState
                title="No kitchens yet"
                description="No listings match your search. Clear filters to see everything nearby."
                action={
                  <button
                    type="button"
                    className="tap-target h-11 rounded-full bg-purple px-5 text-sm font-bold text-white"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery("");
                    }}
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              filtered.map((b, i) => (
                <Link key={b.id} href={`/restaurant/?id=${b.id}`}>
                  <BusinessCard
                    business={b}
                    userLocation={location}
                    featured={i === 0}
                    isFavorite={favoriteBusinessIds.includes(b.id)}
                    onFavoriteToggle={() => toggleFavorite(b.id)}
                  />
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 hidden overflow-hidden rounded-[28px] shadow-runr-card md:sticky md:top-6 md:mt-0 md:block md:h-[22rem] lg:h-[28rem]">
          <MapView center={location} markers={markers} dark={theme === "dark"} className="h-full" />
        </div>
      </div>

      <div className="relative mt-6 h-48 overflow-hidden rounded-[28px] shadow-runr-card md:hidden">
        <MapView center={location} markers={markers} dark={theme === "dark"} className="h-full" />
      </div>

      {cartCount > 0 && (
        <Link
          href="/cart"
          className="sticky-cta flex h-14 items-center justify-center rounded-full bg-ink text-sm font-extrabold text-white shadow-runr-card md:static md:mt-8 md:w-full"
        >
          View cart ({cartCount})
        </Link>
      )}

      <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <p className="text-sm text-[var(--muted)]">Show kitchens by cuisine. This updates Discover immediately.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = cat === "All" ? !selectedCategory : selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat === "All" ? null : cat);
                  setFiltersOpen(false);
                }}
                className={`h-10 rounded-full px-4 text-sm font-bold ${
                  active ? "bg-purple text-white" : "bg-[var(--background)] text-[var(--foreground)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
