"use client";

import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";
import { useAppStore } from "@/store";
import { Moon, Sun, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RunrProfilePage() {
  const { user, theme, toggleTheme, logout, earnings, runHistory } = useAppStore();
  const router = useRouter();

  const completedDeliveries = earnings.length;
  const reliability = runHistory.length > 0 ? "—" : "—";

  return (
    <div className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="mt-6 rounded-runr-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-runr-primary text-2xl font-bold text-white">
          {user?.name?.charAt(0) ?? "R"}
        </div>
        <h2 className="mt-4 text-xl font-semibold">{user?.name}</h2>
        <p className="text-sm text-[var(--muted)]">{user?.email}</p>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold">—</p>
            <p className="text-xs text-[var(--muted)]">Rating</p>
          </div>
          <div>
            <p className="text-lg font-bold">{completedDeliveries}</p>
            <p className="text-xs text-[var(--muted)]">Deliveries</p>
          </div>
          <div>
            <p className="text-lg font-bold">{reliability}</p>
            <p className="text-xs text-[var(--muted)]">Reliability</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-[var(--muted)]">
          Profile stats will sync from Supabase once your account is connected.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <PrimaryButton
          variant="secondary"
          className="w-full"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <>
              <Moon className="h-4 w-4" /> Dark Mode
            </>
          ) : (
            <>
              <Sun className="h-4 w-4" /> Light Mode
            </>
          )}
        </PrimaryButton>
        <PrimaryButton
          variant="ghost"
          className="w-full"
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
