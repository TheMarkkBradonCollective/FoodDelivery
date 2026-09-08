"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAppStore } from "@/store";
import { getBusinessCoverageSummary } from "@runr/shared/lib/coverage-engine";
import { formatCurrency } from "@runr/shared/lib/utils";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Smartphone,
  Users,
} from "lucide-react";

type StaffTab = "overview" | "apps" | "users" | "businesses" | "orders";

export default function StaffPage() {
  return (
    <ProtectedRoute roles={["staff"]}>
      <StaffPortal />
    </ProtectedRoute>
  );
}

function StaffPortal() {
  const { session, logout } = useAuth();
  const [tab, setTab] = useState<StaffTab>("overview");
  const { businesses, orders, scheduledRuns, runHistory, earnings } = useAppStore();

  const tabs: { id: StaffTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "apps", label: "Apps", icon: Smartphone },
    { id: "users", label: "Users", icon: Users },
    { id: "businesses", label: "Businesses", icon: Building2 },
    { id: "orders", label: "Orders", icon: Package },
  ];

  const totalGaps = businesses.filter((b) => {
    const c = getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns);
    return c.gap > 0;
  }).length;

  return (
    <div className="min-h-[80vh] bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0066FF]">
              Staff Portal
            </p>
            <h1 className="text-lg font-bold">Platform Management</h1>
            <p className="text-xs text-zinc-400">{session!.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-zinc-400 hover:text-white"
            >
              Public site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <nav className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === id
                  ? "bg-[#0066FF] text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AdminStat label="Businesses" value={String(businesses.length)} />
                <AdminStat label="Orders" value={String(orders.length)} />
                <AdminStat label="Active RUNs" value={String(scheduledRuns.length)} />
                <AdminStat label="Coverage gaps" value={String(totalGaps)} alert={totalGaps > 0} />
              </div>
              <Panel title="Platform Status">
                <p className="text-sm text-zinc-400">
                  All three apps — PORTER, RUNR, VENDR — connect to this marketplace.
                  Manage users, businesses, and operations from this portal.
                </p>
              </Panel>
            </div>
          )}

          {tab === "apps" && (
            <Panel title="Mobile App Management">
              <p className="mb-4 text-sm text-zinc-400">
                Configure and monitor the three marketplace apps.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { name: "PORTER", pkg: "com.runr.porter", color: "border-[#0066FF]/30", status: "Live" },
                  { name: "RUNR", pkg: "com.runr.runr", color: "border-[#0066FF]/30", status: "Live" },
                  { name: "VENDR", pkg: "com.runr.vendr", color: "border-[#0066FF]/30", status: "Live" },
                ].map((app) => (
                  <div
                    key={app.name}
                    className={`rounded-xl border ${app.color} bg-zinc-900 p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">{app.name}</h3>
                      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                        {app.status}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-xs text-zinc-500">{app.pkg}</p>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href="/#apps"
                        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs hover:bg-zinc-700"
                      >
                        APK downloads
                      </Link>
                      <button
                        type="button"
                        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs hover:bg-zinc-700"
                      >
                        <Settings className="inline h-3 w-3" /> Config
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {tab === "users" && (
            <Panel title="Marketplace Users">
              <p className="text-sm text-zinc-500">
                User management will load from Supabase profiles once connected.
              </p>
            </Panel>
          )}

          {tab === "businesses" && (
            <Panel title="Businesses on Marketplace">
              <div className="space-y-3">
                {businesses.map((b) => {
                  const c = getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns);
                  return (
                    <div
                      key={b.id}
                      className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold">{b.name}</p>
                        <p className="text-xs text-zinc-500">
                          {b.cuisine} · {b.city} · ★ {b.rating}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          RUNRs: {c.scheduledRunrs}/{c.maxRunrs}
                        </span>
                        {c.gap > 0 ? (
                          <span className="text-orange-400">{c.gap} gap</span>
                        ) : (
                          <span className="text-green-400">Full</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === "orders" && (
            <Panel title="All Marketplace Orders">
              {orders.length === 0 ? (
                <p className="text-sm text-zinc-500">No orders.</p>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => {
                    const biz = businesses.find((b) => b.id === order.businessId);
                    return (
                      <div
                        key={order.id}
                        className="flex justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm"
                      >
                        <span>
                          #{order.id.slice(-6)} · {biz?.name} · {order.status}
                        </span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="mt-4 text-xs text-zinc-500">
                Completed RUNs: {runHistory.length} · Total RUNR earnings tracked:{" "}
                {formatCurrency(earnings.reduce((s, e) => s + e.total, 0))}
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminStat({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        alert ? "border-orange-500/30 bg-blue-500/10" : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
