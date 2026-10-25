/** Live Portr Supabase project. Env vars override these for another project. */
export const DEFAULT_SUPABASE_URL = "https://gonsvtgsocjaykrmtmpz.supabase.co";

export const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_StSiMTnbFWC5ArtUSWFdAw_PLNMl8Y_";

const ENV_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ENV_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const MODE = (process.env.NEXT_PUBLIC_PORTR_MODE || "").toLowerCase();

/**
 * Demo/offline mode is the default when no Supabase env is set at build time.
 * Set NEXT_PUBLIC_SUPABASE_URL (or NEXT_PUBLIC_PORTR_MODE=live) for a live build;
 * NEXT_PUBLIC_PORTR_MODE=demo forces demo even when env is present.
 */
export const DEMO_MODE = MODE === "demo" || (MODE !== "live" && !ENV_URL);

export const supabasePublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: ENV_URL || DEFAULT_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ENV_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  // Resolved at build time so the client bundle knows which mode it was built for.
  NEXT_PUBLIC_PORTR_MODE: DEMO_MODE ? "demo" : "live",
};

export function getSupabaseUrl(): string {
  return supabasePublicEnv.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseKey(): string {
  return supabasePublicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
}
