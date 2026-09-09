"use client";

import { useAppStore } from "@/store";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { selectVendorBusiness } from "@runr/shared/lib/utils";
import { JobLoop } from "@runr/shared/components/ui/JobLoop";

export default function BusinessCatalogPage() {
  const { businesses, user, updateMenuItem } = useAppStore();
  const business = selectVendorBusiness(businesses, user?.id);
  const menu = business?.menu ?? [];

  if (!business) {
    return (
      <div className="px-5 py-8">
        <EmptyState title="No business connected" description="Sign in with your VENDR account." />
      </div>
    );
  }

  return (
    <div className="px-5 pb-8 pt-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple">VENDR</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold">Catalog</h1>
      <JobLoop app="vendr" className="mt-1" />
      <p className="mt-1 text-sm text-[var(--muted)]">
        What PORTER customers browse. Prices here are what the marketplace sells.
      </p>

      <div className="mt-4 space-y-2">
        {menu.length === 0 ? (
          <EmptyState title="No items yet" description="Add products once live catalog tables are seeded." />
        ) : (
          menu.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold">{item.name}</p>
                <p className="text-xs text-[var(--muted)]">{item.category}</p>
              </div>
              <label className="shrink-0 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Price
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.price}
                  onChange={(e) =>
                    updateMenuItem(business.id, item.id, { price: Number(e.target.value) || 0 })
                  }
                  className="mt-1 block w-20 rounded-xl border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm font-extrabold text-[var(--foreground)]"
                />
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
