import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  if (!client) {
    client = createClient(getSupabaseUrl()!, getSupabaseKey()!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return client;
}
