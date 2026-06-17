import type { ClubStats, RankingRow } from "@/types";

export const clubStats: ClubStats = {
  matches: 36,
  wins: 17,
  draws: 7,
  losses: 12,
  goalsFor: 113,
  goalsAgainst: 83,
  goalDifference: 30,
  futFudasTitles: 2,
};

export const scoringRanking: RankingRow[] = [
  {
    playerSlug: "torres",
    fullName: "Alexandre Torres",
    nickname: "TORRES",
    value: 52,
    unit: "gols",
  },
  {
    playerSlug: "dudu",
    fullName: "Luiz Eduardo",
    nickname: "DUDU",
    value: 25,
    unit: "gols",
  },
  {
    playerSlug: "bruninho",
    fullName: "Bruno Guidotte",
    nickname: "BRUNINHO",
    value: 13,
    unit: "gols",
  },
  {
    playerSlug: "pedrinho",
    fullName: "Pedro Guidotte",
    nickname: "PEDRINHO",
    value: 10,
    unit: "gols",
  },
  {
    playerSlug: "jorge",
    fullName: "Jorge Costa",
    nickname: "JORGE",
    value: 8,
    unit: "gols",
  },
];

export const assistsRanking: RankingRow[] = [
  {
    playerSlug: "madeus",
    fullName: "Matheus de Paula",
    nickname: "MADEUS",
    value: 14,
    unit: "assistências",
  },
  {
    playerSlug: "bruninho",
    fullName: "Bruno Guidotte",
    nickname: "BRUNINHO",
    value: 12,
    unit: "assistências",
  },
  {
    playerSlug: "torres",
    fullName: "Alexandre Torres",
    nickname: "TORRES",
    value: 9,
    unit: "assistências",
  },
  {
    playerSlug: "dudu",
    fullName: "Luiz Eduardo",
    nickname: "DUDU",
    value: 8,
    unit: "assistências",
  },
  {
    playerSlug: "pedrinho",
    fullName: "Pedro Guidotte",
    nickname: "PEDRINHO",
    value: 6,
    unit: "assistências",
  },
];

export const appearancesRanking: RankingRow[] = [
  {
    playerSlug: "dudu",
    fullName: "Luiz Eduardo",
    nickname: "DUDU",
    value: 47,
    unit: "jogos",
  },
  {
    playerSlug: "nikollas",
    fullName: "Nikollas Javier",
    nickname: "NIKOLLAS",
    value: 46,
    unit: "jogos",
  },
  {
    playerSlug: "torres",
    fullName: "Alexandre Torres",
    nickname: "TORRES",
    value: 43,
    unit: "jogos",
  },
  {
    playerSlug: "ed-gou",
    fullName: "Eduardo Gouveia",
    nickname: "ED GOU",
    value: 41,
    unit: "jogos",
  },
  {
    playerSlug: "victor-erik",
    fullName: "Victor Erik",
    nickname: "VICTOR ERIK",
    value: 41,
    unit: "jogos",
  },
];
