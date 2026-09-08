"use client";

import { ThemeProvider } from "../providers/ThemeProvider";
import { NativeSafeArea } from "../providers/NativeSafeArea";
import { useAppStore } from "../../store/create-app-store";
import { SignInPrompt } from "./SignInPrompt";

export function AuthGuard({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "customer" | "runr" | "business";
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
