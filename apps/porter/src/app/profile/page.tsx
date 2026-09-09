"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, MapPin, Moon, ShoppingBag, Sun } from "lucide-react";
import { SettingsRow, ToggleSwitch } from "@runr/shared/components/ui/SettingsRow";
import { ConfirmDialog } from "@runr/shared/components/ui/ConfirmDialog";
import { useAppStore } from "@/store";

export default function CustomerProfilePage() {
  const {
    user,
    logout,
    orders,
    favoriteBusinessIds,
    theme,
    toggleTheme,
    deliveryAddress,
  } = useAppStore();
  const router = useRouter();
  const [confirmOut, setConfirmOut] = useState(false);
  const live = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;

  return (
    <div className="px-5 pb-8 pt-5 lg:mx-auto lg:max-w-xl lg:px-8">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">PORTER</p>
      <h1 className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">Profile</h1>

      <div className="surface-card mt-6 flex items-center gap-4 rounded-[28px] p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-xl font-extrabold text-ink">
          {user?.name?.charAt(0) ?? "P"}
        </div>
        <div className="min-w-0">
          <p className="truncate font-extrabold text-[var(--foreground)]">{user?.name}</p>
          <p className="truncate text-sm text-[var(--muted)]">{user?.email}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Link href="/orders" className="surface-card rounded-[20px] p-3 text-center">
          <p className="text-lg font-extrabold">{orders.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Orders</p>
        </Link>
        <Link href="/favorites" className="surface-card rounded-[20px] p-3 text-center">
          <p className="text-lg font-extrabold">{favoriteBusinessIds.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Saved</p>
        </Link>
        <Link href="/orders" className="surface-card rounded-[20px] p-3 text-center">
          <p className="text-lg font-extrabold">{live}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Live</p>
        </Link>
      </div>

      <div className="surface-card mt-6 space-y-1 rounded-[28px] p-3">
        <SettingsRow
          icon={<ShoppingBag size={18} />}
          iconClassName="bg-purple/10 text-purple"
          title="Orders"
          subtitle="Track and receive"
          onClick={() => router.push("/orders")}
        />
        <SettingsRow
          icon={<Heart size={18} />}
          iconClassName="bg-lime/50 text-ink"
          title="Favorites"
          subtitle="Kitchens you saved"
          onClick={() => router.push("/favorites")}
        />
        <SettingsRow
          icon={<MapPin size={18} />}
          iconClassName="bg-[var(--background)] text-purple"
          title="Delivery address"
          subtitle={deliveryAddress}
          onClick={() => router.push("/cart")}
        />
        <SettingsRow
          icon={theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          iconClassName="bg-[var(--background)] text-[var(--foreground)]"
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
        title="Sign out of PORTER?"
        description="You will need your email and password to get back in. Your cart on this device is saved."
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
