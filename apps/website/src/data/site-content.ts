export interface AppDownload {
  id: "porter" | "runr" | "vendr";
  name: string;
  iconUrl: string;
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
/** Public MBC mirror — works without GitHub auth (private Runr releases 404). */
const MBC_APKS = "https://themarkkbradoncollective.github.io/main/apks";
const BRAND_BLUE = "#0066FF";

export const apps: AppDownload[] = [
  {
    id: "porter",
    name: "PORTER",
    iconUrl: "/icons/apps/porter.png",
    tagline: "Get what you need.",
    description:
      "Discover nearby businesses, order food and products, track deliveries live, and see your RUNR on the map.",
    flow: "Discover → Order → Track → Receive",
    packageId: "com.runr.porter",
    color: BRAND_BLUE,
    colorClass: "bg-[#0066FF]",
    storeUrl: `${MBC_STORE}/#download-porter`,
    apkUrl: `${MBC_APKS}/porter/porter-v0.2.3.apk`,
    version: "0.2.3",
  },
  {
    id: "runr",
    name: "RUNR",
    iconUrl: "/icons/apps/runr.png",
    tagline: "Pick it up. Run it there.",
    description:
      "Choose where and when to deliver. Select a business, set your RUN window, and earn per delivery — not hourly.",
    flow: "Choose → RUN → Deliver → Earn",
    packageId: "com.runr.runr",
    color: BRAND_BLUE,
    colorClass: "bg-[#0066FF]",
    storeUrl: `${MBC_STORE}/#download-runr`,
    apkUrl: `${MBC_APKS}/runr/runr-v0.2.3.apk`,
    version: "0.2.3",
  },
  {
    id: "vendr",
    name: "VENDR",
    iconUrl: "/icons/apps/vendr.png",
    tagline: "Sell. Manage. Grow.",
    description:
      "Run your business on the PORTER marketplace. Manage orders, set RUNR coverage, and monitor live deliveries.",
    flow: "Sell → Prepare → Dispatch → Fulfill → Grow",
    packageId: "com.runr.vendr",
    color: BRAND_BLUE,
    colorClass: "bg-[#0066FF]",
    storeUrl: `${MBC_STORE}/#download-vendr`,
    apkUrl: `${MBC_APKS}/vendr/vendr-v0.2.3.apk`,
    version: "0.2.3",
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
