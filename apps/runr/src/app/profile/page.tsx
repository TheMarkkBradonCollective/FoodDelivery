"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, DollarSign, List, LogOut, Map, Moon, ShieldCheck, Sun } from "lucide-react";
import { SettingsRow, ToggleSwitch } from "@runr/shared/components/ui/SettingsRow";
import { ConfirmDialog } from "@runr/shared/components/ui/ConfirmDialog";
import { BottomSheet } from "@runr/shared/components/ui/BottomSheet";
import { JobLoop } from "@runr/shared/components/ui/JobLoop";
import { useAppStore } from "@/store";

export default function RunrProfilePage() {
  const { user, theme, toggleTheme, logout, earnings, runHistory, showToast } = useAppStore();
  const router = useRouter();
  const [confirmOut, setConfirmOut] = useState(false);
  const [sheet, setSheet] = useState<"vehicle" | "payout" | null>(null);
  const [vehicle, setVehicle] = useState("Bike");
  const [payoutEmail, setPayoutEmail] = useState(user?.email ?? "");

  const completedDeliveries = earnings.length;
  const reliability = runHistory.length === 0 ? "—" : `${Math.min(99, 90 + runHistory.length)}%`;

  return (
    <div className="px-5 pb-8 pt-5 lg:mx-auto lg:max-w-xl">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">RUNR</p>
      <h1 className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">Profile</h1>
      <JobLoop app="runr" className="mt-1" />

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
          subtitle="Businesses that need coverage"
          onClick={() => router.push("/")}
        />
        <SettingsRow
          icon={<List size={18} />}
          title="RUNs"
          subtitle="Windows you chose to cover"
          onClick={() => router.push("/runs")}
        />
        <SettingsRow
          icon={<DollarSign size={18} />}
          title="Earnings & tips"
          subtitle="Pay per drop — not hourly"
          onClick={() => router.push("/earnings")}
        />
        <SettingsRow
          icon={<Bike size={18} />}
          title="Vehicle"
          subtitle={vehicle}
          onClick={() => setSheet("vehicle")}
        />
        <SettingsRow
          icon={<DollarSign size={18} />}
          title="Payout"
          subtitle={payoutEmail || "Add payout email"}
          onClick={() => setSheet("payout")}
        />
        <SettingsRow
          icon={<ShieldCheck size={18} />}
          title="Verification"
          subtitle="Preview accounts are ready to RUN"
        />
        <SettingsRow
          icon={theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          title="Dark mode"
          trailing={<ToggleSwitch on={theme === "dark"} onChange={() => toggleTheme()} label="Dark mode" />}
        />
      </div>

      <BottomSheet open={sheet === "vehicle"} onClose={() => setSheet(null)} title="Vehicle">
        <p className="text-sm text-[var(--muted)]">Used when you navigate to pickup and drop-off.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Bike", "Scooter", "Car"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setVehicle(option)}
              className={`h-11 rounded-full px-4 text-sm font-bold ${
                vehicle === option ? "bg-purple text-white" : "bg-[var(--background)]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="tap-target mt-4 h-12 w-full rounded-full bg-purple text-sm font-extrabold text-white"
          onClick={() => {
            setSheet(null);
            showToast(`${vehicle} saved`);
          }}
        >
          Save
        </button>
      </BottomSheet>

      <BottomSheet open={sheet === "payout"} onClose={() => setSheet(null)} title="Payout">
        <p className="text-sm text-[var(--muted)]">Where completed delivery pay and tips are sent.</p>
        <input
          className="input-brand mt-4"
          type="email"
          value={payoutEmail}
          onChange={(e) => setPayoutEmail(e.target.value)}
        />
        <button
          type="button"
          className="tap-target mt-4 h-12 w-full rounded-full bg-purple text-sm font-extrabold text-white"
          onClick={() => {
            setSheet(null);
            showToast("Payout email saved");
          }}
        >
          Save
        </button>
      </BottomSheet>

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
