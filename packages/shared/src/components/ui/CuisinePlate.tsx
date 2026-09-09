"use client";

import { cn } from "../../lib/utils";
import { CUISINE_PLATES } from "../../data/constants";

function plateFor(cuisine: string) {
  return CUISINE_PLATES[cuisine] ?? CUISINE_PLATES.Restaurant;
}

export function CuisinePlate({ cuisine, size = 56 }: { cuisine: string; size?: number }) {
  const plate = plateFor(cuisine);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full shadow-inner"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(135deg, ${plate.from}, ${plate.to})`,
      }}
      aria-hidden
    >
      {plate.emoji}
    </span>
  );
}

export function DishPhoto({ cuisine, className }: { cuisine: string; className?: string }) {
  const plate = plateFor(cuisine);
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: `linear-gradient(160deg, ${plate.from}33, ${plate.to}66)` }}
    >
      <span className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow-sm" aria-hidden>
        {plate.emoji}
      </span>
    </div>
  );
}
