import { DownloadCard } from "@/components/DownloadCard";
import { apps } from "@/data/site-content";
import { getCustomerSkin } from "@porter/shared/lib/customer-skin";
import Link from "next/link";

const fastfood = getCustomerSkin("fastfood");

export default function DownloadPage() {
  return (
    <div className="min-h-[80vh] bg-[var(--surface)] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7048F8]">
          Official downloads
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Get the Portr apps</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          This website is the place to install Portr, Portr Runner, Portr Vendor, and Portr Command. Each Android
          APK includes the full app. Ops work from Portr Command or this site. Other accounts sign in here for billing,
          profile, preferences, and ratings.
        </p>

        <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {apps.map((app) => (
                <DownloadCard key={app.id} app={app} />
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#E8E0D4] bg-white p-5 text-sm text-[var(--muted)]">
              <p>
                <strong className="text-[var(--foreground)]">Android only.</strong> Uninstall any older build first so
                the new launcher icons appear. Portr Command handles marketplace ops. Customer and vendor accounts use
                this site for settings.
              </p>
            </div>
          </div>

          <aside className="w-full shrink-0 lg:max-w-xs lg:pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E31837]">Alternate customer app</p>
            <div className="mt-4 overflow-hidden rounded-2xl border-2 border-[#FFC72C] bg-gradient-to-b from-[#FFF9E6] to-white p-6 shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFC72C] text-2xl font-black text-[#7F1D1D]">
                FF
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-[#E31837]">{fastfood.shortName}</h2>
              <p className="mt-1 text-sm font-semibold text-[#92400E]">{fastfood.tagline}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#78350F]">
                Portr with a red &amp; yellow color change. Same screens, same customer login, same marketplace.
              </p>
              <p className="mt-4 font-mono text-xs text-[#92400E]">com.porter.fastfood</p>
              <Link
                href="/download#fastfood"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#E31837] px-4 py-3 text-sm font-bold text-white hover:bg-[#C41230]"
              >
                Build with release APKs
              </Link>
              <p className="mt-3 text-center text-[11px] text-[#92400E]">
                Run <code className="rounded bg-[#FFFBEB] px-1">npm run dev:fastfood</code> locally (port 3006)
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
