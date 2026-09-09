"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession } from "@runr/shared/lib/auth";
import { authenticate } from "@runr/shared/lib/auth";
import { getSupabaseClient } from "@runr/shared/lib/supabase/client";
import { isSupabaseConfigured } from "@runr/shared/lib/supabase/config";
import {
  getCurrentAuthSession,
  sessionToAuthSession,
  signOut as supabaseSignOut,
} from "@runr/shared/lib/supabase/auth";
import type { User } from "@runr/shared/types";
import { useAppStore } from "@/store";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      const authSession = await getCurrentAuthSession();
      if (cancelled) return;

      setSession(authSession);
      setUser(authSession?.user ?? null);
      setIsLoading(false);
    }

    void loadSession();

    if (!isSupabaseConfigured()) {
      return () => {
        cancelled = true;
      };
    }

    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (cancelled) return;

      if (!nextSession) {
        setSession(null);
        setUser(null);
        return;
      }

      const authSession = await sessionToAuthSession(nextSession);
      setSession(authSession);
      setUser(authSession.user);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [setUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authenticate(email, password);
      if (!result.success) {
        return { error: result.error };
      }
      setSession(result.session);
      setUser(result.session.user);
      return {};
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    await supabaseSignOut();
    setSession(null);
    setUser(null);
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth(allowedRoles?: User["role"][]) {
  const { session, isLoading } = useAuth();
  const allowed =
    !allowedRoles || (session && allowedRoles.includes(session.user.role));
  return { session, isLoading, allowed: !!allowed };
}
