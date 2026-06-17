import type { Match, MatchResult, Player, PlayerStatus } from "@/types";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export type MatchFilters = {
  competition?: string;
  season?: string;
  result?: MatchResult | "all";
  query?: string;
};

export type PlayerFilters = {
  status?: PlayerStatus | "all";
  sort?: "name" | "matches" | "goals" | "assists";
};

export function getSingleParam(
  params: SearchParamsRecord,
  key: string,
  fallback = "all",
) {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export function normalizeFilter(value?: string) {
  return value && value !== "all" ? value : undefined;
}

export function makeFilterHref(
  pathname: string,
  currentParams: SearchParamsRecord,
  updates: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();

  Object.entries(currentParams).forEach(([key, value]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    if (normalizedValue && normalizedValue !== "all") {
      params.set(key, normalizedValue);
    }
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function matchSeason(match: Match, season?: string) {
  if (!season) {
    return true;
  }

  return (
    match.season === season ||
    match.seasonSlug === season ||
    new Date(match.date).getFullYear().toString() === season
  );
}

export function matchCompetition(match: Match, competition?: string) {
  if (!competition) {
    return true;
  }

  return (
    match.competitionId === competition ||
    match.competition === competition ||
    match.competitionSlug === competition
  );
}

export function filterMatches(matches: Match[], filters: MatchFilters) {
  const competition = normalizeFilter(filters.competition);
  const season = normalizeFilter(filters.season);
  const result = filters.result && filters.result !== "all" ? filters.result : undefined;
  const query = filters.query?.trim().toLowerCase();

  return matches.filter((match) => {
    if (!matchCompetition(match, competition)) {
      return false;
    }

    if (!matchSeason(match, season)) {
      return false;
    }

    if (result && match.result !== result) {
      return false;
    }

    if (query) {
      const opponent = (match.opponent ?? match.away.name ?? "").toLowerCase();
      if (!opponent.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export function filterPlayers(players: Player[], filters: PlayerFilters) {
  const status = filters.status && filters.status !== "all" ? filters.status : undefined;
  const filteredPlayers = status
    ? players.filter((player) => player.status === status)
    : players;

  return [...filteredPlayers].sort((first, second) => {
    if (filters.sort === "matches") {
      return second.stats.matches - first.stats.matches;
    }

    if (filters.sort === "goals") {
      return second.stats.goals - first.stats.goals;
    }

    if (filters.sort === "assists") {
      return second.stats.assists - first.stats.assists;
    }

    return first.nickname.localeCompare(second.nickname, "pt-BR");
  });
}

export function getMatchFilterSummary(filters: MatchFilters) {
  return {
    competition: normalizeFilter(filters.competition),
    season: normalizeFilter(filters.season),
    result: filters.result && filters.result !== "all" ? filters.result : undefined,
    query: filters.query?.trim() || undefined,
  };
}
