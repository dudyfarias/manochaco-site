import type { Player, PlayerPosition, PlayerStatus } from "@/types";

export type SupabasePlayerRow = {
  id: string;
  slug: string;
  name: string;
  nickname: string;
  position?: string | null;
  shirt_number?: number | null;
  status?: string | null;
  profile_image_url?: string | null;
  bio?: string | null;
  created_at?: string | null;
};

export type SupabasePlayerMatchStatsRow = {
  player_id: string;
  was_present?: boolean | null;
  goals?: number | null;
  assists?: number | null;
  yellow_cards?: number | null;
  red_cards?: number | null;
};

export type PlayerStatsAggregate = {
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
};

const validPositions: PlayerPosition[] = [
  "Goleiro",
  "Ala",
  "Meio Campo",
  "Zagueiro",
  "Atacante",
];

function toPosition(position?: string | null): PlayerPosition {
  return validPositions.includes(position as PlayerPosition)
    ? (position as PlayerPosition)
    : "Meio Campo";
}

function toStatus(status?: string | null): PlayerStatus {
  if (status === "former" || status === "staff") {
    return status;
  }

  return "active";
}

export function aggregatePlayerStats(rows: SupabasePlayerMatchStatsRow[]) {
  return rows.reduce<Map<string, PlayerStatsAggregate>>((aggregate, row) => {
    const current =
      aggregate.get(row.player_id) ??
      {
        matches: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
      };

    current.matches += row.was_present === false ? 0 : 1;
    current.goals += row.goals ?? 0;
    current.assists += row.assists ?? 0;
    current.yellowCards += row.yellow_cards ?? 0;
    current.redCards += row.red_cards ?? 0;
    aggregate.set(row.player_id, current);

    return aggregate;
  }, new Map());
}

export function adaptPlayer(
  row: SupabasePlayerRow,
  stats?: PlayerStatsAggregate,
): Player {
  const shirtNumber = row.shirt_number ?? undefined;
  const joinedYear = row.created_at
    ? new Date(row.created_at).getFullYear()
    : 2014;
  const playerStats = stats ?? {
    matches: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
  };

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    fullName: row.name,
    nickname: row.nickname,
    position: toPosition(row.position),
    number: shirtNumber,
    shirtNumber,
    status: toStatus(row.status),
    image: row.profile_image_url ?? `/players/${row.slug}.jpg`,
    profileImage: row.profile_image_url ?? `/players/${row.slug}.jpg`,
    joinedYear,
    bio:
      row.bio ??
      `Atleta registrado na base do Clube Atlético Manochaco como ${row.nickname}.`,
    stats: {
      matches: playerStats.matches,
      goals: playerStats.goals,
      assists: playerStats.assists,
      yellowCards: playerStats.yellowCards,
      redCards: playerStats.redCards,
      goalParticipation: playerStats.goals + playerStats.assists,
    },
  };
}
