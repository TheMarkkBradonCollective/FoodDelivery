export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff4f00] text-xs font-black text-white">
                R
              </div>
              <span className="font-bold">RUNR Platform</span>
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Pick Your Place. Run Your Time.
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              © {new Date().getFullYear()} The Markk Brandon Collective
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Apps
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#apps" className="hover:text-[#2563eb]">PORTER — Customer</a></li>
              <li><a href="#apps" className="hover:text-[#ff4f00]">RUNR — Delivery</a></li>
              <li><a href="#apps" className="hover:text-[#059669]">VENDR — Business</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Company
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              <li><a href="#how-it-works">How We Operate</a></li>
              <li><a href="#ecosystem">The Ecosystem</a></li>
              <li><a href="#company">About</a></li>
              <li>
                <a href="mailto:themarkkbrandoncollective@gmail.com">Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
