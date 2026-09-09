"use client";

import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";
import { useAppStore } from "@/store";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomerProfilePage() {
  const { user, logout } = useAppStore();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="brand-hero brand-hero--flush px-5 pb-10 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">PORTER</p>
        <h1 className="mt-1 text-2xl font-extrabold text-white">Profile</h1>
      </div>
      <div className="px-4 pt-2">
      <div className="rounded-runr-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-runr-card">
        <p className="font-semibold">{user?.name}</p>
        <p className="text-sm text-[var(--muted)]">{user?.email}</p>
      </div>
      <PrimaryButton
        className="mt-6 w-full"
        variant="secondary"
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        <LogOut className="h-4 w-4" /> Sign Out
      </PrimaryButton>
      </div>
    </div>
  );
}
