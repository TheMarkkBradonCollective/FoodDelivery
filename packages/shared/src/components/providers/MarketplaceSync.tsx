"use client";

import { useEffect } from "react";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { getSupabaseClient } from "../../lib/supabase/client";
import { fetchMarketplace } from "../../lib/supabase/marketplace";
import { ensureStore, useAppStore } from "../../store/create-app-store";

export function MarketplaceSync() {
  const user = useAppStore((s) => s.user);
  const hydrateMarketplace = useAppStore((s) => s.hydrateMarketplace);
  const setMarketplaceReady = useAppStore((s) => s.setMarketplaceReady);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user) {
      setMarketplaceReady(Boolean(!user));
      return;
    }

    let cancelled = false;
    if (ensureStore().getState().businesses.length === 0) {
      setMarketplaceReady(false);
    }

    const userId = user.id;

    async function load() {
      const snapshot = await fetchMarketplace(userId);
      if (cancelled) return;
      const hasLiveCatalog = snapshot.businesses.some((b) => (b.menu?.length ?? 0) > 0);
      if (hasLiveCatalog) {
        hydrateMarketplace(snapshot, false);
        return;
      }
      const { buildPreviewSnapshot } = await import("../../data/demo-catalog");
      hydrateMarketplace(buildPreviewSnapshot(user ?? undefined), true);
    }

    void load();

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("runr-marketplace")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "runs" }, () => {
        void load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "deliveries" }, () => {
        void load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "businesses" }, () => {
        void load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_messages" }, () => {
        void load();
      })
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [user, hydrateMarketplace, setMarketplaceReady]);

  return null;
}
