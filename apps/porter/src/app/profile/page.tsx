"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CreditCard, Heart, LifeBuoy, LogOut, MapPin, Moon, ShoppingBag, Sun } from "lucide-react";
import { SettingsRow, ToggleSwitch } from "@porter/shared/components/ui/SettingsRow";
import { ConfirmDialog } from "@porter/shared/components/ui/ConfirmDialog";
import { BottomSheet } from "@porter/shared/components/ui/BottomSheet";
import { JobLoop } from "@porter/shared/components/ui/JobLoop";
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
    setDeliveryAddress,
    showToast,
  } = useAppStore();
  const router = useRouter();
  const [confirmOut, setConfirmOut] = useState(false);
  const [sheet, setSheet] = useState<"address" | "pay" | "notify" | "support" | null>(null);
  const [addressDraft, setAddressDraft] = useState(deliveryAddress);
  const [cardLabel, setCardLabel] = useState("Visa ••4242");
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [notifyLive, setNotifyLive] = useState(true);
  const live = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;

  return (
    <div className="px-5 pb-8 pt-4 lg:mx-auto lg:max-w-xl lg:px-8">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">Porter</p>
      <h1 className="mt-0.5 text-[1.375rem] font-extrabold text-[var(--foreground)]">Profile</h1>
      <JobLoop app="porter" className="mt-1" />

      <div className="surface-card mt-5 flex items-center gap-3 rounded-2xl p-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-lg font-extrabold text-ink">
          {user?.name?.charAt(0) ?? "P"}
        </div>
        <div className="min-w-0">
          <p className="truncate font-extrabold text-[var(--foreground)]">{user?.name}</p>
          <p className="truncate text-sm text-[var(--muted)]">{user?.email}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Link href="/orders" className="surface-card rounded-2xl p-2.5 text-center">
          <p className="text-lg font-extrabold">{orders.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Orders</p>
        </Link>
        <Link href="/favorites" className="surface-card rounded-2xl p-2.5 text-center">
          <p className="text-lg font-extrabold">{favoriteBusinessIds.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Saved</p>
        </Link>
        <Link href="/orders" className="surface-card rounded-2xl p-2.5 text-center">
          <p className="text-lg font-extrabold">{live}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Live</p>
        </Link>
      </div>

      <div className="surface-card mt-4 space-y-0.5 rounded-2xl p-2">
        <SettingsRow
          icon={<ShoppingBag size={18} />}
          iconClassName="bg-purple/10 text-purple"
          title="Orders & receipts"
          subtitle="Track, receive, reorder"
          onClick={() => router.push("/orders")}
        />
        <SettingsRow
          icon={<Heart size={18} />}
          iconClassName="bg-lime/50 text-ink"
          title="Favorite businesses"
          subtitle="Saved for faster reordering"
          onClick={() => router.push("/favorites")}
        />
        <SettingsRow
          icon={<MapPin size={18} />}
          iconClassName="bg-[var(--background)] text-purple"
          title="Addresses"
          subtitle={deliveryAddress}
          onClick={() => {
            setAddressDraft(deliveryAddress);
            setSheet("address");
          }}
        />
        <SettingsRow
          icon={<CreditCard size={18} />}
          title="Payment methods"
          subtitle={cardLabel}
          onClick={() => setSheet("pay")}
        />
        <SettingsRow
          icon={<Bell size={18} />}
          title="Notifications"
          subtitle={notifyOffers || notifyLive ? "Offers and live order updates" : "Off"}
          onClick={() => setSheet("notify")}
        />
        <SettingsRow
          icon={<LifeBuoy size={18} />}
          title="Support & refunds"
          subtitle="Help on an order in this marketplace"
          onClick={() => setSheet("support")}
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

      <BottomSheet open={sheet === "address"} onClose={() => setSheet(null)} title="Saved address">
        <p className="text-sm text-[var(--muted)]">Used for Porter delivery. Pickup orders use the business address.</p>
        <input
          className="input-brand mt-4"
          value={addressDraft}
          onChange={(e) => setAddressDraft(e.target.value)}
        />
        <button
          type="button"
          className="tap-target mt-4 h-12 w-full rounded-full bg-purple text-sm font-extrabold text-white"
          onClick={() => {
            setDeliveryAddress(addressDraft.trim() || deliveryAddress);
            setSheet(null);
            showToast("Address saved");
          }}
        >
          Save address
        </button>
      </BottomSheet>

      <BottomSheet open={sheet === "pay"} onClose={() => setSheet(null)} title="Payment methods">
        <p className="text-sm text-[var(--muted)]">
          Checkout uses a card on this device. Live card capture stays on the processor — this label is what you see at Place order.
        </p>
        <input
          className="input-brand mt-4"
          value={cardLabel}
          onChange={(e) => setCardLabel(e.target.value)}
        />
        <button
          type="button"
          className="tap-target mt-4 h-12 w-full rounded-full bg-purple text-sm font-extrabold text-white"
          onClick={() => {
            setSheet(null);
            showToast("Payment method saved");
          }}
        >
          Save
        </button>
      </BottomSheet>

      <BottomSheet open={sheet === "notify"} onClose={() => setSheet(null)} title="Notifications">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Promotions</p>
            <ToggleSwitch on={notifyOffers} onChange={setNotifyOffers} label="Promotions" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Live order & Runner updates</p>
            <ToggleSwitch on={notifyLive} onChange={setNotifyLive} label="Live order updates" />
          </div>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "support"} onClose={() => setSheet(null)} title="Support & refunds">
        <p className="text-sm text-[var(--muted)]">
          Pick a recent order. Staff sees the request on the same marketplace — this does not invent a refund.
        </p>
        <div className="mt-4 space-y-2">
          {orders.slice(0, 6).length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Place an order first, then you can request help here.</p>
          ) : (
            orders.slice(0, 6).map((order) => (
              <button
                key={order.id}
                type="button"
                className="tap-target flex h-12 w-full items-center justify-between rounded-2xl bg-[var(--background)] px-4 text-sm font-bold"
                onClick={() => {
                  showToast(`Support requested for #${order.id.slice(-4)}`);
                  setSheet(null);
                }}
              >
                <span>Order #{order.id.slice(-4)}</span>
                <span className="uppercase text-[var(--muted)]">{order.status.replace("_", " ")}</span>
              </button>
            ))
          )}
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={confirmOut}
        title="Sign out of Porter?"
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
