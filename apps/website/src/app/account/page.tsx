"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAppStore } from "@/store";
import { getAppForRole, getRoleLabel } from "@runr/shared/lib/auth";
import { formatCurrency, formatTimeRange } from "@runr/shared/lib/utils";
import { getBusinessCoverageSummary } from "@runr/shared/lib/coverage-engine";
import {
  Download,
  Heart,
  List,
  LogOut,
  MapPin,
  Package,
  Star,
  Truck,
} from "lucide-react";

export default function AccountPage() {
  return (
    <ProtectedRoute roles={["customer", "runr", "business"]}>
      <AccountContent />
    </ProtectedRoute>
  );
}

function AccountContent() {
  const { session, logout } = useAuth();
  const user = session!.user;

  return (
    <div className="min-h-[80vh] bg-[var(--surface)] py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#ff4f00]">
              {getAppForRole(user.role)} Account
            </p>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-[var(--muted)]">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-[var(--border)] bg-white p-4">
          <p className="text-sm">
            <span className="text-[var(--muted)]">Account type:</span>{" "}
            <strong>{getRoleLabel(user.role)}</strong>
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            This is your unified RUNR account. The same login works on the website and in
            your {getAppForRole(user.role)} mobile app.
          </p>
        </div>

        {user.role === "customer" && <CustomerDashboard />}
        {user.role === "runr" && <RunrDashboard />}
        {user.role === "business" && <BusinessDashboard />}

        <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold">Your App</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Download {getAppForRole(user.role)} for the full mobile experience.
          </p>
          <Link
            href="/#apps"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#ff4f00] hover:underline"
          >
            <Download className="h-4 w-4" />
            Get the app
          </Link>
        </div>
      </div>
    </div>
  );
}

function CustomerDashboard() {
  const { orders, favoriteBusinessIds, businesses } = useAppStore();

  return (
    <div className="mt-8 space-y-6">
      <Section title="Recent Orders" icon={Package}>
        {orders.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => {
              const biz = businesses.find((b) => b.id === order.businessId);
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3"
                >
                  <div>
                    <p className="font-medium">{biz?.name ?? "Business"}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {order.items.length} items · {order.status.replace("_", " ")}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(order.total)}</p>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Favorite Businesses" icon={Heart}>
        <p className="text-sm text-[var(--muted)]">
          {favoriteBusinessIds.length} saved — synced with PORTER app
        </p>
      </Section>
    </div>
  );
}

function RunrDashboard() {
  const { scheduledRuns, runHistory, earnings, activeRun, businesses } = useAppStore();
  const totalEarnings = earnings.reduce((s, e) => s + e.total, 0);

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total earnings" value={formatCurrency(totalEarnings)} />
        <StatCard label="Deliveries" value={String(earnings.length)} />
        <StatCard label="Rating" value="—" />
      </div>

      {activeRun && (
        <Section title="Active RUN" icon={Truck}>
          <p className="font-medium">
            {businesses.find((b) => b.id === activeRun.businessId)?.name}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {formatTimeRange(activeRun.startTime, activeRun.endTime)} · {activeRun.status}
          </p>
        </Section>
      )}

      <Section title="Upcoming RUNs" icon={List}>
        {scheduledRuns.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No scheduled RUNs.</p>
        ) : (
          scheduledRuns.map((run) => (
            <div key={run.id} className="mt-2 rounded-lg border border-[var(--border)] p-3">
              <p className="font-medium">
                {businesses.find((b) => b.id === run.businessId)?.name}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {formatTimeRange(run.startTime, run.endTime)}
              </p>
            </div>
          ))
        )}
      </Section>

      <Section title="RUN History" icon={Star}>
        {runHistory.slice(0, 3).map((run) => (
          <div key={run.id} className="mt-2 flex justify-between text-sm">
            <span>{businesses.find((b) => b.id === run.businessId)?.name}</span>
            <span>{formatCurrency(run.earnings ?? 0)}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

function BusinessDashboard() {
  const { businesses, orders } = useAppStore();
  const business = businesses[0];

  if (!business) {
    return (
      <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-6">
        <p className="text-sm text-[var(--muted)]">
          No business linked yet. Connect your VENDR account via Supabase to see operations here.
        </p>
      </div>
    );
  }

  const coverage = getBusinessCoverageSummary(
    business.coverageRules,
    business.scheduledRuns
  );
  const bizOrders = orders.filter((o) => o.businessId === business.id);

  return (
    <div className="mt-8 space-y-6">
      <Section title={business.name} icon={MapPin}>
        <p className="text-sm text-[var(--muted)]">{business.address}, {business.city}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatCard label="RUNRs covered" value={`${coverage.scheduledRunrs}/${coverage.maxRunrs}`} />
          <StatCard label="Active orders" value={String(bizOrders.length)} />
          <StatCard label="Rating" value={String(business.rating)} />
        </div>
        {coverage.gap > 0 && (
          <p className="mt-3 text-sm font-semibold text-orange-600">
            {coverage.gap} RUNR gap — manage coverage in VENDR app or staff portal
          </p>
        )}
      </Section>

      <Section title="Recent PORTER Orders" icon={Package}>
        {bizOrders.slice(0, 5).map((order) => (
          <div key={order.id} className="mt-2 flex justify-between rounded-lg border border-[var(--border)] p-3 text-sm">
            <span>Order #{order.id.slice(-4)} · {order.status}</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Package;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-6">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--muted)]" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface)] p-4">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
