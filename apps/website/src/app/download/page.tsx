import { DownloadCard } from "@/components/DownloadCard";
import { apps } from "@/data/site-content";

export default function DownloadPage() {
  return (
    <div className="min-h-[80vh] bg-[var(--surface)] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7048F8]">
          Official downloads
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Get the RUNR apps</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          This website is the place to install PORTER, RUNR, VENDR, and STAFF. Each Android
          APK includes the full app. Staff manage the marketplace from the desktop Staff Portal —
          the STAFF phone app is for status and chat.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {apps.map((app) => (
            <DownloadCard key={app.id} app={app} />
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#E8E0D4] bg-white p-5 text-sm text-[var(--muted)]">
          <p>
            <strong className="text-[var(--foreground)]">Android only.</strong> Uninstall any older
            build first so the new purple/green launcher icons appear. Staff: sign in on this
            site to manage orders and coverage.
          </p>
        </div>
      </div>
    </div>
  );
}
