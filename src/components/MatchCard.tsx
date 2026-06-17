import Image from "next/image";
import Link from "next/link";
import { getCompetitionById } from "@/lib/data";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Match } from "@/types";
import { CompetitionBadge } from "./CompetitionBadge";

type MatchCardProps = {
  match: Match;
  compact?: boolean;
};

export function MatchCard({ match, compact = false }: MatchCardProps) {
  const competition = getCompetitionById(match.competitionId);
  const hasScore =
    typeof match.home.score === "number" && typeof match.away.score === "number";

  return (
    <Link
      href={`/jogos/${match.slug}`}
      className={`group grid overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#d1a137]/70 hover:shadow-lg ${
        compact ? "" : "md:grid-cols-[220px_1fr]"
      }`}
    >
      {!compact ? (
        <div className="relative min-h-52 bg-zinc-950 md:min-h-full">
          <Image
            src={match.image}
            alt={`Imagem do jogo ${match.home.name} contra ${match.away.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 220px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {competition ? (
            <CompetitionBadge kind={competition.slug}>
              {competition.shortName}
            </CompetitionBadge>
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
          <p className="text-base font-bold text-zinc-950">{match.away.name}</p>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-600">{match.summary}</p>
        <p className="mt-4 text-sm font-semibold text-[#9a6a12]">
          {match.round} · {match.venue}
        </p>
      </div>
    </Link>
  );
}
