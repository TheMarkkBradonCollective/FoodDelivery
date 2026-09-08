import { Download, Package } from "lucide-react";
import type { AppDownload } from "@/data/site-content";

export function DownloadCard({ app }: { app: AppDownload }) {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white ${app.colorClass}`}
          >
            {app.emoji}
          </div>
          <div>
            <h3 className="text-lg font-bold">{app.name}</h3>
            <p className="text-sm text-[var(--muted)]">{app.tagline}</p>
          </div>
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--muted)]">
        {app.description}
      </p>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wider" style={{ color: app.color }}>
        {app.flow}
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
        <Package className="h-3.5 w-3.5" />
        <span>{app.packageId}</span>
        <span>·</span>
        <span>v{app.version}</span>
      </div>

      <a
        href={app.storeUrl}
        className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${app.colorClass}`}
      >
        <Download className="h-4 w-4" />
        Get on MBC App Store
      </a>

      <a
        href={app.apkUrl}
        download
        className="mt-2 inline-flex items-center justify-center gap-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        Direct APK download
      </a>

      <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
        Android only · Install from the MBC App Store or sideload the APK
      </p>
    </div>
  );
}
