import type { Metadata } from "next";
import { AdminCard, AdminPageTitle } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/auth";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Admin - Configurações",
};

export default async function AdminSettingsPage() {
  const context = await requireAdmin();
  const env = getSupabasePublicEnv();

  return (
    <div>
      <AdminPageTitle
        eyebrow="Configurações"
        title="Configurações administrativas"
        description="Resumo do ambiente e da sessão atual."
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <AdminCard>
          <h2 className="text-xl font-black">Usuário</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-black text-zinc-500">E-mail</dt>
              <dd>{context.user.email}</dd>
            </div>
            <div>
              <dt className="font-black text-zinc-500">Role</dt>
              <dd>{context.profile.role}</dd>
            </div>
          </dl>
        </AdminCard>
        <AdminCard>
          <h2 className="text-xl font-black">Supabase</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-black text-zinc-500">URL pública configurada</dt>
              <dd>{env.url ? "Sim" : "Não"}</dd>
            </div>
            <div>
              <dt className="font-black text-zinc-500">Anon key configurada</dt>
              <dd>{env.anonKey ? "Sim" : "Não"}</dd>
            </div>
          </dl>
        </AdminCard>
      </div>
    </div>
  );
}
