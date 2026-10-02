import type { UserRole } from "../types/index";

export type AppId = "porter" | "runr" | "vendr" | "staff";

/** Parent brand (website, account, release catalog). */
export const PLATFORM_NAME = "Portr";

/** Original marketplace signature — names changed, wording did not. */
export const PORTER_BRAND = {
  name: PLATFORM_NAME,
  descriptor: "Coverage-Driven Delivery Marketplace",
  headline: ["Pick Your Place.", "Run Your Time."] as const,
  promise:
    "Portr creates the demand. Portr Vendor fulfills the business side. Portr Runner moves it. One coverage-driven marketplace — not three disconnected apps.",
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
    shortName: "Portr",
    role: "Customer",
    tagline: "Get what you need.",
    greeting: "Discover nearby businesses, order, and track your Runner.",
    flow: ["Discover", "Order", "Track", "Receive"],
    job: "Portr creates the demand.",
  },
  runr: {
    shortName: "Portr Runner",
    role: "Delivery",
    tagline: "Pick it up. Run it there.",
    greeting: "Choose a business and a window. The marketplace matches the rest.",
    flow: ["Choose", "RUN", "Deliver", "Earn"],
    job: "Portr Runner moves it.",
  },
  vendr: {
    shortName: "Portr Vendor",
    role: "Business",
    tagline: "Sell. Manage. Grow.",
    greeting: "Sell on Portr. Set how many Runners you need.",
    flow: ["Sell", "Prepare", "Dispatch", "Fulfill", "Grow"],
    job: "Portr Vendor fulfills the business side.",
  },
  staff: {
    shortName: "Portr Command",
    role: "Ops",
    tagline: "Run the marketplace.",
    greeting: "Advance orders, coverage, and users from this phone — same tools as desktop.",
    flow: ["Status", "Orders", "Coverage", "Users"],
    job: "Portr Command runs the network.",
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

/** Skip names that are just the product (e.g. "Portr Tester"). */
export function displayFirstName(name: string | undefined, appName: string) {
  const first = name?.split(/\s+/)[0]?.trim() ?? "";
  if (!first || first.toUpperCase() === appName.toUpperCase()) return "there";
  return first;
}
