import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "./env";

const ADMIN_LOGIN_PATH = "/admin/login";

export async function updateSession(request: NextRequest) {
  const { url, anonKey, isConfigured } = getSupabasePublicEnv();
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === ADMIN_LOGIN_PATH;

  if (!isConfigured || !url || !anonKey) {
    if (isAdminRoute && !isLoginRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = ADMIN_LOGIN_PATH;
      redirectUrl.searchParams.set("error", "missing-env");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !isLoginRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = ADMIN_LOGIN_PATH;
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
