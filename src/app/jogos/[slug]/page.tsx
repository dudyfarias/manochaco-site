import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompetitionBadge } from "@/components/CompetitionBadge";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import { matches } from "@/data/matches";
import {
  getCompetitionById,
  getMatchBySlug,
  getPlayerBySlug,
} from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { photos } from "@/data/photos";

type MatchPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return matches.map((match) => ({
    slug: match.slug,
  }));
}

export async function generateMetadata({
  params,
}: MatchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const match = getMatchBySlug(slug);

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
  const match = getMatchBySlug(slug);

  if (!match) {
    notFound();
  }

  const competition = getCompetitionById(match.competitionId);
  const hasScore =
    typeof match.home.score === "number" && typeof match.away.score === "number";
  const matchPhotos = photos.filter((photo) => match.photoIds.includes(photo.id));

  return (
    <div className="bg-[#f7f5ef]">
      <section className="relative overflow-hidden bg-black text-white">
        <Image
          src={match.image}
          alt={`Imagem da partida ${match.home.name} contra ${match.away.name}`}
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
              <span className="text-sm font-semibold text-zinc-300">
                {formatDateTime(match.date)}
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
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <StatCard label="Competição" value={competition?.shortName ?? "-"} detail={match.round} />
        <StatCard label="Local" value={match.venue} detail="Campo ou arena" />
        <StatCard
          label="Status"
          value={match.status === "played" ? "Finalizado" : "Agendado"}
          detail="Dados mockados"
        />
        <StatCard
          label="Fotos"
          value={match.photoIds.length}
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
            {match.highlights.map((highlight) => (
              <article
                key={highlight}
                className="rounded-lg border border-zinc-200 bg-[#f7f5ef] p-5"
              >
                <p className="text-base font-bold leading-7 text-zinc-950">
                  {highlight}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {match.contributions.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Participações"
            title="Gols e assistências"
            description="Contribuições mockadas por jogador, ligadas pelo slug do atleta."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {match.contributions.map((contribution) => {
              const player = getPlayerBySlug(contribution.playerSlug);

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
        </section>
      ) : null}

      {matchPhotos.length > 0 ? (
        <section className="bg-zinc-950 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Galeria"
              title="Fotos relacionadas"
              description="Registros conectados à partida e às marcações de jogadores."
              tone="dark"
            />
            <div className="mt-10">
              <PhotoGrid photos={matchPhotos} />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
