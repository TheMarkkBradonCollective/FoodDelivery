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
  version: string;
}

const MBC_STORE = "https://themarkkbradoncollective.github.io/main/download";
const MBC_APKS = "https://themarkkbradoncollective.github.io/main/apks";
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
    apkUrl: `${MBC_APKS}/porter/porter-v0.3.4.apk`,
    version: "0.3.4",
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
    apkUrl: `${MBC_APKS}/runr/runr-v0.3.4.apk`,
    version: "0.3.4",
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
    apkUrl: `${MBC_APKS}/vendr/vendr-v0.3.4.apk`,
    version: "0.3.4",
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
    apkUrl: `${MBC_APKS}/staff/staff-v0.3.4.apk`,
    version: "0.3.4",
  },
];

export const howItWorks = [
  {
    title: "Coverage-driven, not order-driven",
    body: `${PORTER_BRAND.name} lets vendors define how many Runners they need — and lets Runners choose where and when they work.`,
  },
  {
    title: "Vendors set capacity",
    body: `Through ${APP_COPY.vendr.shortName}, businesses say "I need 6 Runners between 5–8 PM" — not "send me a driver." Coverage gaps appear in real time on the map.`,
  },
  {
    title: "Runners choose their window",
    body: "Delivery workers pick a vendor and a custom time window. The platform handles matching and dispatch.",
  },
  {
    title: "Customers order normally",
    body: `${APP_COPY.porter.shortName} works like the delivery apps you know: discover, browse, order, pay, and track — with live Runner location on the map.`,
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
    title: "Vendor control",
    body: "Merchants control staffing by time period. They don't manually assign every delivery — the dispatch engine handles it.",
  },
  {
    title: "One network",
    body: `${APP_COPY.porter.shortName}, ${APP_COPY.runr.shortName}, and ${APP_COPY.vendr.shortName} share one marketplace. Orders, coverage, and deliveries stay in sync.`,
  },
];
