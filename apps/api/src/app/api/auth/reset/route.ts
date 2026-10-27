import { handle, json, preflight } from "@/lib/http";

export const OPTIONS = preflight;

/**
 * Password reset needs an email provider (not configured yet). Until then staff reset
 * passwords by hand (scripts/seed.mjs can set a hash). Always answers 202 so the
 * endpoint can't be used to discover which emails exist.
 */
export const POST = handle(async (req) => {
  return json(req, { ok: true, message: "If that account exists, support will contact you to reset it." }, 202);
});
