"use client";

import { useEffect, useRef } from "react";
import { isApiConfigured } from "../../lib/api/config";
import { fetchMarketplace } from "../../lib/api/marketplace";
import { ensureStore, useAppStore } from "../../store/create-app-store";

const POLL_MS_MIN = 10_000;
const POLL_MS_MAX = 15_000;

function pollDelay() {
  return POLL_MS_MIN + Math.floor(Math.random() * (POLL_MS_MAX - POLL_MS_MIN));
}

export function MarketplaceSync() {
  const user = useAppStore((s) => s.user);
  const hydrateMarketplace = useAppStore((s) => s.hydrateMarketplace);
  const setMarketplaceReady = useAppStore((s) => s.setMarketplaceReady);
  const lastSyncRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isApiConfigured() || !user) {
      setMarketplaceReady(Boolean(!user));
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (ensureStore().getState().businesses.length === 0) {
      setMarketplaceReady(false);
    }

    const userId = user.id;
    const accessPreference = user.accessPreference;

    async function load(forceFull = false) {
      try {
        const result = await fetchMarketplace(
          userId,
          accessPreference,
          forceFull ? undefined : lastSyncRef.current,
        );
        if (cancelled) return;
        lastSyncRef.current = result.serverTime;

        if (result.kind === "unchanged") return;

        const snapshot = result.snapshot;
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
      } catch (err) {
        console.warn("marketplace sync", err);
      } finally {
        if (!cancelled) setMarketplaceReady(true);
      }
    }

    void load(true);

    const schedule = () => {
      timer = setTimeout(() => {
        void load(false).finally(() => {
          if (!cancelled) schedule();
        });
      }, pollDelay());
    };
    schedule();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [user, hydrateMarketplace, setMarketplaceReady]);

  return null;
}
