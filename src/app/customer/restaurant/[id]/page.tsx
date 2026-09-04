"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAppStore } from "@/store/app-store";
import { mockMenuItems } from "@/data/mock-data";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Plus } from "lucide-react";

export default function RestaurantPage() {
  const params = useParams();
  const businessId = params.id as string;
  const { businesses, addToCart, cart } = useAppStore();

  const business = businesses.find((b) => b.id === businessId);
  const menu = mockMenuItems[businessId] ?? [];
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const groupedMenu = useMemo(() => {
    const groups: Record<string, typeof menu> = {};
    for (const item of menu) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [menu]);

  if (!business) {
    return <div className="p-6">Restaurant not found</div>;
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="relative h-48 bg-gradient-to-br from-runr-primary/30 to-runr-navigation/20">
        <Link
          href="/customer"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] shadow-runr-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="px-4 -mt-8">
        <div className="rounded-runr-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-runr-card">
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {business.cuisine} · ★ {business.rating} · {business.etaMinutes} min ·{" "}
            {formatCurrency(business.deliveryFee)} delivery
          </p>
        </div>

        {Object.entries(groupedMenu).map(([category, items]) => (
          <section key={category} className="mt-8">
            <h2 className="text-lg font-semibold">{category}</h2>
            <div className="mt-3 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-runr-lg border border-[var(--border)] p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.popular && (
                        <span className="rounded-full bg-runr-primary-muted px-2 py-0.5 text-[10px] font-bold uppercase text-runr-primary">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.description}</p>
                    <p className="mt-2 font-semibold">{formatCurrency(item.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      addToCart(businessId, {
                        menuItemId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                      })
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-runr-primary text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed inset-x-4 bottom-6 z-50">
          <Link href="/customer/cart">
            <PrimaryButton className="w-full">
              View Cart ({cartCount})
            </PrimaryButton>
          </Link>
        </div>
      )}
    </div>
  );
}
