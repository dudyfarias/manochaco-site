import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./env";

export function createSupabaseBrowserClient() {
  const { url, anonKey, isConfigured } = getSupabasePublicEnv();

  if (!isConfigured || !url || !anonKey) {
    throw new Error(
      "Supabase client not configured. Define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createBrowserClient(url, anonKey);
}
