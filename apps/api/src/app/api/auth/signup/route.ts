import { hashPassword, normalizeRole, publicProfile, signToken } from "@/lib/auth";
import { handle, HttpError, json, preflight } from "@/lib/http";
import { readTableRows, upsert } from "@/lib/sheets";

export const OPTIONS = preflight;

export const POST = handle(async (req) => {
  const body = (await req.json()) as { email?: string; password?: string; name?: string; role?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email || !body.password) throw new HttpError(400, "Email and password are required");
  if (body.password.length < 8) throw new HttpError(400, "Use a password with at least 8 characters");
  const role = normalizeRole(body.role);
  if (role === "staff") throw new HttpError(403, "Staff accounts are created by an administrator");
  const rows = await readTableRows("profiles");
  if (rows.some((r) => String(r.data.email ?? "").toLowerCase() === email)) {
    throw new HttpError(409, "User already registered");
  }
  const profile = await upsert(
    "profiles",
    {
      id: crypto.randomUUID(),
      email,
      name: body.name?.trim() || email.split("@")[0],
      role,
      is_founder: false,
      password_hash: await hashPassword(body.password),
    },
    rows,
  );
  return json(req, { token: await signToken(profile), profile: publicProfile(profile) }, 201);
});
