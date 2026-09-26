"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OrderTrackingClient } from "./OrderTrackingClient";

function TrackFromQuery() {
  const id = useSearchParams().get("id") ?? "";
  return <OrderTrackingClient orderId={id} />;
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Loading order…</div>}>
      <TrackFromQuery />
    </Suspense>
  );
}
