"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Heart, Star } from "lucide-react";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { DishCard } from "@runr/shared/components/ui/DishCard";
import { DishPhoto } from "@runr/shared/components/ui/CuisinePlate";
import { IconButton } from "@runr/shared/components/ui/IconButton";
import { QuantityStepper } from "@runr/shared/components/ui/QuantityStepper";
import { BottomSheet } from "@runr/shared/components/ui/BottomSheet";
import { useAppStore } from "@/store";
import { formatCurrency } from "@runr/shared/lib/utils";
import type { MenuItem } from "@runr/shared/types";

export function RestaurantClient({ businessId }: { businessId: string }) {
  const { businesses, addToCart, cart, favoriteBusinessIds, toggleFavorite, updateCartQuantity } = useAppStore();
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [qty, setQty] = useState(1);

  const business = businesses.find((b) => b.id === businessId);
  const menuItems = useMemo(() => business?.menu ?? [], [business]);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const groupedMenu = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    for (const item of menuItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [menuItems]);

  function qtyFor(itemId: string) {
    return cart.find((c) => c.menuItemId === itemId)?.quantity ?? 0;
  }

  function addItem(item: MenuItem, quantity = 1) {
    addToCart(businessId, {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
    });
  }

  if (!business) {
    return (
      <div className="px-5 py-8">
        <EmptyState
          title="Kitchen not found"
          description="This listing is not available. It may have been removed or is still loading."
          action={
            <Link href="/" className="inline-flex h-11 items-center rounded-full bg-purple px-5 text-sm font-bold text-white">
              Back to Discover
            </Link>
          }
        />
      </div>
    );
  }

  const saved = favoriteBusinessIds.includes(business.id);

  return (
    <div className="pb-8">
      <div className="relative">
        <DishPhoto cuisine={business.cuisine} className="h-56 w-full md:h-72" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <IconButton href="/" label="Back to Discover">
            <ArrowLeft size={18} />
          </IconButton>
          <IconButton
            label={saved ? "Remove favorite" : "Save kitchen"}
            onClick={() => toggleFavorite(business.id)}
          >
            <Heart size={18} className={saved ? "fill-purple text-purple" : ""} />
          </IconButton>
        </div>
      </div>

      <div className="px-5 lg:px-8">
        <div className="-mt-8 rounded-[28px] bg-[var(--surface-elevated)] p-5 shadow-runr-card ring-1 ring-[var(--border)]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">{business.cuisine}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--foreground)]">{business.name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{business.address}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat icon={<Star size={14} />} label="Rating" value={String(business.rating)} />
            <Stat icon={<Clock size={14} />} label="ETA" value={`${business.etaMinutes} min`} />
            <Stat label="Delivery" value={formatCurrency(business.deliveryFee)} />
          </div>
        </div>

        {menuItems.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No menu items yet" description="This kitchen hasn’t published a menu yet." />
          </div>
        ) : (
          Object.entries(groupedMenu).map(([category, items]) => (
            <section key={category} className="mt-8">
              <h2 className="text-lg font-extrabold text-[var(--foreground)]">{category}</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {items.map((item) => (
                  <DishCard
                    key={item.id}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                    cuisine={item.category || business.cuisine}
                    qty={qtyFor(item.id)}
                    discountLabel={item.popular ? "Popular" : undefined}
                    onOpen={() => {
                      setSelected(item);
                      setQty(1);
                    }}
                    onAdd={() => addItem(item)}
                    onRemove={() => updateCartQuantity(item.id, qtyFor(item.id) - 1)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {cartCount > 0 && (
        <Link
          href="/cart"
          className="sticky-cta flex h-14 items-center justify-center rounded-full bg-ink text-sm font-extrabold text-white shadow-runr-card"
        >
          View cart ({cartCount})
        </Link>
      )}

      <BottomSheet
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name}
        stickyAction={
          selected ? (
            <div className="flex items-center gap-3">
              <QuantityStepper value={qty} onChange={setQty} min={1} />
              <button
                type="button"
                className="tap-target h-12 flex-1 rounded-full bg-purple text-sm font-extrabold text-white"
                onClick={() => {
                  addItem(selected, qty);
                  setSelected(null);
                }}
              >
                Add · {formatCurrency(selected.price * qty)}
              </button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div>
            <DishPhoto cuisine={selected.category || business.cuisine} className="h-40 w-full rounded-[24px]" />
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{selected.description}</p>
            <p className="mt-3 text-lg font-extrabold">{formatCurrency(selected.price)}</p>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}

function Stat({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--background)] px-3 py-2 text-center">
      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
