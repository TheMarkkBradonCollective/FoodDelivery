"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "./AuthProvider";

export function ProtectedRoute({
  children,
  roles,
  redirectTo = "/login",
}: {
  children: React.ReactNode;
  roles?: ("customer" | "runr" | "business" | "staff")[];
  redirectTo?: string;
}) {
  const { session, isLoading, allowed } = useRequireAuth(roles);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace(redirectTo);
    } else if (!isLoading && session && roles && !allowed) {
      router.replace(session.user.role === "staff" ? "/staff" : "/account");
    }
  }, [isLoading, session, allowed, roles, router, redirectTo]);

  if (isLoading || !session || (roles && !allowed)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0066FF] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
