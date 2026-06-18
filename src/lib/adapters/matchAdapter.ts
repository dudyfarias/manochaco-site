import type { Match, MatchResult, MatchStatus, Season } from "@/types";
import type { SupabaseCompetitionRow } from "./competitionAdapter";

export type SupabaseMatchRow = {
  id: string;
  slug: string;
  date?: string | null;
  opponent: string;
  competition_id?: string | null;
  season_id?: string | null;
  manochaco_score?: number | null;
  opponent_score?: number | null;
  result?: string | null;
  stage?: string | null;
  location?: string | null;
  summary?: string | null;
  cover_image_url?: string | null;
};

function toResult(result?: string | null): MatchResult | undefined {
  if (result === "win" || result === "draw" || result === "loss") {
    return result;
  }

  return undefined;
}

function toStatus(date?: string | null): MatchStatus {
  if (!date) {
    return "played";
  }

  return new Date(`${date}T00:00:00`).getTime() > Date.now()
    ? "scheduled"
    : "played";
}

export function adaptMatch(
  row: SupabaseMatchRow,
  relations: {
    competition?: SupabaseCompetitionRow;
    season?: Season;
  } = {},
): Match {
  const date = row.date ? `${row.date}T12:00:00-03:00` : new Date().toISOString();
  const manochacoScore = row.manochaco_score ?? 0;
  const opponentScore = row.opponent_score ?? 0;
  const result = toResult(row.result);
  const competitionSlug = relations.competition?.slug ?? row.competition_id ?? undefined;
  const seasonSlug = relations.season?.slug ?? row.season_id ?? undefined;
  const stage = row.stage ?? "A revisar";
  const location = row.location ?? "A revisar";

  return {
    id: row.id,
    slug: row.slug,
    date,
    competitionId: competitionSlug ?? "amistoso",
    round: stage,
    venue: location,
    status: toStatus(row.date),
    opponent: row.opponent,
    competition: competitionSlug,
    competitionSlug,
    season: relations.season?.name ?? seasonSlug,
    seasonSlug,
    manochacoScore,
    opponentScore,
    result,
    stage,
    location,
    home: {
      name: "Manochaco",
      score: row.date ? manochacoScore : undefined,
    },
    away: {
      name: row.opponent,
      score: row.date ? opponentScore : undefined,
    },
    image: row.cover_image_url ?? "/team/hero-home.jpg",
    summary:
      row.summary ??
      `Partida do Manochaco contra ${row.opponent}, preparada para revisão administrativa.`,
    highlights: row.summary ? [row.summary] : [],
    contributions: [],
    relatedPlayerSlugs: [],
    photoIds: [],
  };
}
