import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AdminButtonLink,
  AdminCard,
  AdminNotice,
  AdminPageTitle,
  Field,
  SelectField,
  SubmitButton,
  TextAreaField,
} from "@/components/admin/AdminUI";
import {
  deletePlayerMatchStat,
  savePlayerMatchStat,
  updateMatch,
} from "@/lib/admin/actions";
import {
  getAdminMatch,
  listAdminCompetitions,
  listAdminPlayers,
  listAdminSeasons,
  listPlayerMatchStats,
} from "@/lib/admin/data";

type EditMatchPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin - Editar jogo",
};

export default async function EditMatchPage({
  params,
  searchParams,
}: EditMatchPageProps) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [match, competitions, seasons, players, stats] = await Promise.all([
    getAdminMatch(id),
    listAdminCompetitions(),
    listAdminSeasons(),
    listAdminPlayers(),
    listPlayerMatchStats(id),
  ]);

  if (!match) {
    notFound();
  }

  return (
    <div>
      <AdminPageTitle
        eyebrow="Jogos"
        title={`Manochaco x ${match.opponent}`}
        description="Edite o placar, contexto da partida e estatísticas individuais."
        action={<AdminButtonLink href="/admin/jogos" tone="secondary">Voltar</AdminButtonLink>}
      />
      <AdminNotice searchParams={resolvedSearchParams} />

      <AdminCard className="mt-6">
        <form action={updateMatch} className="grid gap-5 md:grid-cols-2">
          <input type="hidden" name="id" value={match.id} />
          <Field label="Adversário" name="opponent" defaultValue={match.opponent} required />
          <Field label="Slug" name="slug" defaultValue={match.slug} />
          <Field label="Data" name="date" type="date" defaultValue={match.date} />
          <SelectField label="Campeonato" name="competition_id" defaultValue={match.competition_id}>
            <option value="">A definir</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Temporada" name="season_id" defaultValue={match.season_id}>
            <option value="">A definir</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </SelectField>
          <Field label="Fase" name="stage" defaultValue={match.stage} />
          <Field label="Local" name="location" defaultValue={match.location} />
          <Field label="Imagem de capa" name="cover_image_url" defaultValue={match.cover_image_url} />
          <Field label="Gols Manochaco" name="manochaco_score" type="number" defaultValue={match.manochaco_score} />
          <Field label="Gols adversário" name="opponent_score" type="number" defaultValue={match.opponent_score} />
          <div className="md:col-span-2">
            <TextAreaField label="Resumo" name="summary" defaultValue={match.summary} />
          </div>
          <div className="md:col-span-2">
            <SubmitButton>Salvar jogo</SubmitButton>
          </div>
        </form>
      </AdminCard>

      <div className="mt-8 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <AdminCard>
          <h2 className="text-xl font-black">Adicionar estatística do jogador</h2>
          <form action={savePlayerMatchStat} className="mt-5 grid gap-4">
            <input type="hidden" name="match_id" value={match.id} />
            <SelectField label="Jogador" name="player_id">
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.nickname} - {player.name}
                </option>
              ))}
            </SelectField>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Gols" name="goals" type="number" defaultValue={0} />
              <Field label="Assistências" name="assists" type="number" defaultValue={0} />
              <Field label="Amarelos" name="yellow_cards" type="number" defaultValue={0} />
              <Field label="Vermelhos" name="red_cards" type="number" defaultValue={0} />
              <Field label="Gols sofridos" name="goals_conceded" type="number" />
            </div>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input name="was_present" type="checkbox" defaultChecked />
              Presente na partida
            </label>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input name="was_goalkeeper" type="checkbox" />
              Atuou como goleiro
            </label>
            <SubmitButton>Salvar estatística</SubmitButton>
          </form>
        </AdminCard>

        <AdminCard>
          <h2 className="text-xl font-black">Estatísticas cadastradas</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-zinc-100">
                <tr>
                  <th className="px-3 py-2">Jogador</th>
                  <th className="px-3 py-2">G</th>
                  <th className="px-3 py-2">A</th>
                  <th className="px-3 py-2">CA</th>
                  <th className="px-3 py-2">CV</th>
                  <th className="px-3 py-2">Goleiro</th>
                  <th className="px-3 py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {stats.map((stat) => (
                  <tr key={stat.id}>
                    <td className="px-3 py-2 font-black">
                      {stat.players?.nickname ?? stat.players?.name ?? stat.player_id}
                    </td>
                    <td className="px-3 py-2">{stat.goals}</td>
                    <td className="px-3 py-2">{stat.assists}</td>
                    <td className="px-3 py-2">{stat.yellow_cards}</td>
                    <td className="px-3 py-2">{stat.red_cards}</td>
                    <td className="px-3 py-2">
                      {stat.was_goalkeeper ? `Sim (${stat.goals_conceded ?? 0})` : "Não"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <form action={deletePlayerMatchStat}>
                        <input type="hidden" name="id" value={stat.id} />
                        <input type="hidden" name="match_id" value={match.id} />
                        <button className="font-black text-red-700">Remover</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.length === 0 ? (
              <p className="py-6 text-sm text-zinc-500">
                Nenhuma estatística individual cadastrada.
              </p>
            ) : null}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
