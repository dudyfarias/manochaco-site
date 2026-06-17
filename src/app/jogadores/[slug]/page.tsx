import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { MatchCard } from "@/components/MatchCard";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import { players } from "@/data/players";
import {
  appearancesRanking,
  assistsRanking,
  scoringRanking,
} from "@/data/stats";
import {
  getMatchesForPlayer,
  getPhotosForPlayer,
  getPlayerBySlug,
} from "@/lib/data";

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

function findRankingPosition(playerSlug: string, ranking: typeof scoringRanking) {
  const index = ranking.findIndex((row) => row.playerSlug === playerSlug);
  return index >= 0 ? index + 1 : null;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);

  if (!player) {
    notFound();
  }

  const relatedPhotos = getPhotosForPlayer(player.slug);
  const relatedMatches = getMatchesForPlayer(player.slug);
  const scoringPosition = findRankingPosition(player.slug, scoringRanking);
  const assistsPosition = findRankingPosition(player.slug, assistsRanking);
  const appearancesPosition = findRankingPosition(player.slug, appearancesRanking);

  return (
    <div className="bg-[#f7f5ef]">
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900 shadow-2xl">
            <Image
              src={player.image}
              alt={`Foto de ${player.nickname}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-base font-semibold uppercase text-[#f0c35d]">
              {player.position} · camisa {player.number ?? "S/N"}
            </p>
            <h1 className="mt-4 text-6xl font-black leading-none sm:text-7xl">
              {player.nickname}
            </h1>
            <p className="mt-4 text-2xl font-bold text-white">
              {player.fullName}
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              {player.bio}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              <StatCard dark label="Jogos" value={player.stats.matches} />
              <StatCard dark label="Gols" value={player.stats.goals} />
              <StatCard dark label="Assists" value={player.stats.assists} />
              <StatCard dark label="Títulos" value={player.stats.titles} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <SectionTitle
            eyebrow="Resumo"
            title="Desempenho no elenco"
            description="Ranking e participação histórica do atleta nos dados iniciais do portal."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Artilharia"
            value={scoringPosition ? `${scoringPosition}º` : "-"}
            detail={`${player.stats.goals} gols`}
          />
          <StatCard
            label="Assistências"
            value={assistsPosition ? `${assistsPosition}º` : "-"}
            detail={`${player.stats.assists} assistências`}
          />
          <StatCard
            label="Presença"
            value={appearancesPosition ? `${appearancesPosition}º` : "-"}
            detail={`${player.stats.matches} jogos`}
          />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Fotos"
            title={`Fotos em que ${player.nickname} aparece`}
            description="Esta seção usa a relação mockada entre fotos e jogadores, simulando a marcação manual que virá em fase futura."
          />
          <div className="mt-10">
            {relatedPhotos.length > 0 ? (
              <PhotoGrid photos={relatedPhotos} />
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-[#f7f5ef] p-6">
                <p className="text-zinc-600">
                  Ainda não há fotos marcadas para este jogador.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow="Jogos"
            title="Partidas relacionadas"
            description="A relação de jogos também é mockada nesta fase, mas já segue o mesmo padrão por slug."
          />
          <ButtonLink href="/jogos" variant="secondary">
            Ver todos os jogos
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {relatedMatches.map((match) => (
            <MatchCard key={match.id} match={match} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
