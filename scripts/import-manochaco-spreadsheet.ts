import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import readExcelFile from "read-excel-file/node";
import type {
  ClubStats,
  Competition,
  Match,
  MatchResult,
  Player,
  PlayerPosition,
  PlayerStatLine,
  RankingRow,
  Season,
} from "../src/types";

type Cell = string | number | boolean | Date | null;
type Row = Cell[];
type Sheet = {
  sheet: string;
  data: Row[];
};

type ImportedPlayer = Player;

type RawGeneratedStats = {
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  winRate: number;
  titles: number;
};

const PROJECT_ROOT = process.cwd();
const DEFAULT_INPUT = path.join(PROJECT_ROOT, "data/raw/planilha-manochaco.xlsx");
const GENERATED_DIR = path.join(PROJECT_ROOT, "src/data/generated");

const HISTORICAL_STATS_SHEET = "Estatística Histórica";
const MATCH_HISTORY_SHEET = "Jogos Histórico";

const EXPECTED_RANKINGS = {
  scoring: [
    ["torres", 52],
    ["dudu", 25],
    ["bruninho", 13],
    ["pedrinho", 10],
    ["jorge", 8],
  ],
  assists: [
    ["madeus", 14],
    ["bruninho", 12],
    ["torres", 9],
    ["dudu", 8],
    ["pedrinho", 6],
  ],
  appearances: [
    ["dudu", 47],
    ["nikollas", 46],
    ["torres", 43],
    ["ed-gou", 41],
    ["victor-erik", 41],
  ],
} as const;

const EXPECTED_TOTALS = {
  totalMatches: 36,
  wins: 17,
  draws: 7,
  losses: 12,
  goalsFor: 113,
  goalsAgainst: 83,
  goalDifference: 30,
  titles: 2,
};

const PRIVATE_SHEET_PATTERNS = [
  /financeiro/i,
  /money/i,
  /página28/i,
  /pagina28/i,
  /^amstel 1 2026$/i,
  /^chuteira 1 2026$/i,
  /^amstel 2s 2025$/i,
];

const PUBLIC_SPORT_SHEETS = [
  HISTORICAL_STATS_SHEET,
  MATCH_HISTORY_SHEET,
  "Estatística Geral 2025",
  "Liga 7 2025",
  "Chuteira 2025",
  "AMSTEL1 Estatística 2025",
  "LIGA 7 Estatística 2023",
  "LIGA 7 Estatística 2024",
  "ESTRELATO Estatística 2024",
  "Estatística 2024",
];

const PLAYER_SLUG_OVERRIDES: Record<string, string> = {
  TORRES: "torres",
  DUDU: "dudu",
  BRUNINHO: "bruninho",
  PEDRINHO: "pedrinho",
  MADEUS: "madeus",
  NIKOLLAS: "nikollas",
  "ED GOU": "ed-gou",
  "VICTOR ERIK": "victor-erik",
  CASANOVA: "raphael-casanova",
  DED: "andre-gouveia",
  "DE MARCO": "de-marco",
  "CARLOS JR": "carlos-jr",
  "PE LIMA": "pe-lima",
  "JF FAGUNDES": "jf-fagundes",
};

const PLAYER_BIOS: Record<string, string> = {
  torres:
    "Artilheiro histórico do Manochaco, referência ofensiva e líder em gols na base estatística oficial.",
  dudu:
    "Um dos nomes mais presentes da história do Manochaco, com alta participação e peso ofensivo desde a primeira base registrada.",
  bruninho:
    "Meio campista de criação e chegada ao ataque, entre os líderes históricos em gols e assistências.",
  pedrinho:
    "Ala técnico e vertical, com participação relevante em gols e presença constante nas campanhas do clube.",
  madeus:
    "Meio campista líder histórico em assistências, importante na organização e no último passe do Manochaco.",
  nikollas:
    "Zagueiro de presença histórica, referência defensiva e um dos atletas que mais vestiram a camisa do clube.",
  "ed-gou":
    "Zagueiro histórico do Manochaco, constante em jogos registrados e parte importante da base defensiva.",
  "victor-erik":
    "Zagueiro de presença alta no histórico do clube, com regularidade nas campanhas registradas.",
  "raphael-casanova":
    "Jogador registrado no histórico do Manochaco e técnico atual do clube.",
  "andre-gouveia":
    "Ex-jogador registrado no histórico e antigo técnico do Manochaco.",
};

