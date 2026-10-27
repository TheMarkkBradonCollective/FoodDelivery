import { publicProfile, signToken } from "@/lib/auth";
import { handle, HttpError, json, preflight, requireUser } from "@/lib/http";
import { readTable } from "@/lib/sheets";

export const OPTIONS = preflight;

/** Restores a session: returns the caller's profile and a refreshed token. */
export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const row = (await readTable("profiles")).find((p) => String(p.id) === user.sub);
  if (!row) throw new HttpError(401, "Account not found");
  return json(req, { token: await signToken(row), profile: publicProfile(row) });
});
