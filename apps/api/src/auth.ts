import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { ProfileRow, Sql } from "./db";
import { firstRow, rows } from "./db";

const STAFF_ROLES = new Set([
  "staff",
  "support",
  "moderator",
  "administrator",
  "manager",
  "director",
  "founder",
]);

export function isStaffRole(role: string): boolean {
  return STAFF_ROLES.has(role);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  if (hash.startsWith("$2")) {
    return bcrypt.compare(password, hash);
  }
  return false;
}

export async function signToken(userId: string, secret: string): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<{ userId: string } | null> {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    const sub = payload.sub;
    if (typeof sub !== "string") return null;
    return { userId: sub };
  } catch {
    return null;
  }
}

export async function loadProfile(sql: Sql, userId: string): Promise<ProfileRow | null> {
  const row = firstRow<ProfileRow>(await sql`
    select id, email, personal_email, company_email, name, role, is_founder, avatar_url, access_preference
    from profiles where id = ${userId}::uuid limit 1
  `);
  return row ?? null;
}

export function bearerToken(header: string | undefined): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}
