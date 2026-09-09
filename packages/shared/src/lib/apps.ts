import type { UserRole } from "../types/index";

export type AppId = "porter" | "runr" | "vendr" | "staff";

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
    shortName: "PORTER",
    role: "Customer",
    tagline: "Get what you need.",
    greeting: "Discover nearby businesses, order, and track your RUNR.",
    flow: ["Discover", "Order", "Track", "Receive"],
    job: "PORTER creates the demand.",
  },
  runr: {
    shortName: "RUNR",
    role: "Delivery",
    tagline: "Pick it up. Run it there.",
    greeting: "Choose a business and a window. The marketplace matches the rest.",
    flow: ["Choose", "RUN", "Deliver", "Earn"],
    job: "RUNR moves it.",
  },
  vendr: {
    shortName: "VENDR",
    role: "Business",
    tagline: "Sell. Manage. Grow.",
    greeting: "Sell on PORTER. Set how many RUNRs you need.",
    flow: ["Sell", "Prepare", "Dispatch", "Fulfill", "Grow"],
    job: "VENDR fulfills the business side.",
  },
  staff: {
    shortName: "STAFF",
    role: "Ops",
    tagline: "Status and chat.",
    greeting: "Marketplace at a glance.",
    flow: ["Status", "Chat", "Alerts", "Desktop"],
    job: "STAFF watches the network.",
  },
};

export function roleToApp(role: UserRole): AppId {
  const map: Record<UserRole, AppId> = {
    customer: "porter",
    runr: "runr",
    business: "vendr",
    staff: "staff",
  };
  return map[role];
}

/** Skip names that are just the product (e.g. "PORTER Tester"). */
export function displayFirstName(name: string | undefined, appName: string) {
  const first = name?.split(/\s+/)[0]?.trim() ?? "";
  if (!first || first.toUpperCase() === appName.toUpperCase()) return "there";
  return first;
}
