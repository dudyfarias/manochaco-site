import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { EmptyState } from "@/components/EmptyState";
import { PlayerCard } from "@/components/PlayerCard";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import { getPlayers } from "@/lib/data";
import {
  filterPlayers,
  getSingleParam,
  makeFilterHref,
  type SearchParamsRecord,
} from "@/lib/filters";
import type { PlayerStatus } from "@/types";

export const metadata: Metadata = {
  title: "Jogadores",
  description:
    "Jogadores do Clube Atlético Manochaco com perfis individuais, números e fotos relacionadas.",
};

type JogadoresPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

const statusOptions: { label: string; value: PlayerStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Ativos", value: "active" },
  { label: "Ex-jogadores", value: "former" },
  { label: "Comissão", value: "staff" },
];

const sortOptions = [
  { label: "Nome", value: "name" },
  { label: "Mais jogos", value: "matches" },
  { label: "Mais gols", value: "goals" },
  { label: "Mais assistências", value: "assists" },
] as const;

function FilterChip({
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
      className={`rounded-md border px-4 py-2 text-sm font-bold transition ${
        active
          ? "border-zinc-950 bg-zinc-950 text-white"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-[#d1a137] hover:text-[#9a6a12]"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function JogadoresPage({ searchParams }: JogadoresPageProps) {
  const resolvedSearchParams = await searchParams;
  const players = await getPlayers();
  const status = getSingleParam(resolvedSearchParams, "status") as
    | PlayerStatus
    | "all";
  const sort = getSingleParam(resolvedSearchParams, "sort", "name") as
    | "name"
    | "matches"
    | "goals"
    | "assists";
  const filteredPlayers = filterPlayers(players, { status, sort });
  const activeCount = players.filter((player) => player.status === "active").length;
  const formerCount = players.filter((player) => player.status === "former").length;
  const staffCount = players.filter((player) => player.status === "staff").length;
  const selectedStatusLabel =
    statusOptions.find((option) => option.value === status)?.label ?? "Todos";

  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:px-8">
          <div>
            <SectionTitle
              eyebrow="Jogadores"
              title="Atletas históricos do Manochaco"
              description="A página mostra por padrão todos os jogadores da aba Estatística Histórica da planilha. Use os filtros para ver ativos, ex-jogadores e comissão."
              tone="dark"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/comissao-tecnica" variant="ghost">
                Ver comissão técnica
              </ButtonLink>
              <ButtonLink href="/estatisticas">Ver estatísticas</ButtonLink>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <StatCard
              dark
              label="Históricos"
              value={players.length}
              detail="jogadores da planilha"
            />
            <StatCard dark label="Ativos" value={activeCount} detail="grupo atual" />
            <StatCard
              dark
              label="Ex-jogadores"
              value={formerCount}
              detail="base histórica"
            />
            <StatCard
              dark
              label="Comissão"
              value={staffCount}
              detail="também atletas"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="space-y-5 rounded-lg border border-zinc-200 bg-white p-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase text-zinc-500">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  href={makeFilterHref("/jogadores", resolvedSearchParams, {
                    status: option.value,
                  })}
                  active={
                    option.value === "all" ? status === "all" : status === option.value
                  }
                >
                  {option.label}
                </FilterChip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-black uppercase text-zinc-500">
              Ordenar por
            </p>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  href={makeFilterHref("/jogadores", resolvedSearchParams, {
                    sort: option.value,
                  })}
                  active={sort === option.value}
                >
                  {option.label}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[#9a6a12]">
              {selectedStatusLabel}
            </p>
            <h2 className="mt-1 text-3xl font-black text-zinc-950">
              {filteredPlayers.length} jogadores
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-600">
            Todos os cards abrem o perfil individual, com estatísticas, fotos
            relacionadas e estrutura pronta para súmula por jogo.
          </p>
        </div>

        {filteredPlayers.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum jogador encontrado"
            description="Não há atletas cadastrados para o filtro selecionado."
          />
        )}
      </section>
    </div>
  );
}
