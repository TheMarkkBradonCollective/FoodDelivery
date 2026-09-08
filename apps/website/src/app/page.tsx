import { DownloadCard } from "@/components/DownloadCard";
import { apps, companyValues, howItWorks } from "@/data/site-content";
import { ArrowDown, MapPin, Store, Truck } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-mesh border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff4f00]">
            Coverage-Driven Delivery Marketplace
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            Pick Your Place.
            <br />
            <span className="text-[#ff4f00]">Run Your Time.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)]">
            RUNR is a three-app ecosystem connecting customers, delivery workers,
            and businesses on one map-first marketplace network.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#apps"
              className="inline-flex items-center gap-2 rounded-xl bg-[#ff4f00] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#e64600]"
            >
              Download the Apps
              <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-8 py-3.5 text-sm font-semibold hover:bg-[var(--surface)]"
            >
              How We Operate
            </a>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl">🛍️</p>
              <p className="mt-1 text-sm font-semibold text-blue-600">PORTER</p>
              <p className="text-xs text-[var(--muted)]">Customer</p>
            </div>
            <div>
              <p className="text-2xl">🚗</p>
              <p className="mt-1 text-sm font-semibold text-[#ff4f00]">RUNR</p>
              <p className="text-xs text-[var(--muted)]">Delivery</p>
            </div>
            <div>
              <p className="text-2xl">🏪</p>
              <p className="mt-1 text-sm font-semibold text-emerald-600">VENDR</p>
              <p className="text-xs text-[var(--muted)]">Business</p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Apps */}
      <section id="apps" className="scroll-mt-20 bg-[var(--surface)] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Download the Apps</h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
              Three separate Android apps — each built for one role on the RUNR
              marketplace. Download the app that fits you.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {apps.map((app) => (
              <DownloadCard key={app.id} app={app} />
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-900">
            <strong>Android APKs</strong> — Install from the MBC App Store. Each app bundles its
            full UI inside the APK; no website or Vercel deploy required.
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">How We Operate</h2>
            <p className="mt-3 text-[var(--muted)]">
              RUNR is different from traditional delivery platforms. We&apos;re
              coverage-driven — not order-driven.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {howItWorks.map((item, i) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[var(--border)] bg-white p-6"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[#ff4f00]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section id="ecosystem" className="scroll-mt-20 border-y border-[var(--border)] bg-[var(--surface)] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">One Marketplace. Three Apps.</h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
              PORTER creates demand. VENDR fulfills the business side. RUNR moves it.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-lg">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-8 font-mono text-sm">
              <p className="text-center font-bold text-[var(--muted)]">PLATFORM</p>
              <p className="text-center text-[var(--muted)]">│</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-blue-50 p-3">
                  <Store className="mx-auto h-5 w-5 text-blue-600" />
                  <p className="mt-1 font-semibold text-blue-600">PORTER</p>
                  <p className="text-[10px] text-[var(--muted)]">Customer</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <MapPin className="mx-auto h-5 w-5 text-emerald-600" />
                  <p className="mt-1 font-semibold text-emerald-600">VENDR</p>
                  <p className="text-[10px] text-[var(--muted)]">Business</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-3">
                  <Truck className="mx-auto h-5 w-5 text-[#ff4f00]" />
                  <p className="mt-1 font-semibold text-[#ff4f00]">RUNR</p>
                  <p className="text-[10px] text-[var(--muted)]">Delivery</p>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-center text-xs text-[var(--muted)]">
                <p>PORTER ──order──► VENDR</p>
                <p>VENDR ──dispatch──► RUNR</p>
                <p>RUNR ──delivery──► PORTER</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company */}
      <section id="company" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">About RUNR</h2>
            <p className="mt-3 text-[var(--muted)]">
              We&apos;re building a delivery marketplace that respects everyone in
              the chain — customers who want reliability, businesses who need
              coverage control, and RUNRs who choose where and when they work.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {companyValues.map((v) => (
              <div key={v.title} className="rounded-2xl border border-[var(--border)] p-6">
                <h3 className="font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {v.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-[#0a0a0a] p-8 text-white md:p-12">
            <h3 className="text-xl font-bold">The Markk Brandon Collective</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
              RUNR is developed by The Markk Brandon Collective — a team focused on
              building technology that gives people control over how they shop, sell,
              and earn. Our platform is map-first, real-time, and designed to scale
              from local restaurants to full retail networks.
            </p>
            <a
              href="mailto:themarkkbrandoncollective@gmail.com"
              className="mt-6 inline-block text-sm font-semibold text-[#ff4f00] hover:underline"
            >
              themarkkbrandoncollective@gmail.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
