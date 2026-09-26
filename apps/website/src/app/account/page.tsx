"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAppStore } from "@/store";
import { getAppForRole, getRoleLabel } from "@porter/shared/lib/auth";
import { formatCurrency, formatTimeRange, selectVendorBusiness } from "@porter/shared/lib/utils";
import { getBusinessCoverageSummary } from "@porter/shared/lib/coverage-engine";
import {
  Bell,
  CreditCard,
  Download,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  Star,
  User,
} from "lucide-react";

type AccountTab = "profile" | "billing" | "preferences" | "ratings";

const TABS: { id: AccountTab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "preferences", label: "Preferences", icon: Settings },
  { id: "ratings", label: "Ratings", icon: Star },
];

function loadPref(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

export default function AccountPage() {
  return (
    <ProtectedRoute roles={["customer", "runr", "business"]}>
      <AccountHub />
    </ProtectedRoute>
  );
}

function AccountHub() {
  const { session, logout } = useAuth();
  const user = session!.user;
  const appName = getAppForRole(user.role);
  const [tab, setTab] = useState<AccountTab>("profile");
  const toast = useAppStore((s) => s.toast);

  return (
    <div className="min-h-[80vh] bg-[var(--surface)] py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7048F8]">
              {appName} Account
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
            This site is for billing, profile, preferences, and ratings. Day-to-day work stays in
            the {appName} app. Only Porter Command users can run marketplace ops from the website.
          </p>
        </div>

        {toast && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{toast.message}</p>
        )}

        <nav className="mt-6 flex flex-wrap gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                tab === id ? "bg-[#7048F8] text-white" : "bg-white text-[var(--muted)] ring-1 ring-[var(--border)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {tab === "profile" && <ProfilePanel />}
          {tab === "billing" && <BillingPanel />}
          {tab === "preferences" && <PreferencesPanel />}
          {tab === "ratings" && <RatingsPanel />}
        </div>

        <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-6">
          <h2 className="font-semibold">Your App</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Download {appName} for ordering, RUNs, or vendor ops.
          </p>
          <Link
            href="/download"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7048F8] hover:underline"
          >
            <Download className="h-4 w-4" />
            Get the app
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel() {
  const { session } = useAuth();
  const user = session!.user;
  const { orders, favoriteBusinessIds, scheduledRuns, runHistory, businesses } = useAppStore();
  const kitchen = selectVendorBusiness(businesses, user.id);

  return (
    <div className="space-y-6">
      <Section title="Profile" icon={User}>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[var(--muted)]">Name</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--muted)]">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--muted)]">Role</dt>
            <dd className="font-medium">{getRoleLabel(user.role)}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--muted)]">App</dt>
            <dd className="font-medium">{getAppForRole(user.role)}</dd>
          </div>
        </dl>
      </Section>

      {user.role === "customer" && (
        <>
          <Section title="Recent orders" icon={Package}>
            {orders.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No orders yet. Place them in Porter.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 6).map((order) => {
                  const biz = businesses.find((b) => b.id === order.businessId);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3"
                    >
                      <div>
                        <p className="font-medium">{biz?.name ?? "Business"}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {order.items.length} items · {order.status.replace(/_/g, " ")}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(order.total)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
          <Section title="Saved businesses" icon={Heart}>
            <p className="text-sm text-[var(--muted)]">
              {favoriteBusinessIds.length} saved — synced with Porter
            </p>
          </Section>
        </>
      )}

      {user.role === "runr" && (
        <Section title="RUN activity" icon={Package}>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Completed RUNs" value={String(runHistory.length)} />
            <StatCard label="Upcoming" value={String(scheduledRuns.length)} />
            <StatCard label="Next window" value={scheduledRuns[0] ? formatTimeRange(scheduledRuns[0].startTime, scheduledRuns[0].endTime) : "—"} />
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">Cover windows and accept drops in the Runner app.</p>
        </Section>
      )}

      {user.role === "business" && kitchen && (
        <Section title={kitchen.name} icon={MapPin}>
          <p className="text-sm text-[var(--muted)]">
            {kitchen.address}, {kitchen.city}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Hours {kitchen.operatingHours || "not set"}. Catalog, orders, and coverage are managed in Porter Vendor.
          </p>
        </Section>
      )}
    </div>
  );
}

