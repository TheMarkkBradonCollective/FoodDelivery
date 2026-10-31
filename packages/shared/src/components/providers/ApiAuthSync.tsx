"use client";

import { useEffect } from "react";
import type { UserRole } from "../../types/index";
import { isApiConfigured } from "../../lib/api/config";
import { getCurrentAuthSession } from "../../lib/api/auth";
import { useAppStore } from "../../store/create-app-store";

/** Keeps the zustand user in sync with the API session for mobile apps. */
export function ApiAuthSync({ role }: { role: UserRole }) {
  const setUser = useAppStore((s) => s.setUser);
  const setAuthReady = useAppStore((s) => s.setAuthReady);

  useEffect(() => {
    if (!isApiConfigured()) {
      setAuthReady(true);
      return;
    }

    async function syncSession() {
      try {
        const session = await getCurrentAuthSession();
        setUser(session?.user.role === role ? session.user : null);
      } catch {
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    }

    void syncSession();
    const timeout = window.setTimeout(() => setAuthReady(true), 2500);
    const interval = window.setInterval(() => void syncSession(), 30_000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [role, setUser, setAuthReady]);

  return null;
}
