"use client";

import { useEffect } from "react";
import type { UserRole } from "../../types/index";
import { getSupabaseClient } from "../../lib/supabase/client";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { sessionToAuthSession } from "../../lib/supabase/auth";
import { useAppStore } from "../../store/create-app-store";

/** Keeps the zustand user in sync with the Supabase session for mobile apps. */
export function SupabaseAuthSync({ role }: { role: UserRole }) {
  const setUser = useAppStore((s) => s.setUser);
  const setAuthReady = useAppStore((s) => s.setAuthReady);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthReady(true);
      return;
    }

    const supabase = getSupabaseClient();

    async function syncSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          setUser(null);
          return;
        }

        const session = await sessionToAuthSession(data.session);
        setUser(session.user.role === role ? session.user : null);
      } catch {
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    }

    void syncSession();
    const timeout = window.setTimeout(() => setAuthReady(true), 2500);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(null);
        return;
      }

      const authSession = await sessionToAuthSession(session);
      setUser(authSession.user.role === role ? authSession.user : null);
    });

    return () => {
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [role, setUser, setAuthReady]);

  return null;
}
