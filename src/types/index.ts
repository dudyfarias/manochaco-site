export type CompetitionKind =
  | "liga7"
  | "copa-futfudas"
  | "copa-amstel"
  | "chuteira"
  | "amistoso";

export type CompetitionType = "league" | "cup" | "friendly" | "other";

export type MatchStatus = "played" | "scheduled";

export type MatchResult = "win" | "draw" | "loss";

export type PlayerPosition =
  | "Goleiro"
  | "Ala"
  | "Meio Campo"
  | "Zagueiro"
  | "Atacante";

export type PlayerStatus = "active" | "former" | "staff";

export type {
  Album,
  BoundingBox,
  FaceDetectionSuggestion,
  FaceRecognitionStatus,
  Photo,
  PhotoCategory,
  PhotoPlayerTag,
  PhotoTagType,
  PlayerFaceReference,
} from "./photos";

export type Player = {
  id: string;
  slug: string;
  name?: string;
  fullName: string;
  nickname: string;
  position: PlayerPosition;
  number?: number;
  shirtNumber?: number;
  status: PlayerStatus;
  image: string;
  profileImage?: string;
  joinedYear: number;
  bio: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    yellowCards?: number;
    redCards?: number;
    goalParticipation?: number;
  };
};

export type Competition = {
  id: string;
  slug: CompetitionKind;
  name: string;
  shortName: string;
  description: string;
  type: CompetitionType;
};

export type Season = {
  id: string;
  year: number;
  name: string;
  slug: string;
  label: string;
  sourceSheets: string[];
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
  opponent?: string;
  competition?: string;
  competitionSlug?: string;
  season?: string;
  seasonSlug?: string;
  manochacoScore?: number;
  opponentScore?: number;
  result?: MatchResult;
  stage?: string;
  location?: string;
  home: MatchTeam;
  away: MatchTeam;
  image: string;
  summary: string;
  highlights: string[];
  contributions: MatchContribution[];
  relatedPlayerSlugs: string[];
  photoIds: string[];
};

export type PlayerStatLine = {
  id: string;
  playerSlug: string;
  fullName: string;
  nickname: string;
  competitionId?: string;
  competitionSlug?: string;
  season?: string;
  seasonSlug?: string;
  sourceSheet: string;
  matches: number;
  goals: number;
  assists: number;
  yellowCards?: number;
  redCards?: number;
  goalParticipation: number;
};

export type RankingRow = {
  playerSlug: string;
  fullName: string;
  nickname: string;
  value: number;
  unit: string;
};

export type ClubStats = {
  totalMatches: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  winRate: number;
  titles: number;
  futFudasTitles: number;
};

export type StaffMember = {
  id: string;
  name: string;
  slug: string;
  playerSlug?: string;
  role: string;
  period: string;
  status: "current" | "former";
  image: string;
  summary: string;
  highlights: string[];
};
