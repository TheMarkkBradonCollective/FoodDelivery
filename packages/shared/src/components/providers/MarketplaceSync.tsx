"use client";

import { useEffect } from "react";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { getSupabaseClient } from "../../lib/supabase/client";
import { fetchMarketplace } from "../../lib/supabase/marketplace";
import { useAppStore } from "../../store/create-app-store";

export function MarketplaceSync() {
  const user = useAppStore((s) => s.user);
  const hydrateMarketplace = useAppStore((s) => s.hydrateMarketplace);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user) return;

    let cancelled = false;

    const userId = user.id;

    async function load() {
      const snapshot = await fetchMarketplace(userId);
      if (!cancelled) hydrateMarketplace(snapshot);
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
  }, [user, hydrateMarketplace]);

  return null;
}
