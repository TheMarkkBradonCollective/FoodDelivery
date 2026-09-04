"use client";

import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";
import { useAppStore } from "@/store";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BusinessSettingsPage() {
  const { user, logout } = useAppStore();
  const router = useRouter();

  return (
    <div className="px-4 py-6 pb-24 lg:pb-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-6 rounded-runr-xl border border-[var(--border)] p-6">
        <p className="font-semibold">{user?.name}</p>
        <p className="text-sm text-[var(--muted)]">{user?.email}</p>
        <p className="mt-4 text-sm">Tony&apos;s Pizza · San Francisco</p>
      </div>
      <PrimaryButton
        className="mt-6 w-full"
        variant="ghost"
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        <LogOut className="h-4 w-4" /> Sign Out
      </PrimaryButton>
    </div>
  );
}
