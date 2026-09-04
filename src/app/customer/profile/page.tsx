"use client";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAppStore } from "@/store/app-store";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/ui/BottomNavigation";
import { customerNav } from "../CustomerLayoutClient";

export default function CustomerProfilePage() {
  const { user, logout } = useAppStore();
  const router = useRouter();

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-6 rounded-runr-xl border border-[var(--border)] p-6">
        <p className="font-semibold">{user?.name}</p>
        <p className="text-sm text-[var(--muted)]">{user?.email}</p>
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
      <BottomNavigation items={customerNav} />
    </div>
  );
}
