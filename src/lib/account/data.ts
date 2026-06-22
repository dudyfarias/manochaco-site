import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { AdminProfile, AdminRole } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccountType, MemberProfile, MemberStatus } from "./types";
import { isAccountType, isMemberStatus } from "./types";

type MemberProfileRow = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  account_type: string;
  status: string;
  linked_player_id: string | null;
  preferred_position: string | null;
  birth_date: string | null;
  privacy_accepted_at: string | null;
  created_at: string | null;
};

export type AccountContext = {
  user: User;
  member: MemberProfile | null;
  admin: AdminProfile | null;
};

function adaptMemberProfile(row: MemberProfileRow): MemberProfile {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    city: row.city,
    accountType: (isAccountType(row.account_type)
      ? row.account_type
      : "supporter") as AccountType,
    status: (isMemberStatus(row.status) ? row.status : "pending") as MemberStatus,
    linkedPlayerId: row.linked_player_id,
    preferredPosition: row.preferred_position,
    birthDate: row.birth_date,
    privacyAcceptedAt: row.privacy_accepted_at,
    createdAt: row.created_at,
  };
}

export async function getAccountContext(): Promise<AccountContext | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: member }, { data: admin }] = await Promise.all([
    supabase.from("member_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("admin_profiles")
      .select("id, user_id, email, name, full_name, role")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const role: AdminRole | null = isAdminRole(admin?.role) ? admin.role : null;

  return {
    user,
    member: member ? adaptMemberProfile(member as MemberProfileRow) : null,
    admin:
      admin && role
        ? {
            id: admin.id,
            userId: admin.user_id,
            email: admin.email,
            name: admin.name,
            fullName: admin.full_name,
            role,
          }
        : null,
  };
}

export async function requireAccount() {
  const context = await getAccountContext();

  if (!context) {
    redirect("/entrar?next=/conta");
  }

  return context;
}
