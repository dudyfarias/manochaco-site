import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompetitionBadge } from "@/components/CompetitionBadge";
import { EmptyState } from "@/components/EmptyState";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SectionTitle } from "@/components/SectionTitle";
import { SmartImage } from "@/components/SmartImage";
import { StatCard } from "@/components/StatCard";
import {
  getAlbumForMatch,
  getCompetitionById,
  getMatchBySlug,
  getMatches,
  getPhotosForMatch,
  getPlayers,
} from "@/lib/data";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Player } from "@/types";

type MatchPageProps = {
  params: Promise<{ slug: string }>;
};

const resultLabels = {
  win: "Vitória",
  draw: "Empate",
  loss: "Derrota",
} as const;

function isPlayer(player: Player | undefined): player is Player {
  return Boolean(player);
}

export async function generateStaticParams() {
  const matches = await getMatches();

  return matches.map((match) => ({
    slug: match.slug,
  }));
}

export async function generateMetadata({
  params,
}: MatchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const match = await getMatchBySlug(slug);

  if (!match) {
    return {
      title: "Partida não encontrada",
    };
  }

  return {
    title: `${match.home.name} x ${match.away.name}`,
    description: match.summary,
  };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { slug } = await params;
  const match = await getMatchBySlug(slug);

  if (!match) {
    notFound();
  }

  const [competition, matchPhotos, matchAlbum, players] = await Promise.all([
    getCompetitionById(match.competitionId),
    getPhotosForMatch(match.id, match.photoIds),
    getAlbumForMatch(match.id),
    getPlayers(),
  ]);
  const playersBySlug = new Map(players.map((player) => [player.slug, player]));
  const hasScore =
    typeof match.home.score === "number" && typeof match.away.score === "number";
  const resultLabel = match.result ? resultLabels[match.result] : null;
  const season = match.season ?? match.seasonSlug ?? new Date(match.date).getFullYear();
  const relatedPlayers = match.relatedPlayerSlugs
    .map((playerSlug) => playersBySlug.get(playerSlug))
    .filter(isPlayer);

  return (
    <div className="bg-[#f7f5ef]">
      <section className="relative overflow-hidden bg-black text-white">
        <SmartImage
          src={match.image}
          alt={`Imagem da partida ${match.home.name} contra ${match.away.name}`}
          fallbackLabel={`${match.home.name} x ${match.away.name}`}
          fallbackText="Foto da partida em breve"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              {competition ? (
                <CompetitionBadge kind={competition.slug}>
                  {competition.shortName}
                </CompetitionBadge>
              ) : null}
              {resultLabel ? (
                <span className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase text-zinc-100">
                  {resultLabel}
                </span>
              ) : null}
              <span className="text-sm font-semibold text-zinc-300">
                {match.status === "scheduled"
                  ? formatDateTime(match.date)
                  : formatDate(match.date)}
              </span>
            </div>
            <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <h1 className="text-right text-3xl font-black sm:text-5xl">
                {match.home.name}
              </h1>
              <div className="rounded-lg border border-[#d1a137] bg-[#d1a137] px-4 py-3 text-3xl font-black text-black sm:text-5xl">
                {hasScore ? `${match.home.score} x ${match.away.score}` : "x"}
              </div>
              <h2 className="text-3xl font-black sm:text-5xl">
                {match.away.name}
              </h2>
            </div>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-200">
              {match.summary}
            </p>
            <div className="mt-8">
              <Link
                href="/jogos"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-[#d1a137] hover:text-[#f0c35d]"
              >
                Voltar aos jogos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8">
        <StatCard
          label="Competição"
          value={competition?.shortName ?? "-"}
          detail={match.stage ?? match.round}
        />
        <StatCard label="Temporada" value={season} detail="recorte anual" />
        <StatCard label="Local" value={match.location ?? match.venue} detail="Campo ou arena" />
        <StatCard
          label="Status"
          value={match.status === "played" ? "Finalizado" : "Agendado"}
          detail={match.status === "played" ? "Planilha" : "Agenda local"}
        />
        <StatCard
          label="Fotos"
          value={matchPhotos.length}
          detail="Relacionadas à partida"
        />
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <SectionTitle
              eyebrow="Destaques"
              title="Resumo da partida"
              description="Bloco pronto para receber súmula, escalação, melhores momentos e estatísticas de jogo."
            />
          </div>
          <div className="space-y-3">
            {match.highlights.length > 0 ? (
              match.highlights.map((highlight) => (
                <article
                  key={highlight}
                  className="rounded-lg border border-zinc-200 bg-[#f7f5ef] p-5"
                >
                  <p className="text-base font-bold leading-7 text-zinc-950">
                    {highlight}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                title="Resumo em construção"
                description="A súmula detalhada desta partida será adicionada quando os dados por jogo forem normalizados."
              />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Participações"
          title="Jogadores relacionados"
          description="Contribuições por jogador serão preenchidas quando a súmula por partida estiver normalizada."
        />
        {match.contributions.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {match.contributions.map((contribution) => {
              const player = playersBySlug.get(contribution.playerSlug);

              if (!player) {
                return null;
              }

              return (
                <Link
                  key={`${match.id}-${contribution.playerSlug}`}
                  href={`/jogadores/${player.slug}`}
                  className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-[#d1a137]"
                >
                  <p className="text-sm font-semibold uppercase text-[#9a6a12]">
                    {player.position}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-zinc-950">
                    {player.nickname}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600">
                    {contribution.goals ?? 0} gol
                    {(contribution.goals ?? 0) === 1 ? "" : "s"} ·{" "}
                    {contribution.assists ?? 0} assistência
                    {(contribution.assists ?? 0) === 1 ? "" : "s"}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : relatedPlayers.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedPlayers.map((player) => (
              <Link
                key={`${match.id}-${player.slug}`}
                href={`/jogadores/${player.slug}`}
                className="rounded-lg border border-zinc-200 bg-white p-5 hover:border-[#d1a137]"
              >
                <p className="text-sm font-semibold uppercase text-[#9a6a12]">
                  {player.position}
                </p>
                <h3 className="mt-2 text-xl font-black text-zinc-950">
                  {player.nickname}
                </h3>
                <p className="mt-3 text-sm text-zinc-600">{player.fullName}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              title="Jogadores relacionados ainda não cadastrados"
              description="A estrutura está pronta para receber escalação, gols e assistências por partida em uma próxima fase."
            />
          </div>
        )}
      </section>

      <section className="bg-zinc-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Galeria"
            title="Fotos relacionadas"
            description="Registros conectados à partida e às marcações de jogadores."
            tone="dark"
          />
          {matchAlbum ? (
            <div className="mt-5">
              <Link
                href={`/galeria/${matchAlbum.slug}`}
                className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-[#d1a137] hover:text-[#f0c35d]"
              >
                Ver álbum completo
              </Link>
            </div>
          ) : null}
          <div className="mt-10">
            {matchPhotos.length > 0 ? (
              <PhotoGrid photos={matchPhotos} tone="dark" featured />
            ) : (
              <EmptyState
                dark
                title="Sem fotos relacionadas"
                description="Quando as fotos por jogo forem marcadas, este bloco será preenchido automaticamente."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
