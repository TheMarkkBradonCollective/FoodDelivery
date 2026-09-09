"use client";

import { Heart, Minus, Plus } from "lucide-react";
import { clsx } from "clsx";
import { formatCurrency } from "../../lib/utils";
import { DishPhoto } from "./CuisinePlate";

type Props = {
  name: string;
  description?: string;
  price: number;
  cuisine: string;
  qty?: number;
  favorite?: boolean;
  discountLabel?: string;
  onOpen?: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleFavorite?: () => void;
};

export function DishCard({
  name,
  description,
  price,
  cuisine,
  qty = 0,
  favorite,
  discountLabel,
  onOpen,
  onAdd,
  onRemove,
  onToggleFavorite,
}: Props) {
  return (
    <article className="surface-card overflow-hidden rounded-2xl">
      <div className="relative">
        <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={name}>
          <DishPhoto cuisine={cuisine} className="aspect-[3/2] w-full" />
        </button>
        {discountLabel ? (
          <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">
            {discountLabel}
          </span>
        ) : null}
        {onToggleFavorite ? (
          <button
            type="button"
            aria-label={favorite ? `Unsave ${name}` : `Save ${name}`}
            onClick={onToggleFavorite}
            className="tap-target absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-elevated)]/90 shadow-sm"
          >
            <Heart size={14} className={clsx(favorite ? "fill-purple text-purple" : "text-[var(--muted)]")} />
          </button>
        ) : null}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-bold text-[var(--foreground)]">{name}</p>
        {description ? <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{description}</p> : null}
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm font-extrabold tabular-nums text-[var(--foreground)]">{formatCurrency(price)}</p>
          {qty > 0 ? (
            <div className="flex items-center gap-0.5 rounded-full bg-[var(--background)] p-0.5 ring-1 ring-[var(--border)]">
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={onRemove}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground)]"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-4 text-center text-xs font-bold tabular-nums">{qty}</span>
              <button
                type="button"
                aria-label={`Add ${name}`}
                onClick={onAdd}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-purple text-white"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label={`Add ${name}`}
              onClick={onAdd}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
