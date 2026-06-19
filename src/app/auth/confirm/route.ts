import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeInternalPath } from "@/lib/account/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedOtpTypes = new Set<EmailOtpType>([
  "email",
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
]);

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const requestedType = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const next = safeInternalPath(request.nextUrl.searchParams.get("next"), "/conta");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/entrar?error=missing-env", request.url));
  }

  let error: Error | null = null;

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else if (tokenHash && requestedType && allowedOtpTypes.has(requestedType)) {
    const result = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: requestedType,
    });
    error = result.error;
  } else {
    error = new Error("Parâmetros de confirmação ausentes.");
  }

  if (error) {
    return NextResponse.redirect(new URL("/entrar?error=confirmation", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