const STAT_SHEETS_TO_IMPORT = [
  "Estatística Geral 2025",
  "ESTRELATO Estatística 2024",
  "LIGA 7 Estatística 2024",
  "AMSTEL1 Estatística 2025",
  "Estatística 2024",
  "LIGA 7 Estatística 2023",
  "Liga 7 2025",
  "Chuteira 2025",
];

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function slugify(value: string) {
  return stripAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeHeader(value: Cell) {
  return stripAccents(String(value ?? ""))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function buildHeaderMap(headerRow: Row) {
  const map = new Map<string, number>();
  headerRow.forEach((cell, index) => {
    const key = normalizeHeader(cell);
    if (key) {
      map.set(key, index);
    }
  });
  return map;
}

function findColumn(headers: Map<string, number>, candidates: string[]) {
  for (const candidate of candidates) {
    const index = headers.get(normalizeHeader(candidate));
    if (typeof index === "number") {
      return index;
    }
  }

  return undefined;
}

function getCell(row: Row, headers: Map<string, number>, candidates: string[]) {
  const index = findColumn(headers, candidates);
  return typeof index === "number" ? row[index] : null;
}

function asNumber(value: Cell, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    if (!normalized) {
      return fallback;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function asOptionalNumber(value: Cell) {
  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : undefined;
}

function asText(value: Cell) {
  return typeof value === "string" ? value.trim() : "";
}

function asDate(value: Cell) {
  return value instanceof Date && !Number.isNaN(value.getTime())
    ? value
    : undefined;
}

function formatDateTime(date: Date, hour = "12:00:00") {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}-03:00`;
}

function getYearFromDate(value: Cell, fallback = 2023) {
  const date = asDate(value);
  if (date) {
    return date.getUTCFullYear();
  }

  const numeric = asNumber(value, Number.NaN);
  return Number.isFinite(numeric) && numeric > 1900 ? Math.round(numeric) : fallback;
}

function parsePlayerName(value: string) {
  const match = value.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (!match) {
    return null;
  }

  return {
    fullName: match[1].trim(),
    nickname: match[2].trim().toUpperCase(),
  };
}

function toPlayerSlug(fullName: string, nickname: string) {
  return PLAYER_SLUG_OVERRIDES[nickname] ?? slugify(nickname || fullName);
}

function toPosition(value: string): PlayerPosition {
  const normalized = stripAccents(value).toLowerCase();

  if (normalized.includes("goleiro")) {
    return "Goleiro";
  }

  if (normalized.includes("zagueiro") || normalized.includes("fixo")) {
    return "Zagueiro";
  }

  if (normalized.includes("meio")) {
    return "Meio Campo";
  }

  if (normalized.includes("atacante") || normalized.includes("pivo")) {
    return "Atacante";
  }

  return "Ala";
}

function makePlayerBio(player: {
  slug: string;
  matches: number;
  goals: number;
  assists: number;
}) {
  if (PLAYER_BIOS[player.slug]) {
    return PLAYER_BIOS[player.slug];
  }

  const goalWord = player.goals === 1 ? "gol" : "gols";
  const assistWord = player.assists === 1 ? "assistência" : "assistências";

  if (player.matches === 0) {
    return "Atleta registrado na base histórica do Manochaco, ainda sem jogos computados na planilha.";
  }

  return `Atleta registrado na base histórica do Manochaco, com ${player.matches} jogos, ${player.goals} ${goalWord} e ${player.assists} ${assistWord}.`;
}

function isPrivateSheet(sheetName: string) {
  return PRIVATE_SHEET_PATTERNS.some((pattern) => pattern.test(sheetName));
}

function isPublicSportSheet(sheetName: string) {
  if (isPrivateSheet(sheetName)) {
    return false;
  }

  return (
    PUBLIC_SPORT_SHEETS.includes(sheetName) ||
    /estatística/i.test(sheetName) ||
    /estatistica/i.test(sheetName)
  );
}

function parseHistoricalPlayers(sheet: Sheet) {
  const warnings: string[] = [];
  const headerIndex = sheet.data.findIndex((row) =>
    row.some((cell) => normalizeHeader(cell) === "jogadores"),
  );

  if (headerIndex < 0) {
    throw new Error(`Aba ${HISTORICAL_STATS_SHEET} sem coluna Jogadores.`);
  }

  const headers = buildHeaderMap(sheet.data[headerIndex]);
  const players: ImportedPlayer[] = [];
  const seenSlugs = new Set<string>();

  for (const row of sheet.data.slice(headerIndex + 1)) {
    const rawName = asText(getCell(row, headers, ["Jogadores"]));
    if (!rawName || !rawName.includes("(")) {
      continue;
    }

    const parsedName = parsePlayerName(rawName);
    if (!parsedName) {
      warnings.push(`Jogador sem apelido padronizado ignorado: ${rawName}`);
      continue;
    }

    const slug = toPlayerSlug(parsedName.fullName, parsedName.nickname);
    if (!slug) {
      warnings.push(`Jogador sem slug gerado: ${rawName}`);
      continue;
    }

    if (seenSlugs.has(slug)) {
      warnings.push(`Jogador duplicado ignorado pelo slug ${slug}: ${rawName}`);
      continue;
    }

    seenSlugs.add(slug);

    const matches = Math.round(asNumber(getCell(row, headers, ["Presença"])));
    const goals = Math.round(asNumber(getCell(row, headers, ["Gols"])));
    const assists = Math.round(asNumber(getCell(row, headers, ["Assistência"])));
    const yellowCards = Math.round(
      asNumber(getCell(row, headers, ["Cartões Amarelos", "Cartões Amarelo"])),
    );
    const redCards = Math.round(
      asNumber(getCell(row, headers, ["Cartões Vermelhos", "Cartões Vermelho"])),
    );
    const statusCell = asText(getCell(row, headers, ["Saiu do time"]));
    const status = statusCell.toLowerCase() === "sim" ? "former" : "active";
    const number = asOptionalNumber(getCell(row, headers, ["Nº da Camisa"]));
    const position = toPosition(asText(getCell(row, headers, ["Posição"])));
    const joinedYear = getYearFromDate(
      getCell(row, headers, ["Data de Ingressão"]),
      2023,
    );

    const playerBase = {
      slug,
      matches,
      goals,
      assists,
    };

    players.push({
      id: `player-${slug}`,
      slug,
      name: parsedName.fullName,
      fullName: parsedName.fullName,
      nickname: parsedName.nickname,
      position,
      ...(number ? { number } : {}),
      ...(number ? { shirtNumber: number } : {}),
      status,
      image: `/players/${slug}.jpg`,
      profileImage: `/players/${slug}.jpg`,
      joinedYear,
      bio: makePlayerBio(playerBase),
      stats: {
        matches,
        goals,
        assists,
        yellowCards,
        redCards,
        goalParticipation: goals + assists,
      },
    });
  }

  return { players, warnings };
}

function inferCompetitionIdFromSheetName(sheetName: string) {
  const normalized = stripAccents(sheetName).toLowerCase();

  if (normalized.includes("liga 7") || normalized.includes("liga7")) {
    return "liga7-playball";
  }

  if (normalized.includes("amstel")) {
    return "copa-amstel";
  }

  if (normalized.includes("chuteira")) {
    return "chuteira";
  }

  if (normalized.includes("futfudas")) {
    return "copa-futfudas";
  }

  return undefined;
}

function parsePlayerStatLines(sheet: Sheet) {
  const warnings: string[] = [];
  const headerIndex = sheet.data.findIndex((row) =>
    row.some((cell) => normalizeHeader(cell) === "jogadores"),
  );

  if (headerIndex < 0) {
    return { statLines: [] as PlayerStatLine[], warnings };
  }

  const headers = buildHeaderMap(sheet.data[headerIndex]);
  const season = extractYearFromSheetName(sheet.sheet);
  const seasonSlug = season ? String(season) : undefined;
  const competitionId = inferCompetitionIdFromSheetName(sheet.sheet);
  const competitionSlug = competitionId;
  const statLines: PlayerStatLine[] = [];
  const seenKeys = new Set<string>();

  for (const row of sheet.data.slice(headerIndex + 1)) {
    const rawName = asText(getCell(row, headers, ["Jogadores"]));
    if (!rawName || !rawName.includes("(")) {
      continue;
    }

    const parsedName = parsePlayerName(rawName);
    if (!parsedName) {
      warnings.push(`${sheet.sheet}: jogador sem apelido ignorado (${rawName}).`);
      continue;
    }

    const playerSlug = toPlayerSlug(parsedName.fullName, parsedName.nickname);
    const key = `${sheet.sheet}-${playerSlug}`;

    if (seenKeys.has(key)) {
      warnings.push(`${sheet.sheet}: linha duplicada ignorada para ${playerSlug}.`);
      continue;
    }

    seenKeys.add(key);

    const matches = Math.round(asNumber(getCell(row, headers, ["Presença", "Presença em Jogos"])));
    const goals = Math.round(asNumber(getCell(row, headers, ["Gols"])));
    const assists = Math.round(
      asNumber(getCell(row, headers, ["Assistência", "Assistências"])),
    );
    const yellowCards = Math.round(
      asNumber(getCell(row, headers, ["Cartões Amarelos", "Cartões Amarelo"])),
    );
    const redCards = Math.round(
      asNumber(getCell(row, headers, ["Cartões Vermelhos", "Cartões Vermelho"])),
    );

    statLines.push({
      id: `stat-${slugify(sheet.sheet)}-${playerSlug}`,
      playerSlug,
      fullName: parsedName.fullName,
      nickname: parsedName.nickname,
      ...(competitionId ? { competitionId } : {}),
      ...(competitionSlug ? { competitionSlug } : {}),
      ...(season ? { season: String(season) } : {}),
      ...(seasonSlug ? { seasonSlug } : {}),
      sourceSheet: sheet.sheet,
      matches,
      goals,
      assists,
      yellowCards,
      redCards,
      goalParticipation: goals + assists,
    });
  }

  return { statLines, warnings };
}

function inferCompetitionId(stage: string) {
  const normalized = stripAccents(stage).toLowerCase();

  if (normalized.includes("futfudas")) {
    return "copa-futfudas";
  }

  if (normalized.includes("amstel")) {
    return "copa-amstel";
  }

  if (normalized.includes("chuteira")) {
    return "chuteira";
  }

  return "liga7-playball";
}

function inferMatchImage(opponent: string) {
  const slug = slugify(opponent);

  if (slug.includes("expulsos")) {
    return "/photos/jogos/manochaco-vs-expulsos-2024-01.jpg";
  }

  if (slug.includes("inimigos")) {
    return "/photos/jogos/manochaco-vs-inimigos-do-fim-2023-01.jpg";
  }

  if (slug.includes("dopinham")) {
    return "/photos/jogos/liga7-playball-2024-01.jpg";
  }

  return "/team/hero-home.jpg";
}

function toMatchResult(goalsFor: number, goalsAgainst: number): MatchResult {
  if (goalsFor > goalsAgainst) {
    return "win";
  }

  if (goalsFor < goalsAgainst) {
    return "loss";
  }

  return "draw";
}

function resultLabel(result: MatchResult) {
  if (result === "win") {
    return "Vitória";
  }

  if (result === "loss") {
    return "Derrota";
  }

  return "Empate";
}

function parseHistoricalMatches(sheet: Sheet) {
  const warnings: string[] = [];
  const headerIndex = sheet.data.findIndex((row) =>
    row.some((cell) => normalizeHeader(cell) === "data"),
  );

  if (headerIndex < 0) {
    throw new Error(`Aba ${MATCH_HISTORY_SHEET} sem coluna Data.`);
  }

  const headers = buildHeaderMap(sheet.data[headerIndex]);
  const matches: Match[] = [];
  const seenSlugs = new Set<string>();
  const hasCompetitionColumn =
    findColumn(headers, ["Competição", "Campeonato"]) !== undefined;

  if (!hasCompetitionColumn) {
    warnings.push(
      "Aba Jogos Histórico não possui coluna de competição; usando inferência/fallback por fase para compatibilidade visual.",
    );
  }

  for (const row of sheet.data.slice(headerIndex + 1)) {
    const date = asDate(getCell(row, headers, ["Data"]));
    const homeName = asText(getCell(row, headers, ["time da casa"])) || "Manochaco";
    const awayName = asText(getCell(row, headers, ["time fora"]));
    const goalsFor = asNumber(getCell(row, headers, ["GOLS FEITOS"]), Number.NaN);
    const goalsAgainst = asNumber(
      getCell(row, headers, ["GOLS SOFRIDOS"]),
      Number.NaN,
    );
    const stage = asText(getCell(row, headers, ["Classificação"]));

    if (!date && !awayName) {
      continue;
    }

    if (!date) {
      warnings.push(`Partida ignorada sem data contra ${awayName || "adversário vazio"}.`);
      continue;
    }

    if (!awayName) {
      warnings.push(`Partida em ${formatDateTime(date)} ignorada sem adversário.`);
      continue;
    }

    if (!Number.isFinite(goalsFor) || !Number.isFinite(goalsAgainst)) {
      warnings.push(`Partida contra ${awayName} ignorada sem placar válido.`);
      continue;
    }

    const opponent = homeName.toLowerCase().includes("manochaco")
      ? awayName
      : homeName;
    const manochacoScore = Math.round(goalsFor);
    const opponentScore = Math.round(goalsAgainst);
    const result = toMatchResult(manochacoScore, opponentScore);
    const dateKey = formatDateTime(date).slice(0, 10);
    const opponentSlug = slugify(opponent);
    let slug = `manochaco-vs-${opponentSlug}-${dateKey}`;
    let duplicateIndex = 2;

    while (seenSlugs.has(slug)) {
      slug = `manochaco-vs-${opponentSlug}-${dateKey}-${duplicateIndex}`;
      duplicateIndex += 1;
    }

    seenSlugs.add(slug);

    const competitionId = inferCompetitionId(stage);

    matches.push({
      id: `match-${dateKey}-${opponentSlug}`,
      slug,
      date: formatDateTime(date),
      competitionId,
      round: stage || "Histórico Manochaco",
      venue: "A revisar",
      status: "played",
      opponent,
      competition: competitionId,
      competitionSlug: competitionId,
      season: String(date.getUTCFullYear()),
      seasonSlug: String(date.getUTCFullYear()),
      manochacoScore,
      opponentScore,
      result,
      stage: stage || undefined,
      location: "A revisar",
      home: { name: "Manochaco", score: manochacoScore },
      away: { name: opponent, score: opponentScore },
      image: inferMatchImage(opponent),
      summary: `${resultLabel(result)} do Manochaco por ${manochacoScore} x ${opponentScore} contra ${opponent}. Dados importados da aba Jogos Histórico.`,
      highlights: [
        "Partida importada da planilha oficial.",
        "Competição e local podem passar por revisão manual em fase administrativa.",
      ],
      contributions: [],
      relatedPlayerSlugs: [],
      photoIds: [],
    });
  }

  return { matches, warnings };
}

function calculateStats(matches: Match[]): RawGeneratedStats {
  const totalMatches = matches.length;
  const wins = matches.filter((match) => match.result === "win").length;
  const draws = matches.filter((match) => match.result === "draw").length;
  const losses = matches.filter((match) => match.result === "loss").length;
  const goalsFor = matches.reduce(
    (total, match) => total + (match.manochacoScore ?? match.home.score ?? 0),
    0,
  );
  const goalsAgainst = matches.reduce(
    (total, match) => total + (match.opponentScore ?? match.away.score ?? 0),
    0,
  );
  const goalDifference = goalsFor - goalsAgainst;

  return {
    totalMatches,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference,
    winRate: totalMatches ? Number(((wins / totalMatches) * 100).toFixed(2)) : 0,
    titles: 2,
  };
}

function toRankingRow(player: ImportedPlayer, value: number, unit: string): RankingRow {
  return {
    playerSlug: player.slug,
    fullName: player.fullName,
    nickname: player.nickname,
    value,
    unit,
  };
}

function rankPlayers(
  players: ImportedPlayer[],
  field: "goals" | "assists" | "matches" | "yellowCards" | "goalParticipation",
  unit: string,
) {
  return players
    .map((player, index) => ({
      player,
      value:
        field === "goals"
          ? player.stats.goals
          : field === "assists"
            ? player.stats.assists
            : field === "matches"
              ? player.stats.matches
              : field === "yellowCards"
                ? (player.stats.yellowCards ?? 0)
                : (player.stats.goalParticipation ?? 0),
      index,
    }))
    .filter((item) => item.value > 0)
    .sort((first, second) => second.value - first.value || first.index - second.index)
    .slice(0, 10)
    .map((item) => toRankingRow(item.player, item.value, unit));
}

function validateExpectedRanking(
  label: string,
  ranking: RankingRow[],
  expected: readonly (readonly [string, number])[],
) {
  const warnings: string[] = [];

  expected.forEach(([slug, value], index) => {
    const row = ranking[index];
    if (!row || row.playerSlug !== slug || row.value !== value) {
      warnings.push(
        `${label}: esperado #${index + 1} ${slug} (${value}), recebido ${
          row ? `${row.playerSlug} (${row.value})` : "vazio"
        }.`,
      );
    }
  });

  return warnings;
}

function validateStats(stats: RawGeneratedStats) {
  const warnings: string[] = [];

  for (const [key, expectedValue] of Object.entries(EXPECTED_TOTALS)) {
    const actual = stats[key as keyof RawGeneratedStats];
    if (actual !== expectedValue) {
      warnings.push(
        `Totais divergentes: ${key} esperado ${expectedValue}, calculado ${actual}.`,
      );
    }
  }

  return warnings;
}

function getCompetitions(): Competition[] {
  return [
    {
      id: "liga7-playball",
      slug: "liga7",
      name: "Liga7 Playball",
      shortName: "Liga7",
      description:
        "Competição em que o Manochaco começou na Série D e chegou à Série B.",
      type: "league",
    },
    {
      id: "copa-futfudas",
      slug: "copa-futfudas",
      name: "Copa FutFudas",
      shortName: "FutFudas",
      description:
        "Campeonato à parte da Playball Pompeia, em formato de jogo único. O Manochaco já venceu duas vezes.",
      type: "cup",
    },
    {
      id: "copa-amstel",
      slug: "copa-amstel",
      name: "Copa Amstel de sábado",
      shortName: "Amstel",
      description: "Campeonato de sábado disputado atualmente pelo Manochaco.",
      type: "cup",
    },
    {
      id: "chuteira",
      slug: "chuteira",
      name: "Chuteira",
      shortName: "Chuteira",
      description: "Campeonato disputado atualmente pelo Manochaco.",
      type: "league",
    },
  ];
}

function extractYearFromSheetName(sheetName: string) {
  const match = sheetName.match(/20\d{2}/);
  return match ? Number(match[0]) : undefined;
}

function getSeasons(sheets: Sheet[], matches: Match[]): Season[] {
  const sourceByYear = new Map<number, Set<string>>();

  sheets.forEach((sheet) => {
    if (!isPublicSportSheet(sheet.sheet)) {
      return;
    }

    const year = extractYearFromSheetName(sheet.sheet);
    if (!year) {
      return;
    }

    if (!sourceByYear.has(year)) {
      sourceByYear.set(year, new Set());
    }

    sourceByYear.get(year)?.add(sheet.sheet);
  });

  matches.forEach((match) => {
    const year = Number(match.season);
    if (!Number.isFinite(year)) {
      return;
    }

    if (!sourceByYear.has(year)) {
      sourceByYear.set(year, new Set());
    }

    sourceByYear.get(year)?.add(MATCH_HISTORY_SHEET);
  });

  return [...sourceByYear.entries()]
    .sort(([first], [second]) => first - second)
    .map(([year, sourceSheets]) => ({
      id: `season-${year}`,
      year,
      name: String(year),
      slug: String(year),
      label: String(year),
      sourceSheets: [...sourceSheets].sort(),
    }));
}

function serializeTs(value: unknown) {
  return JSON.stringify(value, null, 2).replace(/"([^"]+)":/g, "$1:");
}

async function writeGeneratedFile(filename: string, content: string) {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
  await fs.writeFile(path.join(GENERATED_DIR, filename), content);
}

function makeGeneratedHeader(sourceFile: string) {
  const date = new Date().toISOString();
  const safeSourceName = /financeiro/i.test(sourceFile)
    ? "planilha-manochaco.xlsx"
    : sourceFile;

  return `// Arquivo gerado automaticamente por scripts/import-manochaco-spreadsheet.ts.\n// Fonte: ${safeSourceName}\n// Gerado em: ${date}\n// Nao edite manualmente; rode npm run import:spreadsheet.\n\n`;
}

function toPlayersFile(players: Player[], sourceFile: string) {
  return `${makeGeneratedHeader(sourceFile)}import type { Player } from "@/types";\n\nexport const players: Player[] = ${serializeTs(
    players,
  )};\n`;
}

function toMatchesFile(matches: Match[], sourceFile: string) {
  return `${makeGeneratedHeader(sourceFile)}import type { Match } from "@/types";\n\nexport const matches: Match[] = ${serializeTs(
    matches,
  )};\n`;
}

function toStatsFile(stats: RawGeneratedStats, sourceFile: string) {
  const clubStats: ClubStats = {
    totalMatches: stats.totalMatches,
    matches: stats.totalMatches,
    wins: stats.wins,
    draws: stats.draws,
    losses: stats.losses,
    goalsFor: stats.goalsFor,
    goalsAgainst: stats.goalsAgainst,
    goalDifference: stats.goalDifference,
    winRate: stats.winRate,
    titles: stats.titles,
    futFudasTitles: 2,
  };

  return `${makeGeneratedHeader(sourceFile)}import type { ClubStats } from "@/types";\n\nexport const stats = ${serializeTs(
    stats,
  )};\n\nexport const clubStats: ClubStats = ${serializeTs(clubStats)};\n`;
}

function toRankingsFile(
  rankings: {
    scoringRanking: RankingRow[];
    assistsRanking: RankingRow[];
    appearancesRanking: RankingRow[];
    cardRanking: RankingRow[];
    goalParticipationRanking: RankingRow[];
  },
  sourceFile: string,
) {
  return `${makeGeneratedHeader(sourceFile)}import type { RankingRow } from "@/types";\n\nexport const scoringRanking: RankingRow[] = ${serializeTs(
    rankings.scoringRanking,
  )};\n\nexport const assistsRanking: RankingRow[] = ${serializeTs(
    rankings.assistsRanking,
  )};\n\nexport const appearancesRanking: RankingRow[] = ${serializeTs(
    rankings.appearancesRanking,
  )};\n\nexport const cardRanking: RankingRow[] = ${serializeTs(
    rankings.cardRanking,
  )};\n\nexport const goalParticipationRanking: RankingRow[] = ${serializeTs(
    rankings.goalParticipationRanking,
  )};\n`;
}

function toCompetitionsFile(competitions: Competition[], sourceFile: string) {
  return `${makeGeneratedHeader(sourceFile)}import type { Competition } from "@/types";\n\nexport const competitions: Competition[] = ${serializeTs(
    competitions,
  )};\n`;
}

function toSeasonsFile(seasons: Season[], sourceFile: string) {
  return `${makeGeneratedHeader(sourceFile)}import type { Season } from "@/types";\n\nexport const seasons: Season[] = ${serializeTs(
    seasons,
  )};\n`;
}

function toPlayerStatsFile(statLines: PlayerStatLine[], sourceFile: string) {
  return `${makeGeneratedHeader(sourceFile)}import type { PlayerStatLine } from "@/types";\n\nexport const playerStatLines: PlayerStatLine[] = ${serializeTs(
    statLines,
  )};\n`;
}

async function pathExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findNewestDownloadSpreadsheet() {
  const downloadsDir = path.join(os.homedir(), "Downloads");

  try {
    const entries = await fs.readdir(downloadsDir);
    const candidates = await Promise.all(
      entries
        .filter(
          (entry) =>
            /^Planilha Manochaco - Treinos, Time e Financeiro.*\.xlsx$/i.test(
              entry,
            ) && !entry.startsWith("~$"),
        )
        .map(async (entry) => {
          const fullPath = path.join(downloadsDir, entry);
          const stats = await fs.stat(fullPath);
          return { fullPath, mtimeMs: stats.mtimeMs };
        }),
    );

    return candidates.sort((first, second) => second.mtimeMs - first.mtimeMs)[0]
      ?.fullPath;
  } catch {
    return undefined;
  }
}

async function resolveInputPath() {
  const explicitArg = process.argv.find((arg) => arg.startsWith("--input="));
  const positionalArg = process.argv
    .slice(2)
    .find((arg) => !arg.startsWith("--"));
  const requestedPath = explicitArg?.split("=").slice(1).join("=") || positionalArg;

  if (requestedPath) {
    const absolutePath = path.isAbsolute(requestedPath)
      ? requestedPath
      : path.join(PROJECT_ROOT, requestedPath);

    if (!(await pathExists(absolutePath))) {
      throw new Error(`Planilha nao encontrada em ${absolutePath}`);
    }

    return absolutePath;
  }

  if (await pathExists(DEFAULT_INPUT)) {
    return DEFAULT_INPUT;
  }

  const downloadCandidate = await findNewestDownloadSpreadsheet();
  if (downloadCandidate) {
    console.warn(
      `Planilha padrao nao encontrada em data/raw; usando arquivo encontrado em Downloads: ${downloadCandidate}`,
    );
    return downloadCandidate;
  }

  throw new Error(
    "Planilha nao encontrada. Coloque em data/raw/planilha-manochaco.xlsx ou rode npm run import:spreadsheet -- --input=/caminho/arquivo.xlsx",
  );
}

function logWarnings(title: string, warnings: string[]) {
  if (warnings.length === 0) {
    return;
  }

  console.warn(`\n${title}`);
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

async function main() {
  const inputPath = await resolveInputPath();
  const sheets = (await readExcelFile(inputPath)) as Sheet[];
  const availableSheets = sheets.map((sheet) => sheet.sheet);
  const privateSheets = availableSheets.filter(isPrivateSheet);
  const publicSportSheets = availableSheets.filter(isPublicSportSheet);

  console.log(`Planilha: ${inputPath}`);
  console.log(`Abas encontradas (${availableSheets.length}): ${availableSheets.join(", ")}`);
  console.log(`Abas esportivas usadas: ${publicSportSheets.join(", ")}`);
  console.log(`Abas privadas ignoradas: ${privateSheets.join(", ") || "nenhuma"}`);

  const historicalSheet = sheets.find((sheet) => sheet.sheet === HISTORICAL_STATS_SHEET);
  const matchSheet = sheets.find((sheet) => sheet.sheet === MATCH_HISTORY_SHEET);

  if (!historicalSheet) {
    throw new Error(`Aba obrigatoria ausente: ${HISTORICAL_STATS_SHEET}`);
  }

  if (!matchSheet) {
    throw new Error(`Aba obrigatoria ausente: ${MATCH_HISTORY_SHEET}`);
  }

  const playerResult = parseHistoricalPlayers(historicalSheet);
  const matchResult = parseHistoricalMatches(matchSheet);
  const statLineResults = sheets
    .filter((sheet) => STAT_SHEETS_TO_IMPORT.includes(sheet.sheet))
    .map(parsePlayerStatLines);
  const playerStatLines = statLineResults.flatMap((result) => result.statLines);
  const rawStats = calculateStats(matchResult.matches);
  const scoringRanking = rankPlayers(playerResult.players, "goals", "gols");
  const assistsRanking = rankPlayers(
    playerResult.players,
    "assists",
    "assistências",
  );
  const appearancesRanking = rankPlayers(
    playerResult.players,
    "matches",
    "jogos",
  );
  const cardRanking = rankPlayers(
    playerResult.players,
    "yellowCards",
    "cartões amarelos",
  );
  const goalParticipationRanking = rankPlayers(
    playerResult.players,
    "goalParticipation",
    "participações em gol",
  );
  const rankingWarnings = [
    ...validateExpectedRanking(
      "Artilharia",
      scoringRanking,
      EXPECTED_RANKINGS.scoring,
    ),
    ...validateExpectedRanking(
      "Assistências",
      assistsRanking,
      EXPECTED_RANKINGS.assists,
    ),
    ...validateExpectedRanking(
      "Presença",
      appearancesRanking,
      EXPECTED_RANKINGS.appearances,
    ),
  ];
  const statsWarnings = validateStats(rawStats);
  const competitions = getCompetitions();
  const seasons = getSeasons(sheets, matchResult.matches);

  await writeGeneratedFile(
    "players.generated.ts",
    toPlayersFile(playerResult.players, path.basename(inputPath)),
  );
  await writeGeneratedFile(
    "matches.generated.ts",
    toMatchesFile(matchResult.matches, path.basename(inputPath)),
  );
  await writeGeneratedFile(
    "stats.generated.ts",
    toStatsFile(rawStats, path.basename(inputPath)),
  );
  await writeGeneratedFile(
    "rankings.generated.ts",
    toRankingsFile(
      {
        scoringRanking,
        assistsRanking,
        appearancesRanking,
        cardRanking,
        goalParticipationRanking,
      },
      path.basename(inputPath),
    ),
  );
  await writeGeneratedFile(
    "competitions.generated.ts",
    toCompetitionsFile(competitions, path.basename(inputPath)),
  );
  await writeGeneratedFile(
    "seasons.generated.ts",
    toSeasonsFile(seasons, path.basename(inputPath)),
  );
  await writeGeneratedFile(
    "player-stats.generated.ts",
    toPlayerStatsFile(playerStatLines, path.basename(inputPath)),
  );

  logWarnings("Avisos de jogadores", playerResult.warnings);
  logWarnings(
    "Avisos de estatísticas por aba",
    statLineResults.flatMap((result) => result.warnings),
  );
  logWarnings("Avisos de jogos", matchResult.warnings);
  logWarnings("Avisos de rankings", rankingWarnings);
  logWarnings("Avisos de estatísticas", statsWarnings);

  console.log("\nImportação concluída.");
  console.log(`Jogadores gerados: ${playerResult.players.length}`);
  console.log(`Jogos gerados: ${matchResult.matches.length}`);
  console.log(`Linhas de estatísticas por aba geradas: ${playerStatLines.length}`);
  console.log(`Temporadas geradas: ${seasons.length}`);
  console.log(`Saída: ${path.relative(PROJECT_ROOT, GENERATED_DIR)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
