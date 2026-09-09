"use client";

import { useState } from "react";
import { AppFrame } from "@runr/shared/components/layout/AppFrame";
import { ConfirmDialog } from "@runr/shared/components/ui/ConfirmDialog";
import { useAppStore } from "@/store";
import { Building2, LayoutDashboard, LogOut, MessageSquare, Package, Users } from "lucide-react";

export const staffNav = [
  { href: "/", label: "Status", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/coverage", label: "Coverage", icon: Building2 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/chat", label: "Chat", icon: MessageSquare },
];

export function StaffLayoutClient({ children }: { children: React.ReactNode }) {
  const logout = useAppStore((s) => s.logout);
  const [confirmOut, setConfirmOut] = useState(false);

  return (
    <>
      <AppFrame
        app="staff"
        tabs={staffNav}
        tone="dark"
        footer={
          <button
            type="button"
            onClick={() => setConfirmOut(true)}
            aria-label="Sign out"
            className="tap-target flex w-full items-center justify-center gap-2 rounded-full bg-white/8 py-3 text-sm font-bold text-cream"
          >
            <LogOut size={16} />
            <span className="hidden lg:inline">Sign out</span>
          </button>
        }
      >
        {children}
      </AppFrame>
      <ConfirmDialog
        open={confirmOut}
        title="Sign out of STAFF?"
        description="You will need your staff email and password to get back in."
        confirmLabel="Sign out"
        destructive
        onCancel={() => setConfirmOut(false)}
        onConfirm={() => {
          logout();
          setConfirmOut(false);
        }}
      />
    </>
  );
}
