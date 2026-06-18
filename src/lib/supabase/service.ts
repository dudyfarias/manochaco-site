import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceEnv } from "./env";

export function createSupabaseServiceClient() {
  const { url, serviceRoleKey, isConfigured } = getSupabaseServiceEnv();

  if (!isConfigured || !url || !serviceRoleKey) {
    throw new Error(
      "Supabase service client not configured. Define NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
