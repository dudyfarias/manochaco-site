import type {
  HistoricalPlayerStatLine,
  PlayerStatLine,
  PlayerStatTotals,
  StatsConsistencyMetric,
  StatsConsistencyReport,
} from "@/types";

export const statsConsistencyMetrics: StatsConsistencyMetric[] = [
  "matches",
  "goals",
  "assists",
  "yellowCards",
  "redCards",
  "cleanSheets",
  "goalsConceded",
];

export function emptyPlayerStatTotals(): PlayerStatTotals {
  return {
    matches: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    goalsConceded: 0,
  };
}

export function addPlayerStatTotals(
  current: PlayerStatTotals,
  row: Partial<PlayerStatTotals>,
) {
  for (const metric of statsConsistencyMetrics) {
    current[metric] += row[metric] ?? 0;
  }

  return current;
}

export function aggregatePlayerStatLines(statLines: PlayerStatLine[]) {
  const aggregate = new Map<string, PlayerStatTotals>();

  for (const line of statLines) {
    const totals = aggregate.get(line.playerSlug) ?? emptyPlayerStatTotals();
    addPlayerStatTotals(totals, line);
    aggregate.set(line.playerSlug, totals);
  }

  return aggregate;
}

export function buildStatsConsistencyReport({
  sourceFile,
  granularSheets,
  validationSheets,
  statLines,
  historicalLines,
}: {
  sourceFile: string;
  granularSheets: string[];
  validationSheets: string[];
  statLines: PlayerStatLine[];
  historicalLines: HistoricalPlayerStatLine[];
}): StatsConsistencyReport {
  const calculatedByPlayer = aggregatePlayerStatLines(statLines);
  const historicalByPlayer = new Map(
    historicalLines.map((line) => [line.playerSlug, line]),
  );
  const metadataByPlayer = new Map(
    [...historicalLines, ...statLines].map((line) => [line.playerSlug, line]),
  );
  const playerSlugs = [...new Set([
    ...calculatedByPlayer.keys(),
    ...historicalByPlayer.keys(),
  ])].sort();
  const duplicateKeys = [...new Set(
    statLines
      .map((line) => `${line.playerSlug}|${line.sourceSheet}`)
      .filter((key, index, all) => all.indexOf(key) !== index),
  )];
  const inconsistentAliases = playerSlugs.flatMap((playerSlug) => {
    const rows = [...historicalLines, ...statLines].filter(
      (line) => line.playerSlug === playerSlug,
    );
    const names = [...new Set(rows.map((line) => line.fullName))];
    const nicknames = [...new Set(rows.map((line) => line.nickname))];

    return names.length > 1 || nicknames.length > 1
      ? [{ playerSlug, names, nicknames }]
      : [];
  });

  const players = playerSlugs.map((playerSlug) => {
    const calculated = calculatedByPlayer.get(playerSlug) ?? emptyPlayerStatTotals();
    const historical = historicalByPlayer.get(playerSlug) ?? {
      ...emptyPlayerStatTotals(),
      playerSlug,
      fullName: metadataByPlayer.get(playerSlug)?.fullName ?? playerSlug,
      nickname: metadataByPlayer.get(playerSlug)?.nickname ?? playerSlug,
      sourceSheet: "Estatística Histórica",
    };
    const differences = statsConsistencyMetrics.flatMap((field) =>
      calculated[field] === historical[field]
        ? []
        : [{
            field,
            calculated: calculated[field],
            historical: historical[field],
            difference: historical[field] - calculated[field],
          }],
    );
    const missingHistorical = !historicalByPlayer.has(playerSlug);
    const missingGranular = !calculatedByPlayer.has(playerSlug);

    return {
      playerSlug,
      fullName: historical.fullName,
      nickname: historical.nickname,
      status: missingHistorical
        ? ("missing_historical" as const)
        : missingGranular
          ? ("missing_granular" as const)
          : differences.length > 0
            ? ("divergent" as const)
            : ("ok" as const),
      calculated,
      historical: statsConsistencyMetrics.reduce<PlayerStatTotals>(
        (totals, metric) => ({ ...totals, [metric]: historical[metric] }),
        emptyPlayerStatTotals(),
      ),
      differences,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    sourceFile,
    granularSheets,
    validationSheets,
    totalPlayers: players.length,
    matchingPlayers: players.filter((player) => player.status === "ok").length,
    divergentPlayers: players.filter((player) => player.status !== "ok").length,
    missingInHistorical: players
      .filter((player) => player.status === "missing_historical")
      .map((player) => player.playerSlug),
    missingInGranular: players
      .filter((player) => player.status === "missing_granular")
      .map((player) => player.playerSlug),
    duplicateKeys,
    inconsistentAliases,
    players,
  };
}
