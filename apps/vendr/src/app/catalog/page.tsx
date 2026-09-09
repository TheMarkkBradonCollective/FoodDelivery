"use client";

import { useAppStore } from "@/store";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { selectVendorBusiness } from "@runr/shared/lib/utils";
import { formatCurrency } from "@runr/shared/lib/utils";
import { JobLoop } from "@runr/shared/components/ui/JobLoop";

export default function BusinessCatalogPage() {
  const { businesses, user, updateMenuItem } = useAppStore();
  const business = selectVendorBusiness(businesses, user?.id);
  const menu = business?.menu ?? [];

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <EmptyState title="No business connected" description="Sign in with your VENDR account." />
      </div>
    );
  }

  return (
    <div className="px-5 py-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple">VENDR</p>
      <h1 className="mt-1 text-2xl font-extrabold">Catalog</h1>
      <JobLoop app="vendr" className="mt-1" />
      <p className="mt-1 text-sm text-[var(--muted)]">
        What PORTER customers browse. Prices here are what the marketplace sells.
      </p>

      <div className="mt-6 space-y-3">
        {menu.length === 0 ? (
          <EmptyState title="No items yet" description="Add products once live catalog tables are seeded." />
        ) : (
          menu.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-extrabold">{item.name}</p>
                  <p className="text-sm text-[var(--muted)]">{item.category}</p>
                </div>
                <label className="shrink-0 text-right text-xs font-bold text-[var(--muted)]">
                  Price
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      updateMenuItem(business.id, item.id, { price: Number(e.target.value) || 0 })
                    }
                    className="mt-1 block w-24 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm font-extrabold text-[var(--foreground)]"
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">{formatCurrency(item.price)} on PORTER</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
