"use client";

import { Bike } from "lucide-react";
import { cn } from "../../lib/utils";
import { APP_COPY, type AppId } from "../../lib/apps";
import { useCustomerSkin } from "../providers/CustomerSkinProvider";

export function BrandMark({
  size = "md",
  inverted,
  className,
}: {
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  className?: string;
}) {
  const skin = useCustomerSkin();
  const dim = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-10 w-10" : "h-14 w-14";
  return (
    <div
      className={cn("flex items-center justify-center rounded-full shadow-porter-card", dim, className)}
      style={
        inverted
          ? { backgroundColor: skin.themeColor, color: skin.markBackground }
          : { backgroundColor: skin.markBackground, color: skin.markForeground }
      }
      aria-hidden
    >
      <Bike className={size === "lg" ? "h-8 w-8" : size === "sm" ? "h-5 w-5" : "h-7 w-7"} strokeWidth={2.2} />
    </div>
  );
}

export function BrandLockup({
  app,
  inverted,
  className,
}: {
  app: AppId;
  inverted?: boolean;
  className?: string;
}) {
  const skin = useCustomerSkin();
  const copy = app === "porter" ? skin : APP_COPY[app];
  const onDark = inverted ?? app === "staff";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark size="sm" inverted={onDark} />
      <div className="min-w-0">
        <p className={cn("truncate text-sm font-extrabold tracking-tight", onDark ? "text-cream" : "text-[var(--foreground)]")}>
          {copy.shortName}
        </p>
        <p className={cn("truncate text-[11px]", onDark ? "text-cream/55" : "text-[var(--muted)]")}>{copy.tagline}</p>
      </div>
    </div>
  );
}
