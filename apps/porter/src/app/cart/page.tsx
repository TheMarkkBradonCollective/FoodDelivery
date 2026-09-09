"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";
import { QuantityStepper } from "@runr/shared/components/ui/QuantityStepper";
import { IconButton } from "@runr/shared/components/ui/IconButton";
import { useAppStore } from "@/store";
import { formatCurrency } from "@runr/shared/lib/utils";
import { SegmentedControl } from "@runr/shared/components/ui/SegmentedControl";
import { PROMO_CODES } from "@runr/shared/data/constants";

export default function CartPage() {
  const {
    cart,
    updateCartQuantity,
    placeOrder,
    cartBusinessId,
    businesses,
    deliveryAddress,
    setDeliveryAddress,
  } = useAppStore();
  const router = useRouter();
  const [tip, setTip] = useState(5);
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [when, setWhen] = useState<"now" | "schedule">("now");
  const [scheduledFor, setScheduledFor] = useState("18:00");
  const [placing, setPlacing] = useState(false);

  const business = businesses.find((b) => b.id === cartBusinessId);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = fulfillment === "pickup" ? 0 : business?.deliveryFee ?? 2.99;
  const serviceFee = 1.5;
  const tax = subtotal * 0.0875;
  const promo = promoCode ? PROMO_CODES[promoCode] : null;
  const discount = promo
    ? promo.percent
      ? (subtotal * promo.amount) / 100
      : promo.amount
    : 0;
  const total = Math.max(0, subtotal + deliveryFee + serviceFee + tax + tip - discount);

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!PROMO_CODES[code]) {
      setPromoError("That code isn’t valid. Try RUNR5 or PORTER10.");
      setPromoCode(null);
      return;
    }
    setPromoError("");
    setPromoCode(code);
  }

  function handlePlaceOrder() {
    if (fulfillment === "delivery" && !deliveryAddress.trim()) return;
    setPlacing(true);
    const order = placeOrder({
      tip,
      address: fulfillment === "delivery" ? deliveryAddress.trim() : undefined,
      discount,
      fulfillment,
      scheduledFor: when === "schedule" ? scheduledFor : undefined,
    });
    setPlacing(false);
    if (order) router.push(`/track/?id=${order.id}`);
  }

  if (!cart.length) {
    return (
      <div className="px-5 py-10">
        <EmptyState
          title="Your cart is empty"
          description="Add items from Discover, then come back to choose delivery or pickup."
          action={
            <Link href="/" className="inline-flex h-11 items-center rounded-full bg-purple px-5 text-sm font-bold text-white">
              Discover businesses
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-5 pb-8 pt-4 lg:mx-auto lg:max-w-2xl lg:px-8">
      <div className="flex items-center gap-3">
        <IconButton href={cartBusinessId ? `/restaurant/?id=${cartBusinessId}` : "/"} label="Back">
          <ArrowLeft size={18} />
        </IconButton>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-purple">PORTER</p>
          <h1 className="text-[1.375rem] font-extrabold text-[var(--foreground)]">Cart</h1>
        </div>
      </div>

      <p className="mt-1 text-sm text-[var(--muted)]">{business?.name ?? "Business"}</p>

      <div className="mt-3 space-y-2">
        {cart.map((item) => (
          <div key={item.menuItemId} className="surface-card flex items-center justify-between gap-3 rounded-2xl p-3">
            <div className="min-w-0">
              <p className="truncate font-bold text-[var(--foreground)]">{item.name}</p>
              <p className="text-sm text-[var(--muted)]">{formatCurrency(item.price)}</p>
            </div>
            <QuantityStepper
              value={item.quantity}
              onChange={(next) => updateCartQuantity(item.menuItemId, next)}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-2xl bg-[var(--surface-elevated)] p-3.5 ring-1 ring-[var(--border)]">
        <p className="field-label">How you get it</p>
        <SegmentedControl
          size="sm"
          value={fulfillment}
          onChange={setFulfillment}
          options={[
            { value: "delivery", label: "Delivery" },
            { value: "pickup", label: "Pickup" },
          ]}
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          {fulfillment === "delivery"
            ? "A RUNR covering this VENDR brings it to you."
            : `Collect at ${business?.address ?? "the business"}. No RUNR needed.`}
        </p>

        <p className="field-label mt-3">When</p>
        <SegmentedControl
          size="sm"
          value={when}
          onChange={setWhen}
          options={[
            { value: "now", label: "Now" },
            { value: "schedule", label: "Schedule" },
          ]}
        />
        {when === "schedule" ? (
          <input
            type="time"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="input-brand mt-3"
          />
        ) : null}

        <p className="field-label mt-3">Tip · {formatCurrency(tip)}</p>
        <input
          type="range"
          min={0}
          max={8}
          step={1}
          value={tip}
          onChange={(e) => setTip(Number(e.target.value))}
          className="mt-1 h-6 w-full range-slider"
          aria-label="Tip amount"
        />
        <div className="flex justify-between text-[11px] text-[var(--muted)]">
          <span>None</span>
          <span>$8</span>
        </div>

        {fulfillment === "delivery" ? (
          <>
            <label className="field-label mt-3" htmlFor="delivery-address">
              Deliver to
            </label>
            <input
              id="delivery-address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="input-brand"
              placeholder="Street address"
              autoComplete="street-address"
            />
          </>
        ) : null}

        <p className="field-label mt-3">Promo code</p>
        <div className="flex items-center gap-2">
          <input
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            className="input-brand"
            placeholder="RUNR5"
            autoCapitalize="characters"
          />
          <button
            type="button"
            onClick={applyPromo}
            className="h-10 shrink-0 rounded-full bg-ink px-4 text-sm font-bold text-white"
          >
            Apply
          </button>
        </div>
        {promoError ? <p className="mt-2 text-sm text-red-600">{promoError}</p> : null}
        {promo ? (
          <p className="mt-2 text-sm font-semibold text-purple">
            {promoCode} applied — {promo.label}
          </p>
        ) : null}

        <div className="mt-3 space-y-1 text-sm">
          <Row label="Subtotal" value={subtotal} />
          {fulfillment === "delivery" ? <Row label="Delivery fee" value={deliveryFee} /> : null}
          <Row label="Service fee" value={serviceFee} />
          <Row label="Tax" value={tax} />
          {discount > 0 ? <Row label="Promo" value={-discount} /> : null}
        </div>
        <div className="mt-2.5 border-t border-[var(--border)] pt-2.5">
          <Row label="Total" value={total} bold />
        </div>
      </div>

      <div className="h-16 md:hidden" aria-hidden />
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={placing || (fulfillment === "delivery" && !deliveryAddress.trim())}
        className="sticky-cta h-11 w-full rounded-full bg-purple text-sm font-extrabold text-white disabled:opacity-50"
      >
        {placing ? "Placing order…" : `Place order · ${formatCurrency(total)}`}
      </button>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-extrabold" : "text-[var(--muted)]"}`}>
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
