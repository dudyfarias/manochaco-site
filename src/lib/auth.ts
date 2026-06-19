import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const adminRoles = [
  "super_admin",
  "sports_admin",
  "finance_admin",
  "photo_editor",
  "viewer",
] as const;

export type AdminRole = (typeof adminRoles)[number];

export type AdminProfile = {
  id: string;
  userId: string;
  email?: string | null;
  name?: string | null;
  fullName?: string | null;
  role: AdminRole;
};

export type AdminContext = {
  user: User;
  profile: AdminProfile;
};

export function isAdminRole(value: string | null | undefined): value is AdminRole {
  return adminRoles.includes(value as AdminRole);
}

function normalizeProfile(row: {
  id: string;
  user_id: string;
  email?: string | null;
  name?: string | null;
  full_name?: string | null;
  role?: string | null;
}): AdminProfile {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    name: row.name,
    fullName: row.full_name,
    role: isAdminRole(row.role) ? row.role : "viewer",
  };
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id, user_id, email, name, full_name, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  return {
    user,
    profile: normalizeProfile(profile),
  };
}

export async function requireAdmin(allowedRoles?: AdminRole[]) {
  const context = await getAdminContext();

  if (!context) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    redirect(user ? "/conta?error=not-admin" : "/entrar?next=/admin");
  }

  if (allowedRoles && !allowedRoles.includes(context.profile.role)) {
    redirect("/admin?error=forbidden");
  }

  return context;
}

export function canManageSports(role: AdminRole) {
  return role === "super_admin" || role === "sports_admin";
}

export function canManagePhotos(role: AdminRole) {
  return (
    role === "super_admin" ||
    role === "sports_admin" ||
    role === "photo_editor"
  );
}

export function canManageFinance(role: AdminRole) {
  return role === "super_admin" || role === "finance_admin";
}
