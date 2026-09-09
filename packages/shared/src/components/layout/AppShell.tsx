"use client";

import { ThemeProvider } from "../providers/ThemeProvider";
import { NativeSafeArea } from "../providers/NativeSafeArea";
import { SupabaseAuthSync } from "../providers/SupabaseAuthSync";
import { MarketplaceSync } from "../providers/MarketplaceSync";
import { useAppStore } from "../../store/create-app-store";
import { SignInPrompt } from "./SignInPrompt";
import type { UserRole } from "../../types/index";

type AppShellRole = Exclude<UserRole, never>;

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
  return (
    <ThemeProvider>
      <NativeSafeArea darkChrome={role === "business" || role === "staff"}>
        <SupabaseAuthSync role={role} />
        <MarketplaceSync />
        <AuthGuard role={role}>{children}</AuthGuard>
      </NativeSafeArea>
    </ThemeProvider>
  );
}
