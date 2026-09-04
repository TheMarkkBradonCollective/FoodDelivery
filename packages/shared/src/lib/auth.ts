import type { User, UserRole } from "../types/index";
import { mockUsers } from "../data/mock-data";

export interface AuthSession {
  user: User;
  token: string;
  loggedInAt: string;
}

/** Demo credentials for MVP — replace with real auth provider in production */
const DEMO_CREDENTIALS: Record<string, { password: string; role: UserRole }> = {
  "alex@example.com": { password: "porter123", role: "customer" },
  "james@example.com": { password: "runr123", role: "runr" },
  "tony@tonyspizza.com": { password: "vendr123", role: "business" },
  "staff@runr.com": { password: "staff123", role: "staff" },
};

const STAFF_USER: User = {
  id: "user-staff-1",
  name: "Platform Admin",
  email: "staff@runr.com",
  role: "staff",
};

export function authenticate(
  email: string,
  password: string
): { success: true; session: AuthSession } | { success: false; error: string } {
  const normalized = email.trim().toLowerCase();
  const cred = DEMO_CREDENTIALS[normalized];

  if (!cred || cred.password !== password) {
    return { success: false, error: "Invalid email or password." };
  }

  let user: User | undefined;
  if (cred.role === "staff") {
    user = STAFF_USER;
  } else {
    user = mockUsers.find((u) => u.email.toLowerCase() === normalized);
  }

  if (!user) {
    return { success: false, error: "Account not found." };
  }

  return {
    success: true,
    session: {
      user,
      token: `demo-${user.id}-${Date.now()}`,
      loggedInAt: new Date().toISOString(),
    },
  };
}

export function getDemoAccounts() {
  return [
    { email: "alex@example.com", password: "porter123", app: "PORTER", role: "Customer" },
    { email: "james@example.com", password: "runr123", app: "RUNR", role: "Delivery" },
    { email: "tony@tonyspizza.com", password: "vendr123", app: "VENDR", role: "Business" },
    { email: "staff@runr.com", password: "staff123", app: "Web Portal", role: "Staff" },
  ];
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    customer: "PORTER Customer",
    runr: "RUNR Delivery",
    business: "VENDR Business",
    staff: "Platform Staff",
  };
  return labels[role];
}

export function getAppForRole(role: UserRole): string {
  const apps: Record<UserRole, string> = {
    customer: "PORTER",
    runr: "RUNR",
    business: "VENDR",
    staff: "Admin Portal",
  };
  return apps[role];
}
