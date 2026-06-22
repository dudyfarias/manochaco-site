import type { Metadata } from "next";
import {
  AdminCard,
  AdminEmptyState,
  AdminNotice,
  AdminPageTitle,
  AdminStatCard,
} from "@/components/admin/AdminUI";
import { reviewMemberProfile } from "@/lib/admin/actions";
import { listAdminMemberProfiles, listAdminPlayers } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/auth";
import { accountTypeLabels, memberStatusLabels } from "@/lib/account/types";

type MemberRegistrationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Cadastros de usuários",
};

const allowedRoles = ["super_admin", "sports_admin"] as const;

function formatBirthDate(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export default async function MemberRegistrationsPage({
  searchParams,
}: MemberRegistrationsPageProps) {
  await requireAdmin([...allowedRoles]);
  const params = await searchParams;

  let profiles: Awaited<ReturnType<typeof listAdminMemberProfiles>> = [];
  let players: Awaited<ReturnType<typeof listAdminPlayers>> = [];
  let loadError: unknown = null;

  try {
    [profiles, players] = await Promise.all([
      listAdminMemberProfiles(),
      listAdminPlayers(),
    ]);
  } catch (error) {
    loadError = error;
  }

  if (loadError) {
    return (
      <div>
        <AdminPageTitle
          eyebrow="Usuários"
          title="Cadastros do portal"
          description="Analise solicitações de vínculo com o Manochaco."
        />
        <AdminEmptyState
          title="Não foi possível carregar os cadastros"
          description={loadError instanceof Error ? loadError.message : "Verifique banco e permissões."}
        />
      </div>
    );
  }

  const pendingCount = profiles.filter((profile) => profile.status === "pending").length;
  const candidateCount = profiles.filter((profile) => profile.account_type === "candidate").length;
  const linkedCount = profiles.filter((profile) => profile.linked_player_id).length;

  return (
    <div>
      <AdminPageTitle
        eyebrow="Usuários"
        title="Cadastros do portal"
        description="Aprove pedidos, ajuste o tipo de conta e vincule jogadores existentes. Permissões administrativas continuam separadas."
      />
      <AdminNotice searchParams={params} />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total" value={profiles.length} detail="contas públicas" />
        <AdminStatCard label="Pendentes" value={pendingCount} detail="aguardando análise" />
        <AdminStatCard label="Querem jogar" value={candidateCount} detail={`${linkedCount} vinculada(s)`} />
      </div>

      <AdminCard className="mt-8">
        <div className="flex items-end justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-zinc-950">Solicitações e membros</h2>
            <p className="mt-1 text-sm text-zinc-500">Dados privados. Use apenas para gestão do relacionamento com o clube.</p>
          </div>
        </div>

        {profiles.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-500">Nenhum cadastro recebido.</p>
        ) : (
          <div className="divide-y divide-zinc-200">
            {profiles.map((profile) => (
              <form key={profile.id} action={reviewMemberProfile} className="py-6">
                <input type="hidden" name="id" value={profile.id} />
                <div className="grid gap-5 xl:grid-cols-[1.1fr_0.8fr_0.8fr_1fr_auto] xl:items-end">
                  <div>
                    <p className="text-lg font-black text-zinc-950">{profile.full_name}</p>
                    <p className="mt-1 text-sm text-zinc-600">{profile.email}</p>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                      {[profile.phone, profile.city, profile.preferred_position, formatBirthDate(profile.birth_date)]
                        .filter(Boolean)
                        .join(" · ") || "Sem dados adicionais"}
                    </p>
                  </div>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-zinc-500">Tipo de conta</span>
                    <select name="account_type" defaultValue={profile.account_type} className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold">
                      {Object.entries(accountTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-zinc-500">Status</span>
                    <select name="status" defaultValue={profile.status} className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold">
                      {Object.entries(memberStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase text-zinc-500">Vincular jogador</span>
                    <select name="linked_player_id" defaultValue={profile.linked_player_id ?? ""} className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold">
                      <option value="">Sem vínculo</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>{player.nickname} · {player.name}</option>
                      ))}
                    </select>
                  </label>

                  <button className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d1a137] bg-[#d1a137] px-4 py-2 text-sm font-black text-black hover:bg-[#f0c35d]">
                    Salvar
                  </button>
                </div>
              </form>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
