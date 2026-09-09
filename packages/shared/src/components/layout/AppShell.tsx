"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "../providers/ThemeProvider";
import { NativeSafeArea } from "../providers/NativeSafeArea";
import { SupabaseAuthSync } from "../providers/SupabaseAuthSync";
import { MarketplaceSync } from "../providers/MarketplaceSync";
import { ensureStore, useAppStore } from "../../store/create-app-store";
import { SignInPrompt } from "./SignInPrompt";
import { Onboarding } from "../auth/Onboarding";
import { ToastHost } from "../ui/ToastHost";
import { BrandMark } from "../ui/BrandMark";
import { APP_COPY, roleToApp } from "../../lib/apps";
import type { UserRole } from "../../types/index";

type AppShellRole = Exclude<UserRole, never>;

function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const store = ensureStore() as unknown as {
      persist?: { hasHydrated: () => boolean; onFinishHydration: (cb: () => void) => () => void };
    };
    const finish = () => setHydrated(true);
    if (!store.persist) {
      finish();
      return;
    }
    const unsub = store.persist.onFinishHydration(finish);
    if (store.persist.hasHydrated()) finish();
    const fallback = window.setTimeout(() => {
      finish();
      const state = (ensureStore() as unknown as { getState: () => { authReady: boolean; setAuthReady: (v: boolean) => void } }).getState();
      if (!state.authReady) state.setAuthReady(true);
    }, 1600);
    return () => {
      unsub?.();
      window.clearTimeout(fallback);
    };
  }, []);

  return hydrated;
}

function Splash({ role }: { role: AppShellRole }) {
  const copy = APP_COPY[roleToApp(role)];
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--background)] px-6">
      <BrandMark size="lg" inverted={role === "staff"} />
      <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.22em] text-purple">{copy.shortName}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{copy.tagline}</p>
    </div>
  );
}

export function AuthGuard({
  children,
  role,
}: {
  children: React.ReactNode;
  role: AppShellRole;
}) {
  const user = useAppStore((s) => s.user);

  if (!user || user.role !== role) {
    return <SignInPrompt role={role} />;
  }

  return <>{children}</>;
}

export function AppShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: AppShellRole;
}) {
  const hydrated = useStoreHydrated();
  const authReady = useAppStore((s) => s.authReady);
  const onboardingSeen = useAppStore((s) => s.onboardingSeen);
  const setOnboardingSeen = useAppStore((s) => s.setOnboardingSeen);
  const user = useAppStore((s) => s.user);

  let body: React.ReactNode = children;
  if (!hydrated || !authReady) {
    body = <Splash role={role} />;
  } else if (!onboardingSeen) {
    body = <Onboarding app={roleToApp(role)} onDone={() => setOnboardingSeen(true)} />;
  } else if (!user || user.role !== role) {
    body = <SignInPrompt role={role} />;
  }

  return (
    <ThemeProvider forceDark={role === "staff"}>
      <NativeSafeArea darkChrome={role === "staff"}>
        <SupabaseAuthSync role={role} />
        <MarketplaceSync />
        {body}
        <ToastHost />
      </NativeSafeArea>
    </ThemeProvider>
  );
}