function BillingPanel() {
  const { session } = useAuth();
  const user = session!.user;
  const { deliveryAddress, setDeliveryAddress, earnings, showToast } = useAppStore();
  const [cardLabel, setCardLabel] = useState("Visa ••4242");
  const [payoutEmail, setPayoutEmail] = useState(user.email);
  const [addressDraft, setAddressDraft] = useState(deliveryAddress);
  const totalEarnings = earnings.reduce((s, e) => s + e.total, 0);

  useEffect(() => {
    setCardLabel(loadPref("porter-web-card-label", "Visa ••4242"));
    setPayoutEmail(loadPref("porter-web-payout-email", user.email));
  }, [user.email]);

  return (
    <div className="space-y-6">
      {user.role === "customer" && (
        <>
          <Section title="Payment method" icon={CreditCard}>
            <p className="text-sm text-[var(--muted)]">
              Label shown at checkout in Porter. Live card capture stays on the processor.
            </p>
            <input
              className="mt-3 w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[#7048F8]"
              value={cardLabel}
              onChange={(e) => setCardLabel(e.target.value)}
            />
            <button
              type="button"
              className="mt-3 rounded-full bg-[#7048F8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5C36E0]"
              onClick={() => {
                window.localStorage.setItem("porter-web-card-label", cardLabel);
                showToast("Payment method saved");
              }}
            >
              Save card label
            </button>
          </Section>
          <Section title="Delivery address" icon={MapPin}>
            <input
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[#7048F8]"
              value={addressDraft}
              onChange={(e) => setAddressDraft(e.target.value)}
            />
            <button
              type="button"
              className="mt-3 rounded-full bg-[#7048F8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5C36E0]"
              onClick={() => {
                setDeliveryAddress(addressDraft.trim() || deliveryAddress);
                showToast("Address saved");
              }}
            >
              Save address
            </button>
          </Section>
        </>
      )}

      {user.role === "runr" && (
        <>
          <Section title="Payouts" icon={CreditCard}>
            <p className="text-sm text-[var(--muted)]">
              Where completed delivery pay and tips are sent. Lifetime earned {formatCurrency(totalEarnings)}.
            </p>
            <input
              type="email"
              className="mt-3 w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:border-[#7048F8]"
              value={payoutEmail}
              onChange={(e) => setPayoutEmail(e.target.value)}
            />
            <button
              type="button"
              className="mt-3 rounded-full bg-[#7048F8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5C36E0]"
              onClick={() => {
                window.localStorage.setItem("porter-web-payout-email", payoutEmail);
                showToast("Payout email saved");
              }}
            >
              Save payout email
            </button>
          </Section>
        </>
      )}

      {user.role === "business" && (
        <Section title="Business payouts" icon={CreditCard}>
          <p className="text-sm text-[var(--muted)]">
            Sales settle to this Porter Vendor account ({user.email}). Catalog and coverage stay in the Porter Vendor app.
          </p>
        </Section>
      )}
    </div>
  );
}

function PreferencesPanel() {
  const { session } = useAuth();
  const user = session!.user;
  const { theme, toggleTheme, showToast } = useAppStore();
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [notifyLive, setNotifyLive] = useState(true);

  useEffect(() => {
    setNotifyOffers(loadPref("porter-web-notify-offers", "1") === "1");
    setNotifyLive(loadPref("porter-web-notify-live", "1") === "1");
  }, []);

  function persistNotify(key: string, value: boolean, setter: (v: boolean) => void) {
    setter(value);
    window.localStorage.setItem(key, value ? "1" : "0");
    showToast("Preferences saved");
  }

  return (
    <Section title="Preferences" icon={Bell}>
      <div className="space-y-4">
        <ToggleRow
          label="Promotions"
          hint="Offers and marketplace news"
          on={notifyOffers}
          onChange={(v) => persistNotify("porter-web-notify-offers", v, setNotifyOffers)}
        />
        <ToggleRow
          label={user.role === "customer" ? "Live order updates" : user.role === "runr" ? "Shift and drop alerts" : "Vendor order alerts"}
          hint="Synced with your app notifications"
          on={notifyLive}
          onChange={(v) => persistNotify("porter-web-notify-live", v, setNotifyLive)}
        />
        <ToggleRow
          label="Dark mode"
          hint="Applies in the mobile apps on this account"
          on={theme === "dark"}
          onChange={() => toggleTheme()}
        />
      </div>
    </Section>
  );
}

function RatingsPanel() {
  const { session } = useAuth();
  const user = session!.user;
  const { businesses, orders, runHistory, earnings } = useAppStore();
  const kitchen = selectVendorBusiness(businesses, user.id);
  const reliability = runHistory.length === 0 ? "—" : `${Math.min(99, 90 + runHistory.length)}%`;
  const orderedBizIds = [...new Set(orders.map((o) => o.businessId))];
  const ratedVendors = businesses.filter((b) => orderedBizIds.includes(b.id));

  return (
    <div className="space-y-6">
      {user.role === "customer" && (
        <Section title="Business ratings" icon={Star}>
          {ratedVendors.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Ratings show up after you order in Porter.</p>
          ) : (
            <ul className="space-y-3">
              {ratedVendors.map((b) => (
                <li key={b.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                  <div>
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-[var(--muted)]">{b.reviewCount} reviews</p>
                  </div>
                  <p className="font-semibold">★ {b.rating.toFixed(1)}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {user.role === "runr" && (
        <Section title="Your rating" icon={Star}>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Reliability" value={reliability} />
            <StatCard label="Completed drops" value={String(earnings.length)} />
            <StatCard label="RUNs" value={String(runHistory.length)} />
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Reliability is based on completed RUNs on this marketplace.
          </p>
        </Section>
      )}

      {user.role === "business" && (
        <Section title="Vendor rating" icon={Star}>
          {kitchen ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard label="Rating" value={`★ ${kitchen.rating.toFixed(1)}`} />
                <StatCard label="Reviews" value={String(kitchen.reviewCount)} />
                <StatCard
                  label="Coverage"
                  value={`${getBusinessCoverageSummary(kitchen.coverageRules, kitchen.scheduledRuns).scheduledRunrs}/${getBusinessCoverageSummary(kitchen.coverageRules, kitchen.scheduledRuns).maxRunrs}`}
                />
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Grow ratings from Porter orders. Coverage and catalog stay in Porter Vendor.
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">No business linked yet.</p>
          )}
        </Section>
      )}
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

function ToggleRow({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-[var(--muted)]">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={`relative h-7 w-12 shrink-0 rounded-full ${on ? "bg-[#7048F8]" : "bg-[#E8E0D4]"}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
