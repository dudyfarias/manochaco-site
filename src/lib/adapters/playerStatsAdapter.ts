import type { PlayerStatLine } from "@/types";

export type SupabasePlayerCompetitionStatRow = {
  id: string;
  player_id: string;
  competition_id: string;
  season_id: string;
  source_sheet: string;
  matches: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  clean_sheets: number;
  goals_conceded: number;
  players?: {
    slug?: string | null;
    name?: string | null;
    nickname?: string | null;
  } | null;
  competitions?: {
    slug?: string | null;
    name?: string | null;
  } | null;
  seasons?: {
    slug?: string | null;
    name?: string | null;
  } | null;
};

export function adaptPlayerCompetitionStat(
  row: SupabasePlayerCompetitionStatRow,
): PlayerStatLine {
  const playerSlug = row.players?.slug ?? row.player_id;
  const competitionSlug = row.competitions?.slug ?? row.competition_id;
  const seasonSlug = row.seasons?.slug ?? row.season_id;

  return {
    id: row.id,
    playerSlug,
    fullName: row.players?.name ?? playerSlug,
    nickname: row.players?.nickname ?? playerSlug,
    competitionId: competitionSlug,
    competitionSlug,
    competitionName: row.competitions?.name ?? competitionSlug,
    season: seasonSlug,
    seasonSlug,
    seasonLabel: row.seasons?.name ?? seasonSlug,
    sourceSheet: row.source_sheet,
    matches: row.matches,
    goals: row.goals,
    assists: row.assists,
    yellowCards: row.yellow_cards,
    redCards: row.red_cards,
    cleanSheets: row.clean_sheets,
    goalsConceded: row.goals_conceded,
    goalParticipation: row.goals + row.assists,
  };
}
