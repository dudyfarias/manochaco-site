import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminButtonLink,
  AdminCard,
  AdminEmptyState,
  AdminNotice,
  AdminPageTitle,
  Field,
  SelectField,
} from "@/components/admin/AdminUI";
import { listAdminPlayers } from "@/lib/admin/data";

type AdminPlayersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Jogadores",
};

export default async function AdminPlayersPage({ searchParams }: AdminPlayersPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const status = typeof params.status === "string" ? params.status : "";
  const players = await listAdminPlayers();
  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      !q ||
      player.name.toLowerCase().includes(q) ||
      player.nickname.toLowerCase().includes(q);
    const matchesStatus = !status || player.status === status;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <AdminPageTitle
        eyebrow="Jogadores"
        title="Base de atletas"
        description="Jogadores, ex-jogadores e comissão técnica cadastrados no Supabase."
        action={<AdminButtonLink href="/admin/jogadores/novo">Adicionar jogador</AdminButtonLink>}
      />
      <AdminNotice searchParams={params} />

      <AdminCard className="mt-6">
        <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]" action="/admin/jogadores">
          <Field label="Buscar" name="q" defaultValue={q} placeholder="Nome ou apelido" />
          <SelectField label="Status" name="status" defaultValue={status}>
            <option value="">Todos</option>
            <option value="active">Ativos</option>
            <option value="former">Ex-jogadores</option>
            <option value="staff">Comissão</option>
          </SelectField>
          <button className="self-end rounded-md border border-zinc-300 px-4 py-3 text-sm font-black">
            Filtrar
          </button>
        </form>
      </AdminCard>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        {filteredPlayers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-zinc-950 text-white">
                <tr>
                  <th className="px-4 py-3">Apelido</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Posição</th>
                  <th className="px-4 py-3">Camisa</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredPlayers.map((player) => (
                  <tr key={player.id}>
                    <td className="px-4 py-3 font-black">{player.nickname}</td>
                    <td className="px-4 py-3">{player.name}</td>
                    <td className="px-4 py-3">{player.position ?? "A definir"}</td>
                    <td className="px-4 py-3">{player.shirt_number ?? "-"}</td>
                    <td className="px-4 py-3">{player.status}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/jogadores/${player.id}`}
                        className="font-black text-[#8a5b0b] hover:text-black"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <AdminEmptyState
            title="Nenhum jogador encontrado"
            description="Ajuste os filtros ou cadastre um novo jogador."
          />
        )}
      </div>
    </div>
  );
}
