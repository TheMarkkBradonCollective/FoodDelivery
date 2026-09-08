"use client";

import { ThemeProvider } from "../providers/ThemeProvider";
import { NativeSafeArea } from "../providers/NativeSafeArea";
import { useAppStore } from "../../store/create-app-store";
import { useEffect } from "react";

export function AuthGuard({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "customer" | "runr" | "business";
}) {
  const user = useAppStore((s) => s.user);
  const loginAs = useAppStore((s) => s.loginAs);

  useEffect(() => {
    if (!user) {
      loginAs(role);
    } else if (user.role !== role) {
      loginAs(role);
    }
  }, [user, role, loginAs]);

  if (!user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-runr-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

export function AppShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "customer" | "runr" | "business";
}) {
  return (
    <ThemeProvider>
      <NativeSafeArea>
        <AuthGuard role={role}>{children}</AuthGuard>
      </NativeSafeArea>
    </ThemeProvider>
  );
}
