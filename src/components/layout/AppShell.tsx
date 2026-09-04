"use client";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useAppStore } from "@/store/app-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "customer" | "runr" | "business";
}) {
  const user = useAppStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    if (role && user.role !== role) {
      router.replace(`/${user.role}`);
    }
  }, [user, role, router]);

  if (!user || (role && user.role !== role)) {
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
  role?: "customer" | "runr" | "business";
}) {
  return (
    <ThemeProvider>
      <AuthGuard role={role}>{children}</AuthGuard>
    </ThemeProvider>
  );
}
