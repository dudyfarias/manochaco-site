import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { MatchCard } from "@/components/MatchCard";
import { SectionTitle } from "@/components/SectionTitle";
import { competitions, matches, seasons } from "@/data";
import {
  filterMatches,
  getSingleParam,
  makeFilterHref,
  normalizeFilter,
  type SearchParamsRecord,
} from "@/lib/filters";
import type { MatchResult } from "@/types";

export const metadata: Metadata = {
  title: "Jogos e resultados",
  description:
    "Agenda, resultados e detalhes de partidas do Clube Atlético Manochaco.",
};

type JogosPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

const resultOptions: { label: string; value: MatchResult | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Vitórias", value: "win" },
  { label: "Empates", value: "draw" },
  { label: "Derrotas", value: "loss" },
];

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

export default async function JogosPage({ searchParams }: JogosPageProps) {
  const resolvedSearchParams = await searchParams;
  const competition = getSingleParam(resolvedSearchParams, "competition");
  const season = getSingleParam(resolvedSearchParams, "season");
  const result = getSingleParam(resolvedSearchParams, "result") as
    | MatchResult
    | "all";
  const query = getSingleParam(resolvedSearchParams, "q", "");
  const filteredMatches = filterMatches(matches, {
    competition,
    season,
    result,
    query,
  }).sort((first, second) => second.date.localeCompare(first.date));
  const scheduledMatches = filteredMatches
    .filter((match) => match.status === "scheduled")
    .sort((first, second) => first.date.localeCompare(second.date));
  const playedMatches = filteredMatches.filter((match) => match.status === "played");

  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Jogos"
            title="Agenda e resultados"
            description="Filtre partidas por campeonato, temporada, resultado e adversário. Cada jogo tem página própria para detalhes e fotos."
            tone="dark"
          />

          <div className="mt-10 space-y-5">
            <div>
              <p className="mb-2 text-xs font-black uppercase text-zinc-500">
                Campeonato
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterLink
                  href={makeFilterHref("/jogos", resolvedSearchParams, {
                    competition: "all",
                  })}
                  active={!normalizeFilter(competition)}
                >
                  Todos
                </FilterLink>
                {competitions.map((item) => (
                  <FilterLink
                    key={item.id}
                    href={makeFilterHref("/jogos", resolvedSearchParams, {
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
                  href={makeFilterHref("/jogos", resolvedSearchParams, {
                    season: "all",
                  })}
                  active={!normalizeFilter(season)}
                >
                  Todas
                </FilterLink>
                {seasons.map((item) => (
                  <FilterLink
                    key={item.id}
                    href={makeFilterHref("/jogos", resolvedSearchParams, {
                      season: item.slug,
                    })}
                    active={season === item.slug}
                  >
                    {item.label}
                  </FilterLink>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-black uppercase text-zinc-500">
                Resultado
              </p>
              <div className="flex flex-wrap gap-2">
                {resultOptions.map((option) => (
                  <FilterLink
                    key={option.value}
                    href={makeFilterHref("/jogos", resolvedSearchParams, {
                      result: option.value,
                    })}
                    active={
                      option.value === "all"
                        ? !normalizeFilter(result)
                        : result === option.value
                    }
                  >
                    {option.label}
                  </FilterLink>
                ))}
              </div>
            </div>
          </div>

          <form action="/jogos" className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
            {normalizeFilter(competition) ? (
              <input type="hidden" name="competition" value={competition} />
            ) : null}
            {normalizeFilter(season) ? (
              <input type="hidden" name="season" value={season} />
            ) : null}
            {normalizeFilter(result) ? (
              <input type="hidden" name="result" value={result} />
            ) : null}
            <label className="sr-only" htmlFor="opponent-search">
              Buscar adversário
            </label>
            <input
              id="opponent-search"
              name="q"
              defaultValue={query}
              placeholder="Buscar por adversário"
              className="min-h-12 flex-1 rounded-md border border-white/15 bg-white/[0.06] px-4 text-sm font-semibold text-white outline-none placeholder:text-zinc-500 focus:border-[#d1a137]"
            />
            <button className="min-h-12 rounded-md border border-[#d1a137] bg-[#d1a137] px-5 text-sm font-black text-black transition hover:bg-[#f0c35d]">
              Buscar
            </button>
            {query ? (
              <Link
                href={makeFilterHref("/jogos", resolvedSearchParams, {
                  q: undefined,
                })}
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-black text-zinc-200 transition hover:border-[#d1a137]"
              >
                Limpar
              </Link>
            ) : null}
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {filteredMatches.length > 0 ? (
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="text-2xl font-black text-zinc-950">
                Próximos jogos
              </h2>
              <div className="mt-5 grid gap-5">
                {scheduledMatches.length > 0 ? (
                  scheduledMatches.map((match) => (
                    <MatchCard key={match.id} match={match} compact />
                  ))
                ) : (
                  <EmptyState
                    title="Sem próximos jogos neste filtro"
                    description="Quando houver agenda cadastrada para este recorte, ela aparecerá aqui."
                  />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-950">Resultados</h2>
              <div className="mt-5 grid gap-5">
                {playedMatches.length > 0 ? (
                  playedMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))
                ) : (
                  <EmptyState
                    title="Sem resultados encontrados"
                    description="Ajuste campeonato, temporada, resultado ou adversário para ampliar a busca."
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Nenhum jogo encontrado"
            description="Não há partidas cadastradas para os filtros selecionados."
          />
        )}
      </section>
    </div>
  );
}
