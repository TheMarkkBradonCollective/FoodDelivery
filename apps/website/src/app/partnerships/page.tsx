import Link from "next/link";

export default function PartnershipsPage() {
  return <main className="mx-auto max-w-6xl px-6 py-16">
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#7048F8]">Portr Business Partnerships</p>
    <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">Bring your next campaign to life with Portr.</h1>
    <p className="mt-5 max-w-2xl text-lg text-[var(--muted)]">Build a coordinated delivery campaign around your brand, locations, launch, or recurring customer and employee needs. Portr coordinates participating vendors, Runner enrollment, operating coverage, and campaign reporting.</p>
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {[["Brand campaigns","Promote products and offers through participating local businesses."],["Corporate programs","Coordinate recurring ordering and delivery for teams, offices, and customers."],["Market launches","Build a new delivery market with participating vendors and an enrolled Runner network."]].map(([title,body])=><article key={title} className="rounded-2xl border border-[var(--border)] bg-white p-6"><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm text-[var(--muted)]">{body}</p></article>)}
    </div>
    <section className="mt-12 rounded-3xl bg-[#21105F] p-8 text-white md:p-10">
      <h2 className="text-2xl font-bold">A campaign with operational controls built in</h2>
      <ul className="mt-5 grid gap-3 text-sm md:grid-cols-2">
        <li>• Start date, end date, and enrollment deadline</li><li>• Day-by-day operating hours or 24/7 coverage</li>
        <li>• Maximum campaign membership</li><li>• Separate maximum number of active Runners at once</li>
        <li>• Runners choose when to go online; no preset shifts</li><li>• Campaign status, live occupancy, and open capacity</li>
        <li>• Minimum enrollment and under-enrollment void review</li><li>• Funding and refund reconciliation visibility</li>
      </ul>
      <p className="mt-6 text-sm text-white/70">Companies can work with Portr to scope a campaign, confirm participating locations, and agree on funding and operating terms before launch.</p>
      <Link href="/login" className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-[#21105F]">Sign in to your business account</Link>
    </section>
  </main>;
}
