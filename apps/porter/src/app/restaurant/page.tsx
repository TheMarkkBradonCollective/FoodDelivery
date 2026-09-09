"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RestaurantClient } from "./RestaurantClient";

function RestaurantFromQuery() {
  const id = useSearchParams().get("id") ?? "";
  return <RestaurantClient businessId={id} />;
}

export default function RestaurantPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Loading kitchen…</div>}>
      <RestaurantFromQuery />
    </Suspense>
  );
}
