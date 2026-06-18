import {
  albums as localAlbums,
  clubStats as localClubStats,
  competitions as localCompetitions,
  faceSuggestions as localFaceSuggestions,
  matches as localMatches,
  photoPlayers as localPhotoPlayers,
  photos as localPhotos,
  players as localPlayers,
  playerStatLines as localPlayerStatLines,
  seasons as localSeasons,
} from "@/data";
import {
  adaptAlbum,
  type SupabaseAlbumRow,
} from "@/lib/adapters/albumAdapter";
import {
  adaptCompetition,
  type SupabaseCompetitionRow,
} from "@/lib/adapters/competitionAdapter";
import {
  adaptMatch,
  type SupabaseMatchRow,
} from "@/lib/adapters/matchAdapter";
import {
  adaptPlayer,
  aggregatePlayerStats,
  type SupabasePlayerMatchStatsRow,
  type SupabasePlayerRow,
} from "@/lib/adapters/playerAdapter";
import {
  adaptFaceSuggestion,
  adaptPhoto,
  adaptPhotoPlayerTag,
  type SupabaseFaceSuggestionRow,
  type SupabasePhotoPlayerTagRow,
  type SupabasePhotoRow,
} from "@/lib/adapters/photoAdapter";
import { getSupabasePublicClient } from "@/lib/supabase/public";
import {
  calculateMatchStats,
  generateRankingFromPlayers,
} from "@/lib/stats";
import type {
  Album,
  ClubStats,
  Competition,
  FaceDetectionSuggestion,
  Match,
  Photo,
  PhotoPlayerTag,
  Player,
  PlayerStatLine,
  RankingRow,
  Season,
} from "@/types";

type SupabaseSeasonRow = {
  id: string;
  slug: string;
  year: number;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
};

export type SiteRankings = {
  scoringRanking: RankingRow[];
  assistsRanking: RankingRow[];
  appearancesRanking: RankingRow[];
  goalParticipationRanking: RankingRow[];
  cardRanking: RankingRow[];
};

