import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { EmptyState } from "@/components/EmptyState";
import { MatchCard } from "@/components/MatchCard";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SectionTitle } from "@/components/SectionTitle";
import { SmartImage } from "@/components/SmartImage";
import { StatCard } from "@/components/StatCard";
import { players } from "@/data";
import {
  getMatchesForPlayer,
  getPhotosForPlayer,
  getPlayerBySlug,
} from "@/lib/data";
import { generateRankingFromPlayers, type RankingMetric } from "@/lib/stats";
import type { RankingRow } from "@/types";

type PlayerPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return players.map((player) => ({
    slug: player.slug,
  }));
}

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);

  if (!player) {
    return {
      title: "Jogador não encontrado",
    };
  }

  return {
    title: player.nickname,
    description: `Perfil de ${player.fullName}, ${player.nickname}, atleta do Clube Atlético Manochaco.`,
  };
}

function findRankingPosition(playerSlug: string, ranking: RankingRow[]) {
  const index = ranking.findIndex((row) => row.playerSlug === playerSlug);
  return index >= 0 ? index + 1 : null;
}

function getRankingPosition(playerSlug: string, metric: RankingMetric) {
  return findRankingPosition(
    playerSlug,
    generateRankingFromPlayers(players, metric, players.length),
  );
}

function formatAverage(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);

  if (!player) {
    notFound();
  }

  const relatedPhotos = getPhotosForPlayer(player.slug);
  const relatedMatches = getMatchesForPlayer(player.slug);
  const scoringPosition = getRankingPosition(player.slug, "goals");
  const assistsPosition = getRankingPosition(player.slug, "assists");
  const appearancesPosition = getRankingPosition(player.slug, "matches");
  const participationPosition = getRankingPosition(player.slug, "goalParticipation");
  const goalParticipation =
    player.stats.goalParticipation ?? player.stats.goals + player.stats.assists;
  const goalsPerMatch = player.stats.matches
    ? player.stats.goals / player.stats.matches
    : 0;
  const assistsPerMatch = player.stats.matches
    ? player.stats.assists / player.stats.matches
    : 0;
  const statusLabel =
    player.status === "active"
      ? "Ativo"
      : player.status === "staff"
        ? "Comissão"
        : "Histórico";
  const rankingCards = [
    {
      label: "Artilharia",
      value: scoringPosition ? `${scoringPosition}º` : "-",
      detail: scoringPosition
        ? `${player.stats.goals} gols`
        : "Sem posição histórica",
    },
    {
      label: "Assistências",
      value: assistsPosition ? `${assistsPosition}º` : "-",
      detail: assistsPosition
        ? `${player.stats.assists} assistências`
        : "Sem posição histórica",
    },
    {
      label: "Presença",
      value: appearancesPosition ? `${appearancesPosition}º` : "-",
      detail: appearancesPosition
        ? `${player.stats.matches} jogos`
        : "Sem posição histórica",
    },
  ];

  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900">
            <SmartImage
              src={player.profileImage ?? player.image}
              alt={`Foto de ${player.nickname}`}
              fallbackLabel={player.nickname}
              fallbackText="Foto do atleta em breve"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5">
              <p className="text-sm font-black uppercase text-[#f0c35d]">
                Camisa {player.shirtNumber ?? player.number ?? "S/N"}
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                Desde {player.joinedYear}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-black uppercase text-[#f0c35d]">
              {player.position} · Clube Atlético Manochaco
            </p>
            <h1 className="mt-4 text-5xl font-black leading-none sm:text-7xl lg:text-8xl">
              {player.nickname}
            </h1>
            <p className="mt-4 text-2xl font-bold text-white">
              {player.fullName}
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              {player.bio}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs font-black uppercase text-zinc-400">
                  Posição
                </p>
                <p className="mt-2 text-xl font-black">{player.position}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs font-black uppercase text-zinc-400">
                  Camisa
                </p>
                <p className="mt-2 text-xl font-black">
                  {player.shirtNumber ?? player.number ?? "S/N"}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs font-black uppercase text-zinc-400">
                  Status
                </p>
                <p className="mt-2 text-xl font-black">{statusLabel}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <StatCard dark label="Jogos" value={player.stats.matches} />
              <StatCard dark label="Gols" value={player.stats.goals} />
              <StatCard dark label="Assists" value={player.stats.assists} />
              <StatCard dark label="Part. gols" value={goalParticipation} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:px-8">
        <div>
          <SectionTitle
            eyebrow="Resumo"
            title="Desempenho no elenco"
            description="Ranking e participação histórica do atleta com base na planilha oficial do Manochaco."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {rankingCards.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              detail={card.detail}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Participação"
            value={goalParticipation}
            detail="gols + assistências"
          />
          <StatCard
            label="Gols por jogo"
            value={formatAverage(goalsPerMatch)}
            detail="média histórica"
          />
          <StatCard
            label="Assists por jogo"
            value={formatAverage(assistsPerMatch)}
            detail="média histórica"
          />
          <StatCard
            label="Cartões"
            value={`${player.stats.yellowCards ?? 0}/${player.stats.redCards ?? 0}`}
            detail="amarelos/vermelhos"
          />
          <StatCard
            label="Ranking part."
            value={participationPosition ? `${participationPosition}º` : "-"}
            detail="participação em gols"
          />
        </div>
      </section>

      <section className="bg-zinc-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Fotos"
            title={`Fotos em que ${player.nickname} aparece`}
            description="Esta seção usa a relação local entre fotos e jogadores, simulando a marcação manual que virá em fase futura."
            tone="dark"
          />
          <div className="mt-10">
            {relatedPhotos.length > 0 ? (
              <PhotoGrid photos={relatedPhotos} tone="dark" featured />
            ) : (
              <EmptyState
                dark
                title="Ainda não há fotos marcadas"
                description="Quando a marcação manual por jogador avançar, as fotos deste atleta aparecerão aqui."
              />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow="Jogos"
            title="Partidas relacionadas"
            description="Os jogos históricos vêm da planilha; relações por atleta serão refinadas quando houver súmula por partida."
          />
          <ButtonLink href="/jogos" variant="secondary">
            Ver todos os jogos
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {relatedMatches.length > 0 ? (
            relatedMatches.map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))
          ) : (
            <EmptyState
              title="Ainda não há jogos relacionados"
              description="A relação atleta-partida será preenchida quando a súmula por jogo estiver estruturada."
            />
          )}
        </div>
      </section>
    </div>
  );
}
