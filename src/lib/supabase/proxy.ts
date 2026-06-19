import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "./env";

const ADMIN_LOGIN_PATH = "/admin/login";
const PUBLIC_LOGIN_PATH = "/entrar";

function redirectWithCookies(url: URL, source: NextResponse) {
  const response = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

export async function updateSession(request: NextRequest) {
  const { url, anonKey, isConfigured } = getSupabasePublicEnv();
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginRoute = pathname === ADMIN_LOGIN_PATH;
  const isAccountRoute = pathname === "/conta" || pathname.startsWith("/conta/");
  const isNewPasswordRoute = pathname === "/nova-senha";
  const isPublicAuthRoute =
    pathname === PUBLIC_LOGIN_PATH ||
    pathname === "/cadastro" ||
    pathname.startsWith("/cadastro/");
  const isProtectedRoute =
    (isAdminRoute && !isAdminLoginRoute) || isAccountRoute || isNewPasswordRoute;

  if (!isConfigured || !url || !anonKey) {
    if (isAdminLoginRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = PUBLIC_LOGIN_PATH;
      redirectUrl.search = "?next=/admin&error=missing-env";
      return NextResponse.redirect(redirectUrl);
    }

    if (isProtectedRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = PUBLIC_LOGIN_PATH;
      redirectUrl.search = "";
      redirectUrl.searchParams.set("next", pathname);
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

  if (isAdminLoginRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = user ? "/admin" : PUBLIC_LOGIN_PATH;
    redirectUrl.search = user ? "" : "?next=/admin";
    return redirectWithCookies(redirectUrl, supabaseResponse);
  }

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = PUBLIC_LOGIN_PATH;
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return redirectWithCookies(redirectUrl, supabaseResponse);
  }

  if (isPublicAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/conta";
    redirectUrl.search = "";
    return redirectWithCookies(redirectUrl, supabaseResponse);
  }

  return supabaseResponse;
}
