"use client";

import { useEffect } from "react";
import { isDemoMode, isApiConfigured } from "../../lib/api/config";
import { fetchMarketplace, marketplaceChangedSince } from "../../lib/api/marketplace";
import { ensureStore, useAppStore } from "../../store/create-app-store";

export function MarketplaceSync() {
  const user = useAppStore((s) => s.user);
  const hydrateMarketplace = useAppStore((s) => s.hydrateMarketplace);
  const setMarketplaceReady = useAppStore((s) => s.setMarketplaceReady);

  useEffect(() => {
    if (isDemoMode()) {
      if (!user) {
        setMarketplaceReady(true);
        return;
      }
      const state = ensureStore().getState();
      // Keep locally persisted demo state; seed only on first sign-in.
      if (!(state.catalogPreview && state.businesses.length > 0)) {
        void import("../../data/demo-catalog").then(({ buildPreviewSnapshot }) => {
          hydrateMarketplace(
            buildPreviewSnapshot({ id: user.id, role: user.role, accessPreference: user.accessPreference }),
            true,
          );
          setMarketplaceReady(true);
        });
      } else {
        setMarketplaceReady(true);
      }
      return;
    }
    if (!isApiConfigured() || !user) {
      setMarketplaceReady(Boolean(!user));
      return;
    }

    let cancelled = false;
    if (ensureStore().getState().businesses.length === 0) {
      setMarketplaceReady(false);
    }

    const userId = user.id;
    const accessPreference = user.accessPreference;

    async function load() {
      const snapshot = await fetchMarketplace(userId, accessPreference);
      if (cancelled) return;
      const hasLiveCatalog = snapshot.businesses.some((b) => (b.menu?.length ?? 0) > 0);
      if (hasLiveCatalog) {
        hydrateMarketplace(snapshot, false);
        return;
      }
      const { buildPreviewSnapshot } = await import("../../data/demo-catalog");
      hydrateMarketplace(
        buildPreviewSnapshot(user ? { id: user.id, role: user.role, accessPreference } : undefined),
        true,
      );
    }

    void load();

    // Polling replaces Supabase realtime: cheap "changed since" check every 12s while visible.
    let since: string | null = new Date().toISOString();
    const timer = window.setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await marketplaceChangedSince(since);
        if (res.changed) await load();
        since = res.serverTime;
      } catch {
        // offline or API down; try again next tick
      }
    }, 12000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [user, hydrateMarketplace, setMarketplaceReady]);

  return null;
}
