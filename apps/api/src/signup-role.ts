/** Roles allowed via POST /auth/signup (matches customer, runner, and vendor apps). */
export const SELF_SERVE_SIGNUP_ROLES = ["customer", "runr", "business"] as const;
export type SelfServeSignupRole = (typeof SELF_SERVE_SIGNUP_ROLES)[number];

const SELF_SERVE = new Set<string>(SELF_SERVE_SIGNUP_ROLES);

/** DB roles that must be granted directly in Postgres, not via signup. */
const PRIVILEGED_SIGNUP_ROLES = new Set([
  "staff",
  "support",
  "moderator",
  "administrator",
  "manager",
  "director",
  "founder",
]);

function isPrivilegedRole(role: string): boolean {
  return PRIVILEGED_SIGNUP_ROLES.has(role);
}

function normalizeRoleInput(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "customer";
  return raw.trim().toLowerCase();
}

const PRIVILEGED_SIGNUP_MESSAGE =
  "This account type cannot be created through self-service signup.";

/** Resolve the profile `role` column for a new self-serve account, or reject privileged escalation. */
export function resolveSignupRole(raw: unknown):
  | { ok: true; role: SelfServeSignupRole }
  | { ok: false; status: 403; error: string } {
  const role = normalizeRoleInput(raw);
  if (isPrivilegedRole(role)) {
    return { ok: false, status: 403, error: PRIVILEGED_SIGNUP_MESSAGE };
  }
  if (SELF_SERVE.has(role)) {
    return { ok: true, role: role as SelfServeSignupRole };
  }
  return { ok: true, role: "customer" };
}

export function validateSignupBody(body: {
  role?: unknown;
  staffTitle?: unknown;
  is_founder?: unknown;
  isFounder?: unknown;
}):
  | { ok: true; role: SelfServeSignupRole }
  | { ok: false; status: 403; error: string } {
  if (body.is_founder === true || body.isFounder === true) {
    return { ok: false, status: 403, error: PRIVILEGED_SIGNUP_MESSAGE };
  }
  const staffTitle =
    typeof body.staffTitle === "string" ? body.staffTitle.trim().toLowerCase() : "";
  if (staffTitle && isPrivilegedRole(staffTitle)) {
    return { ok: false, status: 403, error: PRIVILEGED_SIGNUP_MESSAGE };
  }
  return resolveSignupRole(body.role);
}

/** Reject client attempts to change privileged profile fields on self-service routes. */
export function hasPrivilegedProfileFields(body: Record<string, unknown>): boolean {
  return (
    "role" in body ||
    "is_founder" in body ||
    "isFounder" in body ||
    "staffTitle" in body
  );
}
