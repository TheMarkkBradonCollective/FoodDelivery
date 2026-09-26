"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useAppStore } from "@/store";
import { StaffChat } from "@porter/shared/components/staff/StaffChat";
import {
  StaffAppsPanel,
  StaffCoveragePanel,
  StaffOrdersPanel,
  StaffUsersPanel,
} from "@porter/shared/components/staff/StaffOpsPanels";
import { getBusinessCoverageSummary } from "@porter/shared/lib/coverage-engine";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Smartphone,
  Users,
} from "lucide-react";

type StaffTab = "overview" | "orders" | "coverage" | "users" | "chat" | "apps";

export function StaffConsole() {
  const { session, logout } = useAuth();
  const [tab, setTab] = useState<StaffTab>("overview");
  const { businesses, orders } = useAppStore();

  const platformRuns = useMemo(
    () => businesses.flatMap((b) => b.scheduledRuns).filter((r) => r.status !== "cancelled"),
    [businesses]
  );
  const liveOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const gaps = businesses
    .map((b) => ({ business: b, coverage: getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns) }))
    .filter((x) => x.coverage.gap > 0);

  const tabs: { id: StaffTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: Package },
    { id: "coverage", label: "Coverage", icon: Building2 },
    { id: "users", label: "Users", icon: Users },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "apps", label: "Apps", icon: Smartphone },
  ];

  return (
    <div className="staff-portal min-h-[100dvh] bg-[#100814] text-[#F6F1E8]">
      <div className="border-b border-[#3D3550] bg-[#1A1224]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A0F878]">
              Staff Console
            </p>
            <h1 className="text-lg font-bold">Manage the marketplace</h1>
            <p className="text-xs text-zinc-400">{session!.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/download" className="text-sm text-zinc-400 hover:text-white">
              Downloads
            </Link>
            <Link href="/" className="text-sm text-zinc-400 hover:text-white">
              Public site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-[#3D3550] px-3 py-2 text-sm hover:bg-[#2A1B3D]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="mb-4 text-sm text-zinc-400">
          Same tools as Porter Command. Only staff accounts can work here.
        </p>
        <nav className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === id ? "bg-[#7048F8] text-white" : "bg-[#1A1224] text-zinc-400 hover:text-white"
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
                <Stat label="Businesses" value={String(businesses.length)} />
                <Stat label="Live orders" value={String(liveOrders.length)} />
                <Stat label="Scheduled RUNs" value={String(platformRuns.length)} />
                <Stat label="Coverage gaps" value={String(gaps.length)} alert={gaps.length > 0} />
              </div>
              <Panel title="Needs attention">
                {gaps.length === 0 && liveOrders.length === 0 ? (
                  <p className="text-sm text-zinc-400">Marketplace is clear. No gaps or live orders.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {gaps.map(({ business, coverage }) => (
                      <li key={business.id}>
                        <button type="button" className="text-[#A0F878] hover:underline" onClick={() => setTab("coverage")}>
                          {business.name} needs {coverage.gap} Runner{coverage.gap === 1 ? "" : "s"}
                        </button>
                      </li>
                    ))}
                    {liveOrders.slice(0, 6).map((order) => (
                      <li key={order.id}>
                        <button type="button" className="text-[#A0F878] hover:underline" onClick={() => setTab("orders")}>
                          Order #{order.id.slice(-6)} · {order.status.replace(/_/g, " ")}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          )}

          {tab === "orders" && (
            <Panel title="Order operations">
              <p className="mb-4 text-sm text-zinc-400">Advance or cancel marketplace orders. Same actions as Porter Command on phone.</p>
              <StaffOrdersPanel />
            </Panel>
          )}

          {tab === "coverage" && (
            <Panel title="Coverage capacity">
              <p className="mb-4 text-sm text-zinc-400">Raise or lower Runner slots per vendor. Writes to the live marketplace.</p>
              <StaffCoveragePanel />
            </Panel>
          )}

          {tab === "users" && (
            <Panel title="Marketplace users">
              <p className="mb-4 text-sm text-zinc-400">Directory for support. Role changes stay in Supabase for now.</p>
              <StaffUsersPanel />
            </Panel>
          )}

          {tab === "chat" && (
            <Panel title="Staff status chat">
              <p className="mb-4 text-sm text-zinc-400">Shared with Porter Command.</p>
              <StaffChat />
            </Panel>
          )}

          {tab === "apps" && (
            <Panel title="App packages">
              <p className="mb-4 text-sm text-zinc-400">Users install from the public download page.</p>
              <StaffAppsPanel downloadHref="/download" />
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        alert ? "border-orange-500/30 bg-[#7048F8]/20" : "border-[#3D3550] bg-[#1A1224]"
      }`}
    >
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[#3D3550] bg-[#1A1224]/60 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
