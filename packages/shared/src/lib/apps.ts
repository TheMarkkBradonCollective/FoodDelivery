import type { UserRole } from "../types/index";

export type AppId = "porter" | "runr" | "vendr" | "staff";

export const APP_COPY: Record<
  AppId,
  { shortName: string; tagline: string; greeting: string }
> = {
  porter: {
    shortName: "PORTER",
    tagline: "Get what you need.",
    greeting: "Hungry? Order and eat.",
  },
  runr: {
    shortName: "RUNR",
    tagline: "Run your time.",
    greeting: "Pick your place. Run it.",
  },
  vendr: {
    shortName: "VENDR",
    tagline: "Sell. Manage. Grow.",
    greeting: "Live kitchen operations.",
  },
  staff: {
    shortName: "STAFF",
    tagline: "Status and chat.",
    greeting: "Marketplace at a glance.",
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
