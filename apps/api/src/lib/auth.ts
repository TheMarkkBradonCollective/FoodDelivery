import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { Row } from "./sheets";

export type Role = "customer" | "runr" | "business" | "staff";
export const ROLES: Role[] = ["customer", "runr", "business", "staff"];
export const STAFF_TITLES = ["support", "moderator", "administrator", "manager", "director", "founder"];

export interface Claims {
  sub: string;
  role: Role;
  email: string;
}

function secret() {
  const s = process.env.AUTH_JWT_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_JWT_SECRET must be set (32+ chars)");
  return new TextEncoder().encode(s);
}

/** profiles.role holds either an app role or a staff title. */
export function normalizeRole(value: unknown): Role {
  const v = String(value ?? "").toLowerCase();
  if (v === "staff" || STAFF_TITLES.includes(v)) return "staff";
  return (ROLES as string[]).includes(v) ? (v as Role) : "customer";
}

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const checkPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function signToken(profile: Row): Promise<string> {
  return new SignJWT({ role: normalizeRole(profile.role), email: String(profile.email ?? "") })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(profile.id))
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function readClaims(req: Request): Promise<Claims | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { sub: String(payload.sub), role: normalizeRole(payload.role), email: String(payload.email ?? "") };
  } catch {
    return null;
  }
}

/** Public profile shape returned to clients (never includes password_hash). */
export function publicProfile(row: Row): Row {
  const { password_hash: _omit, ...rest } = row;
  void _omit;
  return rest;
}
