import type {
  ClubStats,
  Match,
  Player,
  PlayerStatLine,
  RankingRow,
} from "@/types";
import { matchCompetition, matchSeason, normalizeFilter } from "./filters";

export type RankingMetric =
  | "goals"
  | "assists"
  | "matches"
  | "goalParticipation"
  | "yellowCards"
  | "redCards";

export type CalculatedMatchStats = ClubStats & {
  averageGoalsFor: number;
  averageGoalsAgainst: number;
};

export function calculateWinRate(wins: number, matches: number) {
  return matches ? Number(((wins / matches) * 100).toFixed(2)) : 0;
}

export function calculateGoalDifference(goalsFor: number, goalsAgainst: number) {
  return goalsFor - goalsAgainst;
}

export function calculateMatchStats(matches: Match[]): CalculatedMatchStats {
  const playedMatches = matches.filter((match) => match.status === "played");
  const totalMatches = playedMatches.length;
  const wins = playedMatches.filter((match) => match.result === "win").length;
  const draws = playedMatches.filter((match) => match.result === "draw").length;
  const losses = playedMatches.filter((match) => match.result === "loss").length;
  const goalsFor = playedMatches.reduce(
    (total, match) => total + (match.manochacoScore ?? match.home.score ?? 0),
    0,
  );
  const goalsAgainst = playedMatches.reduce(
    (total, match) => total + (match.opponentScore ?? match.away.score ?? 0),
    0,
  );
  const goalDifference = calculateGoalDifference(goalsFor, goalsAgainst);

  return {
    totalMatches,
    matches: totalMatches,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference,
    winRate: calculateWinRate(wins, totalMatches),
    titles: 0,
    futFudasTitles: 0,
    averageGoalsFor: totalMatches
      ? Number((goalsFor / totalMatches).toFixed(2))
      : 0,
    averageGoalsAgainst: totalMatches
      ? Number((goalsAgainst / totalMatches).toFixed(2))
      : 0,
  };
}

function getPlayerMetricValue(player: Player, metric: RankingMetric) {
  if (metric === "goals") {
    return player.stats.goals;
  }

  if (metric === "assists") {
    return player.stats.assists;
  }

  if (metric === "matches") {
    return player.stats.matches;
  }

  if (metric === "yellowCards") {
    return player.stats.yellowCards ?? 0;
  }

  if (metric === "redCards") {
    return player.stats.redCards ?? 0;
  }

  return player.stats.goalParticipation ?? player.stats.goals + player.stats.assists;
}

function getStatLineMetricValue(statLine: PlayerStatLine, metric: RankingMetric) {
  if (metric === "goals") {
    return statLine.goals;
  }

  if (metric === "assists") {
    return statLine.assists;
  }

  if (metric === "matches") {
    return statLine.matches;
  }

  if (metric === "yellowCards") {
    return statLine.yellowCards ?? 0;
  }

  if (metric === "redCards") {
    return statLine.redCards ?? 0;
  }

  return statLine.goalParticipation;
}

export function getRankingUnit(metric: RankingMetric) {
  const units: Record<RankingMetric, string> = {
    goals: "gols",
    assists: "assistências",
    matches: "jogos",
    goalParticipation: "participações",
    yellowCards: "cartões amarelos",
    redCards: "cartões vermelhos",
  };

  return units[metric];
}

export function generateRankingFromPlayers(
  players: Player[],
  metric: RankingMetric,
  limit = 10,
): RankingRow[] {
  return players
    .map((player, index) => ({
      index,
      player,
      value: getPlayerMetricValue(player, metric),
    }))
    .filter((row) => row.value > 0 || metric === "matches")
    .sort((first, second) => second.value - first.value || first.index - second.index)
    .slice(0, limit)
    .map(({ player, value }) => ({
      playerSlug: player.slug,
      fullName: player.fullName,
      nickname: player.nickname,
      value,
      unit: getRankingUnit(metric),
    }));
}

export function filterPlayerStatLines(
  statLines: PlayerStatLine[],
  filters: {
    competition?: string;
    season?: string;
  },
) {
  const competition = normalizeFilter(filters.competition);
  const season = normalizeFilter(filters.season);

  return statLines.filter(
    (statLine) =>
      (!competition ||
        statLine.competitionId === competition ||
        statLine.competitionSlug === competition) &&
      (!season || statLine.season === season || statLine.seasonSlug === season),
  );
}

export function generateRankingFromStatLines(
  statLines: PlayerStatLine[],
  metric: RankingMetric,
  limit = 10,
): RankingRow[] {
  const aggregate = new Map<
    string,
    {
      fullName: string;
      nickname: string;
      value: number;
      firstIndex: number;
    }
  >();

  statLines.forEach((statLine, index) => {
    const current = aggregate.get(statLine.playerSlug);
    const value = getStatLineMetricValue(statLine, metric);

    if (!current) {
      aggregate.set(statLine.playerSlug, {
        fullName: statLine.fullName,
        nickname: statLine.nickname,
        value,
        firstIndex: index,
      });
      return;
    }

    current.value += value;
  });

  return [...aggregate.entries()]
    .filter(([, row]) => row.value > 0 || metric === "matches")
    .sort(
      (first, second) =>
        second[1].value - first[1].value || first[1].firstIndex - second[1].firstIndex,
    )
    .slice(0, limit)
    .map(([playerSlug, row]) => ({
      playerSlug,
      fullName: row.fullName,
      nickname: row.nickname,
      value: row.value,
      unit: getRankingUnit(metric),
    }));
}

export function getRankingRows(params: {
  players: Player[];
  statLines: PlayerStatLine[];
  metric: RankingMetric;
  competition?: string;
  season?: string;
  limit?: number;
}) {
  const filteredStatLines = filterPlayerStatLines(params.statLines, {
    competition: params.competition,
    season: params.season,
  });
  const competition = normalizeFilter(params.competition);
  const season = normalizeFilter(params.season);
  const hasContextFilter =
    Boolean(competition) ||
    Boolean(season);

  if (hasContextFilter && filteredStatLines.length > 0) {
    const statLinesForRanking =
      season && !competition
        ? filteredStatLines.filter((statLine) => !statLine.competitionId)
        : filteredStatLines;

    return generateRankingFromStatLines(
      statLinesForRanking.length > 0 ? statLinesForRanking : filteredStatLines,
      params.metric,
      params.limit,
    );
  }

  return generateRankingFromPlayers(params.players, params.metric, params.limit);
}

export function filterMatchesForStats(
  matches: Match[],
  filters: {
    competition?: string;
    season?: string;
  },
) {
  const competition = normalizeFilter(filters.competition);
  const season = normalizeFilter(filters.season);

  return matches.filter(
    (match) => matchCompetition(match, competition) && matchSeason(match, season),
  );
}
