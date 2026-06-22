"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  accountMessageHref,
  formText,
  getSiteUrl,
  isValidEmail,
  nullableFormText,
  parseAccountType,
  parseBirthDate,
  rawFormText,
  safeInternalPath,
} from "./utils";

function validatePassword(password: string) {
  return password.length >= 8 && password.length <= 128;
}

export async function loginAccount(formData: FormData) {
  const email = formText(formData, "email", 254).toLowerCase();
  const password = rawFormText(formData, "password", 128);
  const next = safeInternalPath(formText(formData, "next", 300), "/conta");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/entrar?error=missing-env");
  }

  if (!isValidEmail(email) || !password) {
    redirect(accountMessageHref("/entrar", "error", "invalid"));
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(accountMessageHref("/entrar", "error", "invalid"));
  }

  const { data: admin } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (admin) {
    redirect(next.startsWith("/admin") ? next : "/admin");
  }

  if (next.startsWith("/admin")) {
    redirect("/conta?error=not-admin");
  }

  redirect(next);
}

export async function registerAccount(formData: FormData) {
  const fullName = formText(formData, "full_name", 120);
  const email = formText(formData, "email", 254).toLowerCase();
  const password = rawFormText(formData, "password", 128);
  const passwordConfirmation = rawFormText(
    formData,
    "password_confirmation",
    128,
  );
  const accountType = parseAccountType(formText(formData, "account_type", 30));
  const privacyAccepted = formData.get("privacy_accepted") === "on";
  const rawBirthDate = formText(formData, "birth_date", 10);

  if (fullName.length < 2 || !isValidEmail(email)) {
    redirect(accountMessageHref("/cadastro", "error", "invalid-data"));
  }

  if (!validatePassword(password)) {
    redirect(accountMessageHref("/cadastro", "error", "weak-password"));
  }

  if (password !== passwordConfirmation) {
    redirect(accountMessageHref("/cadastro", "error", "password-mismatch"));
  }

  if (!privacyAccepted) {
    redirect(accountMessageHref("/cadastro", "error", "privacy-required"));
  }

  if (rawBirthDate && !parseBirthDate(rawBirthDate)) {
    redirect(accountMessageHref("/cadastro", "error", "invalid-birth-date"));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/cadastro?error=missing-env");
  }

  const siteUrl = await getSiteUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/conta`,
      data: {
        full_name: fullName,
        account_type: accountType,
        phone: nullableFormText(formData, "phone", 30),
        city: nullableFormText(formData, "city", 100),
        preferred_position: nullableFormText(formData, "preferred_position", 60),
        birth_date: parseBirthDate(rawBirthDate),
        privacy_accepted: true,
      },
    },
  });

  if (error) {
    redirect(accountMessageHref("/cadastro", "error", "signup-failed"));
  }

  if (data.session) {
    redirect("/conta?welcome=1");
  }

  redirect(`/cadastro/confirmar?email=${encodeURIComponent(email)}`);
}

export async function logoutAccount() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/?loggedOut=1");
}

export async function updateAccountProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/entrar?error=missing-env");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/conta");
  }

  const rawBirthDate = formText(formData, "birth_date", 10);
  if (rawBirthDate && !parseBirthDate(rawBirthDate)) {
    redirect(accountMessageHref("/conta", "error", "invalid-birth-date"));
  }

  const fullName = formText(formData, "full_name", 120);
  if (fullName.length < 2) {
    redirect(accountMessageHref("/conta", "error", "invalid-data"));
  }

  const { error } = await supabase
    .from("member_profiles")
    .update({
      full_name: fullName,
      phone: nullableFormText(formData, "phone", 30),
      city: nullableFormText(formData, "city", 100),
      preferred_position: nullableFormText(formData, "preferred_position", 60),
      birth_date: parseBirthDate(rawBirthDate),
    })
    .eq("user_id", user.id);

  if (error) {
    redirect(accountMessageHref("/conta", "error", "save-failed"));
  }

  revalidatePath("/conta");
  redirect("/conta?saved=profile");
}

export async function requestPasswordReset(formData: FormData) {
  const email = formText(formData, "email", 254).toLowerCase();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/recuperar-senha?error=missing-env");
  }

  if (isValidEmail(email)) {
    const siteUrl = await getSiteUrl();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/confirm?next=/nova-senha`,
    });
  }

  redirect("/recuperar-senha?success=1");
}

export async function updateAccountPassword(formData: FormData) {
  const password = rawFormText(formData, "password", 128);
  const confirmation = rawFormText(formData, "password_confirmation", 128);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/entrar?error=missing-env");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?next=/nova-senha");
  }

  if (!validatePassword(password)) {
    redirect("/nova-senha?error=weak-password");
  }

  if (password !== confirmation) {
    redirect("/nova-senha?error=password-mismatch");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/nova-senha?error=save-failed");
  }

  redirect("/conta?saved=password");
}
