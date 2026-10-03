"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, Building2, DollarSign, List, LogOut, Map, Moon, ShieldCheck, Sun } from "lucide-react";
import { SettingsRow, ToggleSwitch } from "@porter/shared/components/ui/SettingsRow";
import { ConfirmDialog } from "@porter/shared/components/ui/ConfirmDialog";
import { BottomSheet } from "@porter/shared/components/ui/BottomSheet";
import { JobLoop } from "@porter/shared/components/ui/JobLoop";
import { SegmentedControl } from "@porter/shared/components/ui/SegmentedControl";
import { useAppStore } from "@/store";
import { AccessPreferencePicker } from "@porter/shared/components/ui/BuildingAccessPicker";
import { runnerAccessLabel } from "@porter/shared/lib/delivery-access";

export default function RunrProfilePage() {
  const { user, theme, toggleTheme, logout, earnings, runHistory, showToast, setAccessPreference } =
    useAppStore();
  const router = useRouter();
  const [confirmOut, setConfirmOut] = useState(false);
  const [sheet, setSheet] = useState<"vehicle" | "payout" | "access" | null>(null);
  const [vehicle, setVehicle] = useState<"Bike" | "Scooter" | "Car">("Bike");
  const [payoutEmail, setPayoutEmail] = useState(user?.email ?? "");

  const completedDeliveries = earnings.length;
  const reliability = runHistory.length === 0 ? "—" : `${Math.min(99, 90 + runHistory.length)}%`;

  return (
    <div className="px-5 pb-8 pt-4 lg:mx-auto lg:max-w-xl">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">Portr Runner</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold text-[var(--foreground)]">Profile</h1>
      <JobLoop app="runr" className="mt-1" />

      <div className="surface-card mt-5 flex items-center gap-3 rounded-2xl p-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple text-lg font-extrabold text-white">
          {user?.name?.charAt(0) ?? "R"}
        </div>
        <div className="min-w-0">
          <p className="truncate font-extrabold">{user?.name}</p>
          <p className="truncate text-sm text-[var(--muted)]">{user?.email}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="surface-card rounded-2xl p-2.5 text-center">
          <p className="text-lg font-extrabold">{runHistory.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">RUNs</p>
        </div>
        <div className="surface-card rounded-2xl p-2.5 text-center">
          <p className="text-lg font-extrabold">{completedDeliveries}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Drops</p>
        </div>
        <div className="surface-card rounded-2xl p-2.5 text-center">
          <p className="text-lg font-extrabold">{reliability}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Reliability</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {completedDeliveries} completed drops on the marketplace.
      </p>

      <div className="surface-card mt-4 space-y-0.5 rounded-2xl p-2">
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
          icon={<Building2 size={18} />}
          title="Access preferences"
          subtitle={user?.accessPreference ? runnerAccessLabel(user.accessPreference) : "Choose elevators, stairs, or both"}
          onClick={() => setSheet("access")}
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

      <BottomSheet open={sheet === "access"} onClose={() => setSheet(null)} title="Access preferences">
        <AccessPreferencePicker
          value={user?.accessPreference ?? null}
          onChange={(preference) => {
            setAccessPreference(preference);
            setSheet(null);
          }}
        />
      </BottomSheet>

      <BottomSheet open={sheet === "vehicle"} onClose={() => setSheet(null)} title="Vehicle">
        <p className="text-sm text-[var(--muted)]">Used when you navigate to pickup and drop-off.</p>
        <div className="mt-4">
          <SegmentedControl
            value={vehicle}
            onChange={setVehicle}
            options={[
              { value: "Bike", label: "Bike" },
              { value: "Scooter", label: "Scooter" },
              { value: "Car", label: "Car" },
            ]}
          />
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
        title="Sign out of Portr Runner?"
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
