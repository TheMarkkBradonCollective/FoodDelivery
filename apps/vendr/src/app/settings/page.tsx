"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, DollarSign, LogOut, Moon, Store, Sun, Tag, UtensilsCrossed } from "lucide-react";
import { SettingsRow, ToggleSwitch } from "@runr/shared/components/ui/SettingsRow";
import { ConfirmDialog } from "@runr/shared/components/ui/ConfirmDialog";
import { BottomSheet } from "@runr/shared/components/ui/BottomSheet";
import { JobLoop } from "@runr/shared/components/ui/JobLoop";
import { useAppStore } from "@/store";
import { selectVendorBusiness } from "@runr/shared/lib/utils";

export default function BusinessSettingsPage() {
  const { user, logout, businesses, theme, toggleTheme, updateBusinessHours, showToast } = useAppStore();
  const router = useRouter();
  const [confirmOut, setConfirmOut] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const kitchen = selectVendorBusiness(businesses, user?.id);
  const [hours, setHours] = useState(kitchen?.operatingHours ?? "");

  return (
    <div className="px-5 pb-8 pt-5 lg:mx-auto lg:max-w-xl">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">VENDR</p>
      <h1 className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">Settings</h1>
      <JobLoop app="vendr" className="mt-1" />

      <div className="surface-card mt-6 rounded-[28px] p-5">
        <p className="font-extrabold">{user?.name}</p>
        <p className="text-sm text-[var(--muted)]">{user?.email}</p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {kitchen?.name ?? "No business linked"} {kitchen?.city ? `· ${kitchen.city}` : ""}
        </p>
      </div>

      <div className="surface-card mt-6 space-y-1 rounded-[28px] p-3">
        <SettingsRow
          icon={<Store size={18} />}
          title="Operations"
          subtitle="Coverage, orders, and RUNRs"
          onClick={() => router.push("/")}
        />
        <SettingsRow
          icon={<UtensilsCrossed size={18} />}
          title="Catalog"
          subtitle="Products PORTER customers browse"
          onClick={() => router.push("/catalog")}
        />
        <SettingsRow
          icon={<Clock size={18} />}
          title="Hours"
          subtitle={kitchen?.operatingHours ?? "Set business hours"}
          onClick={() => {
            setHours(kitchen?.operatingHours ?? "");
            setHoursOpen(true);
          }}
        />
        <SettingsRow
          icon={<Tag size={18} />}
          title="Promotions"
          subtitle="RUNR5 and PORTER10 run on the network"
          onClick={() => showToast("Promos are live for PORTER checkout")}
        />
        <SettingsRow
          icon={<DollarSign size={18} />}
          title="Payouts"
          subtitle="Sales settle to this VENDR account"
          onClick={() => showToast("Payouts use the signed-in business account")}
        />
        <SettingsRow
          icon={theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          title="Dark mode"
          trailing={<ToggleSwitch on={theme === "dark"} onChange={() => toggleTheme()} label="Dark mode" />}
        />
      </div>

      <BottomSheet open={hoursOpen} onClose={() => setHoursOpen(false)} title="Business hours">
        <p className="text-sm text-[var(--muted)]">Shown on PORTER when customers open this business.</p>
        <input className="input-brand mt-4" value={hours} onChange={(e) => setHours(e.target.value)} />
        <button
          type="button"
          className="tap-target mt-4 h-12 w-full rounded-full bg-purple text-sm font-extrabold text-white"
          onClick={() => {
            if (kitchen) updateBusinessHours(kitchen.id, hours);
            setHoursOpen(false);
            showToast("Hours saved");
          }}
        >
          Save hours
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
        title="Sign out of VENDR?"
        description="You will need your business email and password to get back in."
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
