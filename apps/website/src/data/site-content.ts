export interface AppDownload {
  id: "porter" | "runr" | "vendr";
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  flow: string;
  packageId: string;
  color: string;
  colorClass: string;
  /** MBC App Store deep link (primary install path). */
  storeUrl: string;
  /** GitHub Release fallback for direct APK download. */
  apkUrl: string;
  version: string;
}

const MBC_STORE = "https://themarkkbradoncollective.github.io/main/download";
const GITHUB_RELEASES = "https://github.com/TheMarkkBradonCollective/Runr/releases/download";

export const apps: AppDownload[] = [
  {
    id: "porter",
    name: "PORTER",
    emoji: "🛍️",
    tagline: "Get what you need.",
    description:
      "Discover nearby businesses, order food and products, track deliveries live, and see your RUNR on the map.",
    flow: "Discover → Order → Track → Receive",
    packageId: "com.runr.porter",
    color: "#2563eb",
    colorClass: "bg-blue-600",
    storeUrl: `${MBC_STORE}/#download-porter`,
    apkUrl: `${GITHUB_RELEASES}/v0.2.0-porter/porter-v0.2.0.apk`,
    version: "0.2.0",
  },
  {
    id: "runr",
    name: "RUNR",
    emoji: "🚗",
    tagline: "Pick it up. Run it there.",
    description:
      "Choose where and when to deliver. Select a business, set your RUN window, and earn per delivery — not hourly.",
    flow: "Choose → RUN → Deliver → Earn",
    packageId: "com.runr.runr",
    color: "#ff4f00",
    colorClass: "bg-[#ff4f00]",
    storeUrl: `${MBC_STORE}/#download-runr`,
    apkUrl: `${GITHUB_RELEASES}/v0.2.0-runr/runr-v0.2.0.apk`,
    version: "0.2.0",
  },
  {
    id: "vendr",
    name: "VENDR",
    emoji: "🏪",
    tagline: "Sell. Manage. Grow.",
    description:
      "Run your business on the PORTER marketplace. Manage orders, set RUNR coverage, and monitor live deliveries.",
    flow: "Sell → Prepare → Dispatch → Fulfill → Grow",
    packageId: "com.runr.vendr",
    color: "#059669",
    colorClass: "bg-emerald-600",
    storeUrl: `${MBC_STORE}/#download-vendr`,
    apkUrl: `${GITHUB_RELEASES}/v0.2.0-vendr/vendr-v0.2.0.apk`,
    version: "0.2.0",
  },
];

export const howItWorks = [
  {
    title: "Coverage-driven, not order-driven",
    body: "Traditional platforms send drivers hunting for random orders. RUNR lets businesses define how many delivery workers they need — and lets RUNRs choose where and when they work.",
  },
  {
    title: "Businesses set capacity",
    body: "Through VENDR, businesses say \"I need 6 RUNRs between 5–8 PM\" — not \"send me a driver.\" Coverage gaps appear in real time on the map.",
  },
  {
    title: "RUNRs choose their RUN",
    body: "Delivery workers pick a business and a custom time window — like 5:37 PM to 8:12 PM. The platform handles matching and dispatch.",
  },
  {
    title: "Customers order normally",
    body: "PORTER works like the delivery apps you know: discover, browse menus, order, pay, and track — with live RUNR location on the map.",
  },
];

export const companyValues = [
  {
    title: "Map-first",
    body: "Every role starts with the map. Work, orders, and deliveries are visible in real time — not buried in dashboards.",
  },
  {
    title: "Fair earnings",
    body: "RUNRs are paid per completed delivery — base pay, distance, tips, and incentives. No false guaranteed income promises.",
  },
  {
    title: "Business control",
    body: "Merchants control staffing needs by time period. They don't manually assign every delivery — the dispatch engine handles it.",
  },
  {
    title: "One network",
    body: "PORTER, RUNR, and VENDR connect to the same marketplace. Orders, coverage, and deliveries stay in sync.",
  },
];
