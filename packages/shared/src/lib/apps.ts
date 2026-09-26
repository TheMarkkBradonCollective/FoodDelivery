import type { UserRole } from "../types/index";

export type AppId = "porter" | "runr" | "vendr" | "staff";

/** Parent brand — website, releases, and shared marketing. */
export const PLATFORM_NAME = "Porter";

/** Full Porter marketplace signature (replaces RUNR-era “Order local. Staff by coverage.”). */
export const PORTER_BRAND = {
  name: PLATFORM_NAME,
  descriptor: "Coverage-first delivery marketplace",
  headline: ["Order local.", "Staff by coverage."] as const,
  promise:
    "One network for customers, vendors, runners, and ops — capacity is planned in advance, not chased order by order.",
  footerLine: "Order local. Staff by coverage.",
} as const;

/** @deprecated Use PORTER_BRAND.footerLine or headline */
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
    tagline: "Shop nearby. Track every step.",
    greeting: "Discover local vendors, order, and follow your Runner on the map.",
    flow: ["Discover", "Order", "Track", "Receive"],
    job: "Porter creates the demand.",
  },
  runr: {
    shortName: "Porter Runner",
    role: "Delivery",
    tagline: "Choose your window. Earn per drop.",
    greeting: "Pick a vendor and a time window. The marketplace matches orders to your coverage.",
    flow: ["Choose", "Cover", "Deliver", "Earn"],
    job: "Porter Runner moves it.",
  },
  vendr: {
    shortName: "Porter Vendor",
    role: "Business",
    tagline: "Set capacity. Serve your queue.",
    greeting: "Sell on Porter. Set how many Runners you need for each window.",
    flow: ["List", "Prepare", "Dispatch", "Fulfill", "Grow"],
    job: "Porter Vendor fulfills the business side.",
  },
  staff: {
    shortName: "Porter Command",
    role: "Ops",
    tagline: "Operate the network.",
    greeting: "Advance orders, coverage, and users from this phone — same tools as desktop.",
    flow: ["Status", "Orders", "Coverage", "Users"],
    job: "Porter Command runs the network.",
  },
};

/** Marketing one-liner for the four-app ecosystem. */
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
