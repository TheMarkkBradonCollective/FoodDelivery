import { checkPassword, publicProfile, signToken } from "@/lib/auth";
import { handle, HttpError, json, preflight } from "@/lib/http";
import { readTable } from "@/lib/sheets";

export const OPTIONS = preflight;

export const POST = handle(async (req) => {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) throw new HttpError(400, "Email and password are required");
  const profiles = await readTable("profiles");
  const row = profiles.find((p) => String(p.email ?? "").toLowerCase() === email.trim().toLowerCase());
  if (!row?.password_hash || !(await checkPassword(password, String(row.password_hash)))) {
    throw new HttpError(401, "Invalid login credentials");
  }
  return json(req, { token: await signToken(row), profile: publicProfile(row) });
});
