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
import {
  listAdminCompetitions,
  listAdminMatches,
  listAdminSeasons,
} from "@/lib/admin/data";

type AdminMatchesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Jogos",
};

export default async function AdminMatchesPage({ searchParams }: AdminMatchesPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const competitionId = typeof params.competition === "string" ? params.competition : "";
  const seasonId = typeof params.season === "string" ? params.season : "";
  const [matches, competitions, seasons] = await Promise.all([
    listAdminMatches(),
    listAdminCompetitions(),
    listAdminSeasons(),
  ]);
  const competitionById = new Map(competitions.map((item) => [item.id, item]));
  const seasonById = new Map(seasons.map((item) => [item.id, item]));
  const filteredMatches = matches.filter((match) => {
    const matchesSearch = !q || match.opponent.toLowerCase().includes(q);
    const matchesCompetition = !competitionId || match.competition_id === competitionId;
    const matchesSeason = !seasonId || match.season_id === seasonId;
    return matchesSearch && matchesCompetition && matchesSeason;
  });

  return (
    <div>
      <AdminPageTitle
        eyebrow="Jogos"
        title="Partidas e resultados"
        description="Cadastre jogos, placares, fases, locais e estatísticas individuais."
        action={<AdminButtonLink href="/admin/jogos/novo">Novo jogo</AdminButtonLink>}
      />
      <AdminNotice searchParams={params} />

      <AdminCard className="mt-6">
        <form className="grid gap-4 lg:grid-cols-[1fr_220px_180px_auto]" action="/admin/jogos">
          <Field label="Buscar adversário" name="q" defaultValue={q} />
          <SelectField label="Campeonato" name="competition" defaultValue={competitionId}>
            <option value="">Todos</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Temporada" name="season" defaultValue={seasonId}>
            <option value="">Todas</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </SelectField>
          <button className="self-end rounded-md border border-zinc-300 px-4 py-3 text-sm font-black">
            Filtrar
          </button>
        </form>
      </AdminCard>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        {filteredMatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-zinc-950 text-white">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Adversário</th>
                  <th className="px-4 py-3">Campeonato</th>
                  <th className="px-4 py-3">Temporada</th>
                  <th className="px-4 py-3">Placar</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredMatches.map((match) => (
                  <tr key={match.id}>
                    <td className="px-4 py-3">{match.date ?? "-"}</td>
                    <td className="px-4 py-3 font-black">{match.opponent}</td>
                    <td className="px-4 py-3">
                      {match.competition_id
                        ? competitionById.get(match.competition_id)?.name ?? "-"
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {match.season_id ? seasonById.get(match.season_id)?.name ?? "-" : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {match.manochaco_score} x {match.opponent_score}
                    </td>
                    <td className="px-4 py-3">{match.result}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/jogos/${match.id}`}
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
            title="Nenhum jogo encontrado"
            description="Ajuste os filtros ou cadastre uma nova partida."
          />
        )}
      </div>
    </div>
  );
}
