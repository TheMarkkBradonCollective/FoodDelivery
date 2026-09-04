"use client";

import Link from "next/link";
import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";
import { useAppStore } from "@/store";
import { formatCurrency } from "@runr/shared/lib/utils";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, updateCartQuantity, placeOrder, cartBusinessId, businesses } =
    useAppStore();
  const router = useRouter();

  const business = businesses.find((b) => b.id === cartBusinessId);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = 2.99;
  const serviceFee = 1.5;
  const tax = subtotal * 0.0875;
  const tip = 5.0;
  const total = subtotal + deliveryFee + serviceFee + tax + tip;

  function handlePlaceOrder() {
    const order = placeOrder();
    if (order) router.push(`/orders/${order.id}`);
  }

  if (!cart.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <p className="text-[var(--muted)]">Your cart is empty</p>
        <Link href="/" className="mt-4 text-runr-primary">
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <Link href={`/restaurant/${cartBusinessId}`} className="flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to {business?.name}
      </Link>

      <h1 className="mt-4 text-2xl font-bold">Cart</h1>

      <div className="mt-6 space-y-4">
        {cart.map((item) => (
          <div
            key={item.menuItemId}
            className="flex items-center justify-between rounded-runr-lg border border-[var(--border)] p-4"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-[var(--muted)]">
                {formatCurrency(item.price)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateCartQuantity(item.menuItemId, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)]"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-4 text-center font-medium">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateCartQuantity(item.menuItemId, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-runr-primary text-white"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-2 rounded-runr-lg border border-[var(--border)] p-4 text-sm">
        <Row label="Subtotal" value={subtotal} />
        <Row label="Delivery fee" value={deliveryFee} />
        <Row label="Service fee" value={serviceFee} />
        <Row label="Tax" value={tax} />
        <Row label="Tip" value={tip} />
        <div className="border-t border-[var(--border)] pt-2">
          <Row label="Total" value={total} bold />
        </div>
      </div>

      <PrimaryButton className="mt-6 w-full" onClick={handlePlaceOrder}>
        Place Order
      </PrimaryButton>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-base" : ""}`}>
      <span className="text-[var(--muted)]">{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
