import Link from "next/link";

const nav = [
  { href: "#apps", label: "Download Apps" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#ecosystem", label: "Ecosystem" },
  { href: "#company", label: "Company" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff4f00] text-sm font-black text-white">
            R
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">RUNR</p>
            <p className="text-[10px] text-[var(--muted)]">Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href="#apps"
          className="rounded-lg bg-[#ff4f00] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e64600]"
        >
          Download Apps
        </a>
      </div>
    </header>
  );
}
