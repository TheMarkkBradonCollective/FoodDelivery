"use client";

import { useEffect } from "react";
import type { UserRole } from "../../types/index";
import { isApiConfigured } from "../../lib/api/config";
import { getCurrentAuthSession } from "../../lib/api/auth";
import { useAppStore } from "../../store/create-app-store";

/** Restores the signed-in user from the stored API token for mobile apps. */
export function AuthSync({ role }: { role: UserRole }) {
  const setUser = useAppStore((s) => s.setUser);
  const setAuthReady = useAppStore((s) => s.setAuthReady);

  useEffect(() => {
    if (!isApiConfigured()) {
      setAuthReady(true);
      return;
    }
    let cancelled = false;
    const timeout = window.setTimeout(() => setAuthReady(true), 4000);
    void getCurrentAuthSession()
      .then((session) => {
        if (cancelled) return;
        setUser(session && session.user.role === role ? session.user : null);
      })
      .finally(() => !cancelled && setAuthReady(true));
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [role, setUser, setAuthReady]);

  return null;
}
