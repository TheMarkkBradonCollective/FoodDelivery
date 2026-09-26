"use client";

import { cn } from "../../lib/utils";
import { useCustomerSkin } from "../providers/CustomerSkinProvider";

export function CustomerEyebrow({ className }: { className?: string }) {
  const skin = useCustomerSkin();
  return (
    <p className={cn("text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple", className)}>
      {skin.shortName}
    </p>
  );
}
