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
import type { User } from "@runr/shared/types";
import { useAppStore } from "@/store";

const SESSION_KEY = "runr-web-session";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed: AuthSession = JSON.parse(raw);
        setSession(parsed);
        setUser(parsed.user);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setIsLoading(false);
  }, [setUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = authenticate(email, password);
      if (!result.success) {
        return { error: result.error };
      }
      setSession(result.session);
      setUser(result.session.user);
      localStorage.setItem(SESSION_KEY, JSON.stringify(result.session));
      return {};
    },
    [setUser]
  );

  const logout = useCallback(() => {
    setSession(null);
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
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
