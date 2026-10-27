import type { User, UserRole } from "../types/index";
import type { AuthSession } from "./auth";

/** Seed user IDs match the bundled demo catalog so orders/runs line up. */
const DEMO_USERS: Record<string, Omit<User, "email">> = {
  customer: { id: "b1000000-0000-4000-8000-000000000001", name: "Demo Customer", role: "customer" },
  runr: { id: "b1000000-0000-4000-8000-000000000002", name: "Demo Runner", role: "runr", accessPreference: "both" },
  business: { id: "b1000000-0000-4000-8000-000000000003", name: "Demo Vendor", role: "business" },
  staff: { id: "b1000000-0000-4000-8000-000000000004", name: "Demo Staff", role: "staff", staffTitle: "founder" },
};

export function demoSession(role: UserRole, email?: string, name?: string): AuthSession {
  const base = DEMO_USERS[role] ?? { id: `demo-${role}`, name: "Demo User", role };
  const user = {
    ...base,
    name: name?.trim() || base.name,
    email: email?.trim() || `demo-${role}@portr.local`,
  } as User;
  return { user, token: "demo", loggedInAt: new Date().toISOString() };
}
