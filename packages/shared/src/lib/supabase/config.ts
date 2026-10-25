export {
  DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  DEFAULT_SUPABASE_URL,
  DEMO_MODE,
  getSupabaseKey,
  getSupabaseUrl,
  supabasePublicEnv,
} from "./public-env";

import { DEMO_MODE, getSupabaseKey, getSupabaseUrl } from "./public-env";

/** True when the build runs offline on bundled seed data (no Supabase, no network). */
export function isDemoMode(): boolean {
  return DEMO_MODE;
}

export function isSupabaseConfigured(): boolean {
  return !DEMO_MODE && Boolean(getSupabaseUrl() && getSupabaseKey());
}
