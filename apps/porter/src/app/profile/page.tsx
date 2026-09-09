"use client";

import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";
import { useAppStore } from "@/store";
import { Heart, LogOut, MapPin, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerProfilePage() {
  const { user, logout, orders, favoriteBusinessIds } = useAppStore();
  const router = useRouter();
  const live = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;

  return (
    <div className="min-h-screen">
      <div className="brand-hero brand-hero--flush px-5 pb-10 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-runr-accent-bright">PORTER</p>
        <h1 className="mt-1 text-2xl font-extrabold text-white">Profile</h1>
        <p className="mt-1 text-sm text-white/75">Get what you need. Track it in.</p>
      </div>
      <div className="px-4 pt-2">
        <div className="rounded-runr-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-runr-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-runr-accent-bright text-lg font-extrabold text-runr-ink">
            {user?.name?.charAt(0) ?? "P"}
          </div>
          <p className="mt-3 font-semibold">{user?.name}</p>
          <p className="text-sm text-[var(--muted)]">{user?.email}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <ProfileStat icon={ShoppingBag} label="Orders" value={String(orders.length)} href="/orders" />
          <ProfileStat icon={Heart} label="Saved" value={String(favoriteBusinessIds.length)} href="/favorites" />
          <ProfileStat icon={MapPin} label="Live" value={String(live)} href="/orders" />
        </div>

        <PrimaryButton
          className="mt-6 w-full"
          variant="secondary"
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

function ProfileStat({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-runr-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-runr-primary" />
      <p className="mt-1 text-lg font-extrabold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{label}</p>
    </Link>
  );
}
