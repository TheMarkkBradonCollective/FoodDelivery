"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Moon, Store, Sun } from "lucide-react";
import { SettingsRow, ToggleSwitch } from "@runr/shared/components/ui/SettingsRow";
import { ConfirmDialog } from "@runr/shared/components/ui/ConfirmDialog";
import { useAppStore } from "@/store";
import { selectVendorBusiness } from "@runr/shared/lib/utils";

export default function BusinessSettingsPage() {
  const { user, logout, businesses, theme, toggleTheme } = useAppStore();
  const router = useRouter();
  const [confirmOut, setConfirmOut] = useState(false);
  const kitchen = selectVendorBusiness(businesses, user?.id);

  return (
    <div className="px-5 pb-8 pt-5 lg:mx-auto lg:max-w-xl">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">VENDR</p>
      <h1 className="mt-1 text-2xl font-extrabold text-ink">Settings</h1>

      <div className="mt-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-ink/8">
        <p className="font-extrabold">{user?.name}</p>
        <p className="text-sm text-ink/50">{user?.email}</p>
        <p className="mt-3 text-sm text-ink/70">
          {kitchen?.name ?? "No kitchen linked"} {kitchen?.city ? `· ${kitchen.city}` : ""}
        </p>
      </div>

      <div className="mt-6 space-y-1 rounded-[28px] bg-white p-3 shadow-sm ring-1 ring-ink/8">
        <SettingsRow
          icon={<Store size={18} />}
          title="Operations"
          subtitle="Coverage and live orders"
          onClick={() => router.push("/")}
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
        className="tap-target mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cream text-sm font-bold text-ink"
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
