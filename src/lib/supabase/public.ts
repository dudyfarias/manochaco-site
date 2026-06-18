import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

let publicClient: SupabaseClient | null = null;

export function getSupabasePublicClient() {
  const { url, anonKey, isConfigured } = getSupabasePublicEnv();

  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  if (!publicClient) {
    publicClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return publicClient;
}
