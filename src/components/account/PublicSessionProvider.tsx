"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type PublicSessionState = "loading" | "authenticated" | "guest";

const PublicSessionContext = createContext<PublicSessionState>("loading");

export function PublicSessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [supabase] = useState(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  });
  const [sessionState, setSessionState] = useState<PublicSessionState>(
    supabase ? "loading" : "guest",
  );

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setSessionState(data.user ? "authenticated" : "guest");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setSessionState(session?.user ? "authenticated" : "guest");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname, supabase]);

  return (
    <PublicSessionContext.Provider value={sessionState}>
      {children}
    </PublicSessionContext.Provider>
  );
}

export function usePublicSessionState() {
  return useContext(PublicSessionContext);
}
