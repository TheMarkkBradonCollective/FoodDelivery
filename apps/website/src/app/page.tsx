import { DownloadCard } from "@/components/DownloadCard";
import { apps, companyValues, howItWorks, PORTER_BRAND } from "@/data/site-content";
import { ArrowDown, MapPin, Store, Truck } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-mesh border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7048F8]">
            {PORTER_BRAND.descriptor}
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            {PORTER_BRAND.headline[0]}
            <br />
            <span className="text-[#7048F8]">{PORTER_BRAND.headline[1]}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)]">
            {PORTER_BRAND.promise}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/download"
              className="inline-flex items-center gap-2 rounded-full bg-[#7048F8] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#5C36E0]"
            >
              Download the Apps
              <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-8 py-3.5 text-sm font-semibold hover:bg-[var(--surface)]"
            >
              How We Operate
            </a>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl">🛍️</p>
              <p className="mt-1 text-sm font-semibold text-[#7048F8]">Portr</p>
              <p className="text-xs text-[var(--muted)]">Customer</p>
            </div>
            <div>
              <p className="text-2xl">🚗</p>
              <p className="mt-1 text-sm font-semibold text-[#7048F8]">Portr Runner</p>
              <p className="text-xs text-[var(--muted)]">Delivery</p>
            </div>
            <div>
              <p className="text-2xl">🏪</p>
              <p className="mt-1 text-sm font-semibold text-[#7048F8]">Portr Vendor</p>
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
              This website is the official install page. Download the app for your role —
              Portr, Portr Runner, Portr Vendor, or Portr Command. Ops work the live marketplace from the Portr Command
              app or this site. Everyone else signs in here for account settings.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {apps.map((app) => (
              <DownloadCard key={app.id} app={app} />
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-900">
            <strong>Android APKs</strong> — Install from this site or the MBC App Store. Each app
            bundles its full UI. Portr Command can advance orders and coverage from Portr Command
            or this site. Other accounts use the website for billing and profile only.
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">How We Operate</h2>
            <p className="mt-3 text-[var(--muted)]">
              Portr is different from traditional delivery platforms. We&apos;re
              coverage-driven — not order-driven.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {howItWorks.map((item, i) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[var(--border)] bg-white p-6"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[#7048F8]">
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
            <h2 className="text-3xl font-bold tracking-tight">One Marketplace. Four Apps.</h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
              Portr creates demand. Portr Vendor fulfills the business side. Portr Runner moves it.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-lg">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-8 font-mono text-sm">
              <p className="text-center font-bold text-[var(--muted)]">PLATFORM</p>
              <p className="text-center text-[var(--muted)]">│</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-brand-muted p-3">
                  <Store className="mx-auto h-5 w-5 text-[#7048F8]" />
                  <p className="mt-1 font-semibold text-[#7048F8]">Portr</p>
                  <p className="text-[10px] text-[var(--muted)]">Customer</p>
                </div>
                <div className="rounded-2xl bg-brand-muted p-3">
                  <MapPin className="mx-auto h-5 w-5 text-[#7048F8]" />
                  <p className="mt-1 font-semibold text-[#7048F8]">Portr Vendor</p>
                  <p className="text-[10px] text-[var(--muted)]">Business</p>
                </div>
                <div className="rounded-2xl bg-brand-muted p-3">
                  <Truck className="mx-auto h-5 w-5 text-[#7048F8]" />
                  <p className="mt-1 font-semibold text-[#7048F8]">Portr Runner</p>
                  <p className="text-[10px] text-[var(--muted)]">Delivery</p>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-center text-xs text-[var(--muted)]">
                <p>Portr ──order──► Portr Vendor</p>
                <p>Portr Vendor ──dispatch──► Portr Runner</p>
                <p>Portr Runner ──delivery──► Portr</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company */}
      <section id="company" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">About Portr</h2>
            <p className="mt-3 text-[var(--muted)]">
              We&apos;re building a delivery marketplace that respects everyone in
              the chain — customers who want reliability, businesses who need
              coverage control, and Runners who choose where and when they work.
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

          <div className="mt-12 rounded-[2rem] bg-[#2A1478] p-8 text-white md:p-12">
            <h3 className="text-xl font-bold">The Markk Brandon Collective</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Runner is developed by The Markk Brandon Collective — a team focused on
              building technology that gives people control over how they shop, sell,
              and earn. Our platform is map-first, real-time, and designed to scale
              from local restaurants to full retail networks.
            </p>
            <a
              href="mailto:themarkkbrandoncollective@gmail.com"
              className="mt-6 inline-block text-sm font-semibold text-[#7048F8] hover:underline"
            >
              themarkkbrandoncollective@gmail.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
