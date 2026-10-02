/** Live Portr Supabase project. Env vars override these for another project. */
export const DEFAULT_SUPABASE_URL = "https://gonsvtgsocjaykrmtmpz.supabase.co";

export const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_StSiMTnbFWC5ArtUSWFdAw_PLNMl8Y_";

export const supabasePublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY,
};

export function getSupabaseUrl(): string {
  return supabasePublicEnv.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseKey(): string {
  return supabasePublicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
}
