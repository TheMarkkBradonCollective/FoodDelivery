"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, List, LogOut, Map, Moon, Sun } from "lucide-react";
import { SettingsRow, ToggleSwitch } from "@runr/shared/components/ui/SettingsRow";
import { ConfirmDialog } from "@runr/shared/components/ui/ConfirmDialog";
import { useAppStore } from "@/store";

export default function RunrProfilePage() {
  const { user, theme, toggleTheme, logout, earnings, runHistory } = useAppStore();
  const router = useRouter();
  const [confirmOut, setConfirmOut] = useState(false);

  const completedDeliveries = earnings.length;
  const reliability = runHistory.length === 0 ? "—" : `${Math.min(99, 90 + runHistory.length)}%`;

  return (
    <div className="px-5 pb-8 pt-5 lg:mx-auto lg:max-w-xl">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">RUNR</p>
      <h1 className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">Profile</h1>

      <div className="surface-card mt-6 flex items-center gap-4 rounded-[28px] p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple text-xl font-extrabold text-white">
          {user?.name?.charAt(0) ?? "R"}
        </div>
        <div className="min-w-0">
          <p className="truncate font-extrabold">{user?.name}</p>
          <p className="truncate text-sm text-[var(--muted)]">{user?.email}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="surface-card rounded-[20px] p-3 text-center">
          <p className="text-lg font-extrabold">{runHistory.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">RUNs</p>
        </div>
        <div className="surface-card rounded-[20px] p-3 text-center">
          <p className="text-lg font-extrabold">{completedDeliveries}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Drops</p>
        </div>
        <div className="surface-card rounded-[20px] p-3 text-center">
          <p className="text-lg font-extrabold">{reliability}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Reliability</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {completedDeliveries} completed drops on the marketplace.
      </p>

      <div className="surface-card mt-6 space-y-1 rounded-[28px] p-3">
        <SettingsRow
          icon={<Map size={18} />}
          title="Map"
          subtitle="Available kitchens and RUNs"
          onClick={() => router.push("/")}
        />
        <SettingsRow
          icon={<List size={18} />}
          title="RUNs"
          subtitle="Booked and available windows"
          onClick={() => router.push("/runs")}
        />
        <SettingsRow
          icon={<DollarSign size={18} />}
          title="Earnings"
          subtitle="Pay and tips per drop"
          onClick={() => router.push("/earnings")}
        />
        <SettingsRow
          icon={theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          title="Dark mode"
          trailing={<ToggleSwitch on={theme === "dark"} onChange={() => toggleTheme()} label="Dark mode" />}
        />
      </div>

      <button
        type="button"
        onClick={() => setConfirmOut(true)}
        className="tap-target mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--background)] text-sm font-bold text-[var(--foreground)] ring-1 ring-[var(--border)]"
      >
        <LogOut size={16} /> Sign out
      </button>

      <ConfirmDialog
        open={confirmOut}
        title="Sign out of RUNR?"
        description="You will need your courier email and password to get back in."
        confirmLabel="Sign out"
        destructive
        onCancel={() => setConfirmOut(false)}
        onConfirm={() => {
          logout();
          setConfirmOut(false);
          router.push("/");
        }}
      />
    </div>
  );
}
