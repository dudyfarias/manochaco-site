import Link from "next/link";
import { getLocalCompetitionById } from "@/lib/data";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Competition, Match } from "@/types";
import { CompetitionBadge } from "./CompetitionBadge";
import { SmartImage } from "./SmartImage";

type MatchCardProps = {
  match: Match;
  compact?: boolean;
  competition?: Competition | null;
};

const resultLabels = {
  win: "Vitória",
  draw: "Empate",
  loss: "Derrota",
} as const;

export function MatchCard({
  match,
  compact = false,
  competition,
}: MatchCardProps) {
  const resolvedCompetition =
    competition ?? getLocalCompetitionById(match.competitionId);
  const hasScore =
    typeof match.home.score === "number" && typeof match.away.score === "number";
  const resultLabel = match.result ? resultLabels[match.result] : null;
  const opponent = match.opponent ?? match.away.name;
  const season = match.season ?? match.seasonSlug ?? new Date(match.date).getFullYear();

  return (
    <Link
      href={`/jogos/${match.slug}`}
      className={`group grid overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:border-[#d1a137]/70 ${
        compact ? "" : "md:grid-cols-[220px_1fr]"
      }`}
    >
      {!compact ? (
        <div className="relative min-h-52 bg-zinc-950 md:min-h-full">
          <SmartImage
            src={match.image}
            alt={`Imagem do jogo ${match.home.name} contra ${match.away.name}`}
            fallbackLabel={`${match.home.name} x ${match.away.name}`}
            fallbackText="Imagem da partida em breve"
            fill
            sizes="(max-width: 768px) 100vw, 220px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {resolvedCompetition ? (
            <CompetitionBadge kind={resolvedCompetition.slug}>
              {resolvedCompetition.shortName}
            </CompetitionBadge>
          ) : null}
          {resultLabel ? (
            <span className="rounded-md border border-zinc-200 bg-[#f7f5ef] px-2.5 py-1 text-xs font-black uppercase text-zinc-700">
              {resultLabel}
            </span>
          ) : null}
          <span className="text-sm text-zinc-500">
            {match.status === "scheduled"
              ? formatDateTime(match.date)
              : formatDate(match.date)}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <p className="text-right text-base font-bold text-zinc-950">
            {match.home.name}
          </p>
          <div className="min-w-20 rounded-md bg-zinc-950 px-3 py-2 text-center text-xl font-black text-white">
            {hasScore ? `${match.home.score} x ${match.away.score}` : "x"}
          </div>
          <p className="text-base font-bold text-zinc-950">{opponent}</p>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-600">{match.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-[#9a6a12]">
          <span>{match.stage ?? match.round}</span>
          <span>Temporada {season}</span>
          <span>{match.location ?? match.venue}</span>
        </div>
      </div>
    </Link>
  );
}
