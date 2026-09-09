"use client";

import { Bike } from "lucide-react";
import { cn } from "../../lib/utils";

export function BrandMark({
  size = "md",
  inverted,
  className,
}: {
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  className?: string;
}) {
  const dim = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-10 w-10" : "h-14 w-14";
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full shadow-runr-card",
        inverted ? "bg-[#7048F8] text-[#A0F878]" : "bg-[#A0F878] text-[#1A1224]",
        dim,
        className
      )}
      aria-hidden
    >
      <Bike className={size === "lg" ? "h-8 w-8" : size === "sm" ? "h-5 w-5" : "h-7 w-7"} strokeWidth={2.2} />
    </div>
  );
}
