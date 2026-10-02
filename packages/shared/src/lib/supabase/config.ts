export {
  DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  DEFAULT_SUPABASE_URL,
  getSupabaseKey,
  getSupabaseUrl,
  supabasePublicEnv,
} from "./public-env";

import { getSupabaseKey, getSupabaseUrl } from "./public-env";

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseKey());
}
