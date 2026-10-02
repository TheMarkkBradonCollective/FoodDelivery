import { APP_COPY, PORTER_BRAND, ecosystemTagline } from "@porter/shared/lib/apps";

export interface AppDownload {
  id: "porter" | "runr" | "vendr" | "staff";
  name: string;
  iconUrl: string;
  tagline: string;
  description: string;
  flow: string;
  packageId: string;
  color: string;
  colorClass: string;
  storeUrl: string;
  apkUrl: string;
  exeUrl?: string;
  version: string;
}

const MBC_STORE = "https://themarkkbradoncollective.github.io/main/download";
const RELEASE = "0.3.5";
const GH_RELEASE = `https://github.com/TheMarkkBradonCollective/FoodDelivery/releases/download/v${RELEASE}`;
const BRAND_PURPLE = "#7048F8";
const BRAND_PLUM = "#2A1478";

export { PORTER_BRAND, ecosystemTagline };

export const apps: AppDownload[] = [
  {
    id: "porter",
    name: APP_COPY.porter.shortName,
    iconUrl: "/icons/apps/porter.png",
    tagline: APP_COPY.porter.tagline,
    description: APP_COPY.porter.greeting,
    flow: APP_COPY.porter.flow.join(" → "),
    packageId: "com.porter.porter",
    color: BRAND_PURPLE,
    colorClass: "bg-brand",
    storeUrl: `${MBC_STORE}/#download-porter`,
    apkUrl: `${GH_RELEASE}/porter-v${RELEASE}.apk`,
    version: RELEASE,
  },
  {
    id: "runr",
    name: APP_COPY.runr.shortName,
    iconUrl: "/icons/apps/runr.png",
    tagline: APP_COPY.runr.tagline,
    description: APP_COPY.runr.greeting,
    flow: APP_COPY.runr.flow.join(" → "),
    packageId: "com.porter.runner",
    color: BRAND_PURPLE,
    colorClass: "bg-brand",
    storeUrl: `${MBC_STORE}/#download-runr`,
    apkUrl: `${GH_RELEASE}/runr-v${RELEASE}.apk`,
    version: RELEASE,
  },
  {
    id: "vendr",
    name: APP_COPY.vendr.shortName,
    iconUrl: "/icons/apps/vendr.png",
    tagline: APP_COPY.vendr.tagline,
    description: APP_COPY.vendr.greeting,
    flow: APP_COPY.vendr.flow.join(" → "),
    packageId: "com.porter.vendor",
    color: BRAND_PURPLE,
    colorClass: "bg-brand",
    storeUrl: `${MBC_STORE}/#download-vendr`,
    apkUrl: `${GH_RELEASE}/vendr-v${RELEASE}.apk`,
    version: RELEASE,
  },
  {
    id: "staff",
    name: APP_COPY.staff.shortName,
    iconUrl: "/icons/apps/staff.png",
    tagline: APP_COPY.staff.tagline,
    description: APP_COPY.staff.greeting,
    flow: APP_COPY.staff.flow.join(" → "),
    packageId: "com.porter.command",
    color: BRAND_PLUM,
    colorClass: "bg-brand-deep",
    storeUrl: `${MBC_STORE}/#download-staff`,
    apkUrl: `${GH_RELEASE}/staff-v${RELEASE}.apk`,
    exeUrl: `${GH_RELEASE}/PortrCommand-v${RELEASE}.exe`,
    version: RELEASE,
  },
];

export const howItWorks = [
  {
    title: "Coverage-driven, not order-driven",
    body: "Traditional platforms send drivers hunting for random orders. Portr lets businesses define how many delivery workers they need — and lets Runners choose where and when they work.",
  },
  {
    title: "Businesses set capacity",
    body: 'Through Portr Vendor, businesses say "I need 6 Runners between 5–8 PM" — not "send me a driver." Coverage gaps appear in real time on the map.',
  },
  {
    title: "Runners choose their RUN",
    body: "Delivery workers pick a business and a custom time window — like 5:37 PM to 8:12 PM. The platform handles matching and dispatch.",
  },
  {
    title: "Customers order normally",
    body: "Portr works like the delivery apps you know: discover, browse menus, order, pay, and track — with live Runner location on the map.",
  },
];

export const companyValues = [
  {
    title: "Map-first",
    body: "Every role starts with the map. Work, orders, and deliveries are visible in real time — not buried in dashboards.",
  },
  {
    title: "Fair earnings",
    body: "Runners are paid per completed delivery — base pay, distance, tips, and incentives. No false guaranteed income promises.",
  },
  {
    title: "Business control",
    body: "Merchants control staffing needs by time period. They don't manually assign every delivery — the dispatch engine handles it.",
  },
  {
    title: "One network",
    body: "Portr, Portr Runner, and Portr Vendor connect to the same marketplace. Orders, coverage, and deliveries stay in sync.",
  },
];
