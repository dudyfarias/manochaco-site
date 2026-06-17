import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { EmptyState } from "@/components/EmptyState";
import { RankingTable } from "@/components/RankingTable";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import { competitions, matches, players, playerStatLines, seasons } from "@/data";
import {
  getSingleParam,
  makeFilterHref,
  normalizeFilter,
  type SearchParamsRecord,
} from "@/lib/filters";
import { formatRecord } from "@/lib/format";
import {
  calculateMatchStats,
  filterMatchesForStats,
  getRankingRows,
  type RankingMetric,
} from "@/lib/stats";

export const metadata: Metadata = {
  title: "Estatísticas",
  description:
    "Estatísticas históricas, rankings de artilharia, assistências e presença do CA Manochaco.",
};

type EstatisticasPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

const rankingOptions: {
  label: string;
  value: RankingMetric;
  title: string;
  description: string;
}[] = [
  {
    label: "Artilharia",
    value: "goals",
    title: "Artilheiros",
    description: "Ranking por gols marcados no recorte selecionado.",
  },
  {
    label: "Assistências",
    value: "assists",
    title: "Garçons",
    description: "Ranking por assistências registradas na base esportiva.",
  },
  {
    label: "Presença",
    value: "matches",
    title: "Mais jogos",
    description: "Ranking por partidas registradas na planilha do Manochaco.",
  },
  {
    label: "Participações",
    value: "goalParticipation",
    title: "Participação em gols",
    description: "Gols mais assistências no recorte selecionado.",
  },
  {
    label: "Amarelos",
    value: "yellowCards",
    title: "Cartões amarelos",
    description: "Cartões amarelos quando disponíveis na planilha.",
  },
  {
    label: "Vermelhos",
    value: "redCards",
    title: "Cartões vermelhos",
    description: "Cartões vermelhos quando disponíveis na planilha.",
  },
];

function formatGoalDifference(value: number) {
  return value > 0 ? `+${value}` : value.toString();
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
        active
          ? "border-[#d1a137] bg-[#d1a137] text-black"
          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-[#d1a137]/70 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function EstatisticasPage({
  searchParams,
}: EstatisticasPageProps) {
  const resolvedSearchParams = await searchParams;
  const competition = getSingleParam(resolvedSearchParams, "competition");
  const season = getSingleParam(resolvedSearchParams, "season");
  const requestedRanking = getSingleParam(
    resolvedSearchParams,
    "ranking",
    "goals",
  ) as RankingMetric;
  const selectedRanking =
    rankingOptions.find((option) => option.value === requestedRanking) ??
    rankingOptions[0];
  const filteredMatches = filterMatchesForStats(matches, { competition, season });
  const calculatedStats = calculateMatchStats(filteredMatches);
  const rankingRows = getRankingRows({
    players,
    statLines: playerStatLines,
    metric: selectedRanking.value,
    competition,
    season,
    limit: 10,
  });
  const hasMatchStats = calculatedStats.matches > 0;
  const selectedCompetition = competitions.find(
    (item) => item.id === normalizeFilter(competition),
  );
  const selectedSeason = seasons.find(
    (item) => item.slug === normalizeFilter(season),
  );
  const contextLabel = [
    selectedCompetition?.name ?? "Todos os campeonatos",
    selectedSeason?.label ?? "Todas as temporadas",
  ].join(" · ");

  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="Estatísticas"
              title="Números históricos do clube"
              description="Filtros por campeonato e temporada usando a base esportiva da planilha. Dados financeiros seguem fora do site público."
              tone="dark"
            />
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/campeonatos" variant="ghost">
                Ver campeonatos
              </ButtonLink>
              <ButtonLink href="/elenco" variant="ghost">
                Ver elenco
              </ButtonLink>
            </div>
          </div>

          <div className="mt-10 space-y-5">
            <div>
              <p className="mb-2 text-xs font-black uppercase text-zinc-500">
                Campeonato
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterLink
                  href={makeFilterHref("/estatisticas", resolvedSearchParams, {
                    competition: "all",
                  })}
                  active={!normalizeFilter(competition)}
                >
                  Todos
                </FilterLink>
                {competitions.map((item) => (
                  <FilterLink
                    key={item.id}
                    href={makeFilterHref("/estatisticas", resolvedSearchParams, {
                      competition: item.id,
                    })}
                    active={competition === item.id}
                  >
                    {item.shortName}
                  </FilterLink>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-black uppercase text-zinc-500">
                Temporada
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterLink
                  href={makeFilterHref("/estatisticas", resolvedSearchParams, {
                    season: "all",
                  })}
                  active={!normalizeFilter(season)}
                >
                  Todas
                </FilterLink>
                {seasons.map((item) => (
                  <FilterLink
                    key={item.id}
                    href={makeFilterHref("/estatisticas", resolvedSearchParams, {
                      season: item.slug,
                    })}
                    active={season === item.slug}
                  >
                    {item.label}
                  </FilterLink>
                ))}
              </div>
            </div>
          </div>

          {hasMatchStats ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                dark
                label="Jogos"
                value={calculatedStats.matches}
                detail={contextLabel}
              />
              <StatCard
                dark
                label="Campanha"
                value={formatRecord(
                  calculatedStats.wins,
                  calculatedStats.draws,
                  calculatedStats.losses,
                )}
                detail="vitórias, empates e derrotas"
              />
              <StatCard
                dark
                label="Gols"
                value={calculatedStats.goalsFor}
                detail={`${calculatedStats.goalsAgainst} sofridos`}
              />
              <StatCard
                dark
                label="Saldo"
                value={formatGoalDifference(calculatedStats.goalDifference)}
                detail="diferença de gols"
              />
              <StatCard
                dark
                label="Aproveitamento"
                value={`${calculatedStats.winRate}%`}
                detail="vitórias no recorte"
              />
              <StatCard
                dark
                label="Média pró"
                value={calculatedStats.averageGoalsFor}
                detail="gols por jogo"
              />
              <StatCard
                dark
                label="Média contra"
                value={calculatedStats.averageGoalsAgainst}
                detail="gols sofridos por jogo"
              />
              <StatCard
                dark
                label="Copa FutFudas"
                value={2}
                detail="títulos históricos"
              />
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                dark
                title="Não há estatísticas suficientes para este filtro."
                description="Os rankings podem existir por aba da planilha, mas não há partidas com placar para recalcular os cards neste recorte."
              />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="Rankings"
            title="Referências do Manochaco"
            description="Use os filtros para alternar rankings gerais, por campeonato ou por temporada."
          />
          <div className="flex flex-wrap gap-2">
            {rankingOptions.map((option) => (
              <Link
                key={option.value}
                href={makeFilterHref("/estatisticas", resolvedSearchParams, {
                  ranking: option.value,
                })}
                className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
                  selectedRanking.value === option.value
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-[#d1a137] hover:text-[#9a6a12]"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <RankingTable
            title={selectedRanking.title}
            description={`${selectedRanking.description} ${contextLabel}.`}
            rows={rankingRows}
          />
        </div>
      </section>
    </div>
  );
}