function logSupabaseFallback(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[supabase:fallback] ${scope}`, error);
  }
}

async function withSupabaseFallback<T>(
  scope: string,
  loader: () => Promise<T>,
  fallback: () => T,
) {
  const supabase = getSupabasePublicClient();

  if (!supabase) {
    return fallback();
  }

  try {
    return await loader();
  } catch (error) {
    logSupabaseFallback(scope, error);
    return fallback();
  }
}

function assertNoError(error: { message?: string } | null) {
  if (error) {
    throw new Error(error.message ?? "Supabase query failed");
  }
}

function adaptSeason(row: SupabaseSeasonRow): Season {
  return {
    id: row.slug,
    year: row.year,
    name: row.name,
    slug: row.slug,
    label: row.name,
    sourceSheets: [],
  };
}

async function loadCompetitionRows() {
  const supabase = getSupabasePublicClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .order("name");

  assertNoError(error);
  return (data ?? []) as SupabaseCompetitionRow[];
}

async function loadSeasonRows() {
  const supabase = getSupabasePublicClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("year");

  assertNoError(error);
  return (data ?? []) as SupabaseSeasonRow[];
}

export function getLocalPlayerBySlug(slug: string) {
  return localPlayers.find((player) => player.slug === slug);
}

export function getLocalCompetitionById(id: string) {
  return localCompetitions.find((competition) => competition.id === id);
}

export function getLocalPlayersForPhoto(photoId: string) {
  const relatedPlayers = getLocalConfirmedTagsForPhoto(photoId)
    .map((relation) =>
      localPlayers.find(
        (player) =>
          player.slug === relation.playerSlug || player.id === relation.playerId,
      ),
    )
    .filter((player): player is Player => Boolean(player));

  return relatedPlayers.filter(
    (player, index, allPlayers) =>
      allPlayers.findIndex((item) => item.id === player.id) === index,
  );
}

export function getLocalConfirmedTagsForPhoto(photoId: string) {
  return localPhotoPlayers.filter(
    (relation) => relation.photoId === photoId && isPublicPhotoTag(relation),
  );
}

export function isPublicPhotoTag(tag: PhotoPlayerTag) {
  return (
    tag.confirmedByAdmin &&
    (tag.tagType === "manual" || tag.tagType === "ai_confirmed")
  );
}

export async function getPlayers(): Promise<Player[]> {
  return withSupabaseFallback(
    "players",
    async () => {
      const supabase = getSupabasePublicClient();

      if (!supabase) {
        return localPlayers;
      }

      const [{ data: playerRows, error: playerError }, { data: statRows, error: statError }] =
        await Promise.all([
          supabase.from("players").select("*").order("nickname"),
          supabase.from("player_match_stats").select("*"),
        ]);

      assertNoError(playerError);
      assertNoError(statError);

      const statsByPlayer = aggregatePlayerStats(
        (statRows ?? []) as SupabasePlayerMatchStatsRow[],
      );

      return ((playerRows ?? []) as SupabasePlayerRow[]).map((row) =>
        adaptPlayer(row, statsByPlayer.get(row.id)),
      );
    },
    () => localPlayers,
  );
}

export async function getPlayerBySlug(slug: string) {
  const players = await getPlayers();
  return players.find((player) => player.slug === slug);
}

export async function getCompetitions(): Promise<Competition[]> {
  return withSupabaseFallback(
    "competitions",
    async () => (await loadCompetitionRows()).map(adaptCompetition),
    () => localCompetitions,
  );
}

export async function getCompetitionById(id: string) {
  const competitions = await getCompetitions();
  return competitions.find((competition) => competition.id === id);
}

export async function getSeasons(): Promise<Season[]> {
  return withSupabaseFallback(
    "seasons",
    async () => (await loadSeasonRows()).map(adaptSeason),
    () => localSeasons,
  );
}

export async function getMatches(): Promise<Match[]> {
  return withSupabaseFallback(
    "matches",
    async () => {
      const supabase = getSupabasePublicClient();

      if (!supabase) {
        return localMatches;
      }

      const [competitionRows, seasonRows, { data, error }] = await Promise.all([
        loadCompetitionRows(),
        loadSeasonRows(),
        supabase.from("matches").select("*").order("date", { ascending: false }),
      ]);

      assertNoError(error);

      const competitionByUuid = new Map(
        competitionRows.map((competition) => [competition.id, competition]),
      );
      const seasonByUuid = new Map(
        seasonRows.map((season) => [season.id, adaptSeason(season)]),
      );

      return ((data ?? []) as SupabaseMatchRow[]).map((row) =>
        adaptMatch(row, {
          competition: row.competition_id
            ? competitionByUuid.get(row.competition_id)
            : undefined,
          season: row.season_id ? seasonByUuid.get(row.season_id) : undefined,
        }),
      );
    },
    () => localMatches,
  );
}

export async function getMatchBySlug(slug: string) {
  const matches = await getMatches();
  return matches.find((match) => match.slug === slug);
}

export async function getAlbums(): Promise<Album[]> {
  return withSupabaseFallback(
    "albums",
    async () => {
      const supabase = getSupabasePublicClient();

      if (!supabase) {
        return localAlbums;
      }

      const [competitionRows, seasonRows, { data: albumRows, error }, { data: photoRows, error: photoError }] =
        await Promise.all([
          loadCompetitionRows(),
          loadSeasonRows(),
          supabase.from("albums").select("*").order("date", { ascending: false }),
          supabase.from("photos").select("id, album_id"),
        ]);

      assertNoError(error);
      assertNoError(photoError);

      const competitionByUuid = new Map(
        competitionRows.map((competition) => [competition.id, competition]),
      );
      const seasonByUuid = new Map(
        seasonRows.map((season) => [season.id, adaptSeason(season)]),
      );
      const photoIdsByAlbum = new Map<string, string[]>();

      (photoRows ?? []).forEach((photo) => {
        const albumId = (photo as { album_id?: string | null }).album_id;
        const photoId = (photo as { id: string }).id;

        if (!albumId) {
          return;
        }

        photoIdsByAlbum.set(albumId, [...(photoIdsByAlbum.get(albumId) ?? []), photoId]);
      });

      return ((albumRows ?? []) as SupabaseAlbumRow[]).map((row) =>
        adaptAlbum(row, {
          competition: row.competition_id
            ? competitionByUuid.get(row.competition_id)
            : undefined,
          seasonSlug: row.season_id ? seasonByUuid.get(row.season_id)?.slug : undefined,
          photoIds: photoIdsByAlbum.get(row.id) ?? [],
        }),
      );
    },
    () => localAlbums,
  );
}

export async function getAlbumById(id: string) {
  const albums = await getAlbums();
  return albums.find((album) => album.id === id);
}

export async function getAlbumBySlug(slug: string) {
  const albums = await getAlbums();
  return albums.find((album) => album.slug === slug);
}

export async function getPhotos(): Promise<Photo[]> {
  return withSupabaseFallback(
    "photos",
    async () => {
      const supabase = getSupabasePublicClient();

      if (!supabase) {
        return localPhotos;
      }

      const [competitionRows, seasonRows, { data, error }] = await Promise.all([
        loadCompetitionRows(),
        loadSeasonRows(),
        supabase.from("photos").select("*").order("date", { ascending: false }),
      ]);

      assertNoError(error);

      const competitionByUuid = new Map(
        competitionRows.map((competition) => [competition.id, competition]),
      );
      const seasonByUuid = new Map(
        seasonRows.map((season) => [season.id, adaptSeason(season)]),
      );

      return ((data ?? []) as SupabasePhotoRow[]).map((row) =>
        adaptPhoto(row, {
          competition: row.competition_id
            ? competitionByUuid.get(row.competition_id)
            : undefined,
          seasonSlug: row.season_id ? seasonByUuid.get(row.season_id)?.slug : undefined,
        }),
      );
    },
    () => localPhotos,
  );
}

export async function getPhotoBySlug(slug: string) {
  const photos = await getPhotos();
  return photos.find((photo) => photo.slug === slug);
}

export async function getConfirmedPhotoTags(): Promise<PhotoPlayerTag[]> {
  return withSupabaseFallback(
    "photo_player_tags",
    async () => {
      const supabase = getSupabasePublicClient();

      if (!supabase) {
        return localPhotoPlayers.filter(isPublicPhotoTag);
      }

      const { data, error } = await supabase
        .from("photo_player_tags")
        .select("*, players(slug)")
        .eq("confirmed_by_admin", true)
        .in("tag_type", ["manual", "ai_confirmed"]);

      assertNoError(error);

      return ((data ?? []) as SupabasePhotoPlayerTagRow[])
        .map(adaptPhotoPlayerTag)
        .filter(isPublicPhotoTag);
    },
    () => localPhotoPlayers.filter(isPublicPhotoTag),
  );
}

export async function getConfirmedTagsForPhoto(photoId: string) {
  const tags = await getConfirmedPhotoTags();
  return tags.filter((relation) => relation.photoId === photoId);
}

export async function getPhotosForAlbum(albumId: string) {
  const [album, photos] = await Promise.all([getAlbumById(albumId), getPhotos()]);

  if (!album) {
    return [];
  }

  const albumPhotoIds = new Set(album.photoIds);
  return photos.filter(
    (photo) => photo.albumId === album.id || albumPhotoIds.has(photo.id),
  );
}

export async function getPhotosForMatch(
  matchId: string,
  fallbackPhotoIds: string[] = [],
) {
  const photos = await getPhotos();
  const relatedPhotoIds = new Set(fallbackPhotoIds);

  photos.forEach((photo) => {
    if (photo.matchId === matchId) {
      relatedPhotoIds.add(photo.id);
    }
  });

  return photos.filter((photo) => relatedPhotoIds.has(photo.id));
}

export async function getAlbumForMatch(matchId: string) {
  const albums = await getAlbums();
  return albums.find((album) => album.matchId === matchId);
}

export async function getPhotosForPlayer(playerSlug: string) {
  const [player, tags, photos] = await Promise.all([
    getPlayerBySlug(playerSlug),
    getConfirmedPhotoTags(),
    getPhotos(),
  ]);
  const uniquePhotoIds = new Set(
    tags
      .filter(
        (relation) =>
          relation.playerSlug === playerSlug || relation.playerId === player?.id,
      )
      .map((relation) => relation.photoId),
  );

  return photos.filter((photo) => uniquePhotoIds.has(photo.id));
}

export async function getPlayersForPhoto(photoId: string) {
  const [tags, players] = await Promise.all([
    getConfirmedTagsForPhoto(photoId),
    getPlayers(),
  ]);
  const relatedPlayers = tags
    .map((relation) =>
      players.find(
        (player) =>
          player.slug === relation.playerSlug || player.id === relation.playerId,
      ),
    )
    .filter((player): player is Player => Boolean(player));

  return relatedPlayers.filter(
    (player, index, allPlayers) =>
      allPlayers.findIndex((item) => item.id === player.id) === index,
  );
}

export async function getPendingFaceSuggestions(): Promise<FaceDetectionSuggestion[]> {
  return withSupabaseFallback(
    "face_detection_suggestions",
    async () => {
      const supabase = getSupabasePublicClient();

      if (!supabase) {
        return localFaceSuggestions.filter((suggestion) => suggestion.status === "pending");
      }

      const { data, error } = await supabase
        .from("face_detection_suggestions")
        .select("*, players(slug)")
        .eq("status", "pending");

      assertNoError(error);

      return ((data ?? []) as SupabaseFaceSuggestionRow[]).map(adaptFaceSuggestion);
    },
    () => localFaceSuggestions.filter((suggestion) => suggestion.status === "pending"),
  );
}

export async function getMatchesForPlayer(playerSlug: string) {
  const matches = await getMatches();
  return matches.filter((match) => match.relatedPlayerSlugs.includes(playerSlug));
}

export async function getPlayedMatches() {
  const matches = await getMatches();
  return matches
    .filter((match) => match.status === "played")
    .sort((first, second) => second.date.localeCompare(first.date));
}

export async function getScheduledMatches() {
  const matches = await getMatches();
  return matches
    .filter((match) => match.status === "scheduled")
    .sort((first, second) => first.date.localeCompare(second.date));
}

export async function getStats(): Promise<ClubStats> {
  return withSupabaseFallback(
    "stats",
    async () => {
      const matches = await getMatches();
      const calculated = calculateMatchStats(matches);

      return {
        ...calculated,
        titles: localClubStats.titles,
        futFudasTitles: localClubStats.futFudasTitles,
      };
    },
    () => localClubStats,
  );
}

export async function getRankings(limit = 10): Promise<SiteRankings> {
  const players = await getPlayers();

  return {
    scoringRanking: generateRankingFromPlayers(players, "goals", limit),
    assistsRanking: generateRankingFromPlayers(players, "assists", limit),
    appearancesRanking: generateRankingFromPlayers(players, "matches", limit),
    goalParticipationRanking: generateRankingFromPlayers(
      players,
      "goalParticipation",
      limit,
    ),
    cardRanking: generateRankingFromPlayers(players, "yellowCards", limit),
  };
}

export async function getPlayerStatLines(): Promise<PlayerStatLine[]> {
  return localPlayerStatLines;
}
