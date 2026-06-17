export type CompetitionKind =
  | "liga7"
  | "copa-futfudas"
  | "copa-amstel"
  | "chuteira"
  | "amistoso";

export type MatchStatus = "played" | "scheduled";

export type PlayerPosition =
  | "Goleiro"
  | "Fixo"
  | "Ala"
  | "Meia"
  | "Pivô";

export type Player = {
  id: string;
  slug: string;
  fullName: string;
  nickname: string;
  position: PlayerPosition;
  number?: number;
  image: string;
  joinedYear: number;
  bio: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    titles: number;
  };
};

export type Competition = {
  id: string;
  slug: CompetitionKind;
  name: string;
  shortName: string;
  description: string;
};

export type MatchTeam = {
  name: string;
  score?: number;
};

export type MatchContribution = {
  playerSlug: string;
  goals?: number;
  assists?: number;
};

export type Match = {
  id: string;
  slug: string;
  date: string;
  competitionId: string;
  round: string;
  venue: string;
  status: MatchStatus;
  home: MatchTeam;
  away: MatchTeam;
  image: string;
  summary: string;
  highlights: string[];
  contributions: MatchContribution[];
  relatedPlayerSlugs: string[];
  photoIds: string[];
};

export type RankingRow = {
  playerSlug: string;
  fullName: string;
  nickname: string;
  value: number;
  unit: string;
};

export type ClubStats = {
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  futFudasTitles: number;
};

export type Photo = {
  id: string;
  slug: string;
  title: string;
  albumId: string;
  image: string;
  alt: string;
  date: string;
  caption: string;
};

export type PhotoPlayer = {
  photoId: string;
  playerSlug: string;
};

export type Album = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  photoIds: string[];
  date: string;
};
