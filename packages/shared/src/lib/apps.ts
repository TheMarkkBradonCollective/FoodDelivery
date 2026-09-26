import type { UserRole } from "../types/index";

export type AppId = "porter" | "runr" | "vendr" | "staff";

/** Parent brand (website, account, release catalog). */
export const PLATFORM_NAME = "Porter";

/** Original marketplace signature — names changed, wording did not. */
export const PORTER_BRAND = {
  name: PLATFORM_NAME,
  descriptor: "Coverage-Driven Delivery Marketplace",
  headline: ["Pick Your Place.", "Run Your Time."] as const,
  promise:
    "Porter creates the demand. Porter Vendor fulfills the business side. Porter Runner moves it. One coverage-driven marketplace — not three disconnected apps.",
  footerLine: "Pick Your Place. Run Your Time.",
} as const;

export const MARKETPLACE_TAGLINE = PORTER_BRAND.footerLine;

export const APP_COPY: Record<
  AppId,
  {
    shortName: string;
    role: string;
    tagline: string;
    greeting: string;
    flow: string[];
    job: string;
  }
> = {
  porter: {
    shortName: "Porter",
    role: "Customer",
    tagline: "Get what you need.",
    greeting: "Discover nearby businesses, order, and track your Runner.",
    flow: ["Discover", "Order", "Track", "Receive"],
    job: "Porter creates the demand.",
  },
  runr: {
    shortName: "Porter Runner",
    role: "Delivery",
    tagline: "Pick it up. Run it there.",
    greeting: "Choose a business and a window. The marketplace matches the rest.",
    flow: ["Choose", "RUN", "Deliver", "Earn"],
    job: "Porter Runner moves it.",
  },
  vendr: {
    shortName: "Porter Vendor",
    role: "Business",
    tagline: "Sell. Manage. Grow.",
    greeting: "Sell on Porter. Set how many Runners you need.",
    flow: ["Sell", "Prepare", "Dispatch", "Fulfill", "Grow"],
    job: "Porter Vendor fulfills the business side.",
  },
  staff: {
    shortName: "Porter Command",
    role: "Ops",
    tagline: "Run the marketplace.",
    greeting: "Advance orders, coverage, and users from this phone — same tools as desktop.",
    flow: ["Status", "Orders", "Coverage", "Users"],
    job: "Porter Command runs the network.",
  },
};

export function ecosystemTagline(): string {
  const { porter, vendr, runr } = APP_COPY;
  return `${porter.job} ${vendr.job} ${runr.job}`;
}

export function roleToApp(role: UserRole): AppId {
  const map: Record<UserRole, AppId> = {
    customer: "porter",
    runr: "runr",
    business: "vendr",
    staff: "staff",
  };
  return map[role];
}

export function appDisplayName(appId: AppId): string {
  return APP_COPY[appId].shortName;
}

/** Skip names that are just the product (e.g. "Porter Tester"). */
export function displayFirstName(name: string | undefined, appName: string) {
  const first = name?.split(/\s+/)[0]?.trim() ?? "";
  if (!first || first.toUpperCase() === appName.toUpperCase()) return "there";
  return first;
}
