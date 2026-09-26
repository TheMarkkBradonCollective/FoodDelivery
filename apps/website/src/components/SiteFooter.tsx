import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#7048F8] text-xs font-black text-white">
                P
              </div>
              <span className="font-bold">Porter</span>
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
              <li><Link href="/download" className="hover:text-[#7048F8]">Download apps</Link></li>
              <li><Link href="/download" className="hover:text-[#7048F8]">Porter — Customer</Link></li>
              <li><Link href="/download" className="hover:text-[#7048F8]">Porter Runner — Delivery</Link></li>
              <li><Link href="/download" className="hover:text-[#7048F8]">Porter Vendor — Business</Link></li>
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
              <li><Link href="/login" className="hover:text-[#7048F8]">Sign In</Link></li>
              <li><Link href="/account" className="hover:text-[#7048F8]">My Account</Link></li>
              <li><Link href="/staff" className="hover:text-[#7048F8]">Porter Command Portal</Link></li>
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
