"use client";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAppStore } from "@/store/app-store";
import { Map, Moon, Sun, Truck, Store, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { loginAs, theme, toggleTheme, user } = useAppStore();
  const router = useRouter();

  if (user) {
    router.replace(`/${user.role}`);
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-runr-primary/10 via-transparent to-runr-navigation/10" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-runr-md bg-runr-primary text-lg font-black text-white">
            R
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-[var(--foreground)]">RUNR</p>
            <p className="text-xs text-[var(--muted)]">Pick Your Place. Run Your Time.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-[var(--border)] p-2.5"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Restaurant-Based
            <br />
            <span className="text-runr-primary">Delivery Workforce</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--muted)]">
            Choose your business. Choose your time. Get paid per delivery.
            Coverage-driven, not order-driven.
          </p>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          <RoleCard
            icon={User}
            title="Customer"
            description="Discover restaurants, order food, track deliveries."
            onClick={() => {
              loginAs("customer");
              router.push("/customer");
            }}
          />
          <RoleCard
            icon={Truck}
            title="RUNR"
            description="Find businesses, choose your RUN, deliver and earn."
            highlight
            onClick={() => {
              loginAs("runr");
              router.push("/runr");
            }}
          />
          <RoleCard
            icon={Store}
            title="Business"
            description="Manage orders, coverage, and live delivery operations."
            onClick={() => {
              loginAs("business");
              router.push("/business");
            }}
          />
        </section>

        <section className="mt-16 rounded-runr-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-runr-card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-runr-lg bg-runr-primary-muted">
              <Map className="h-6 w-6 text-runr-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Map-First Architecture</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                RUNRs discover work on the map. Businesses monitor coverage in real time.
                Customers track deliveries live. Built around the RUN model — not traditional
                order-hunting.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  description,
  highlight,
  onClick,
}: {
  icon: typeof User;
  title: string;
  description: string;
  highlight?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`rounded-runr-xl border p-6 shadow-runr-card ${
        highlight
          ? "border-runr-primary/30 bg-runr-primary-muted"
          : "border-[var(--border)] bg-[var(--surface-elevated)]"
      }`}
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-runr-lg ${
          highlight ? "bg-runr-primary text-white" : "bg-runr-neutral-100 dark:bg-runr-neutral-800"
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
      <PrimaryButton
        className="mt-4 w-full"
        variant={highlight ? "primary" : "secondary"}
        onClick={onClick}
      >
        Continue as {title}
      </PrimaryButton>
    </div>
  );
}
