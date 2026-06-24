import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  adaptPlayerCompetitionStat,
  type SupabasePlayerCompetitionStatRow,
} from "@/lib/adapters/playerStatsAdapter";
import {
  getPhotoQueueReason,
  isPhotoProcessable,
} from "@/lib/photo-pipeline";
import { buildStatsConsistencyReport } from "@/lib/stats-consistency";
import type { HistoricalPlayerStatLine } from "@/types";

export type AdminPlayerRow = {
  id: string;
  slug: string;
  name: string;
  nickname: string;
  position: string | null;
  shirt_number: number | null;
  dominant_foot: string | null;
  status: string;
  profile_image_url: string | null;
  bio: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AdminCompetitionRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  description: string | null;
  type: string;
  created_at?: string | null;
};

export type AdminSeasonRow = {
  id: string;
  slug: string;
  year: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
};

export type AdminMatchRow = {
  id: string;
  slug: string;
  date: string | null;
  opponent: string;
  competition_id: string | null;
  season_id: string | null;
  manochaco_score: number;
  opponent_score: number;
  result: string;
  stage: string | null;
  location: string | null;
  summary: string | null;
  cover_image_url: string | null;
  created_at?: string | null;
};

export type AdminPlayerMatchStatRow = {
  id: string;
  player_id: string;
  match_id: string;
  was_present: boolean;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  was_goalkeeper: boolean;
  goals_conceded: number | null;
  players?: {
    nickname?: string | null;
    name?: string | null;
  } | null;
};

export type AdminPlayerCompetitionStatRow = {
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
  updated_at: string | null;
  competitions?: {
    slug?: string | null;
    name?: string | null;
  } | null;
  seasons?: {
    slug?: string | null;
    name?: string | null;
  } | null;
};

export type AdminAlbumRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  cover_image_url: string | null;
  match_id: string | null;
  competition_id: string | null;
  season_id: string | null;
  date: string | null;
};

export type AdminPhotoRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  url: string;
  alt: string | null;
  category: string;
  album_id: string | null;
  match_id: string | null;
  competition_id: string | null;
  season_id: string | null;
  date: string | null;
  uploaded_at: string | null;
  face_recognition_status: string;
  is_public?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AdminPhotoTagRow = {
  id: string;
  photo_id: string;
  player_id: string;
  tag_type: string;
  confidence: number | null;
  confirmed_by_admin: boolean;
  players?: {
    slug?: string | null;
    nickname?: string | null;
    name?: string | null;
  } | null;
};

export type AdminFaceSuggestionRow = {
  id: string;
  photo_id: string;
  suggested_player_id: string | null;
  confidence: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  provider: string | null;
  provider_face_id: string | null;
  status: "pending" | "confirmed" | "changed" | "ignored" | "error";
  photos?: {
    id?: string | null;
    title?: string | null;
    url?: string | null;
    alt?: string | null;
  } | null;
  players?: {
    nickname?: string | null;
    name?: string | null;
  } | null;
};

export type AdminFaceReferenceRow = {
  id: string;
  player_id: string;
  image_url: string;
  storage_path: string | null;
  provider: string | null;
  provider_face_id: string | null;
  provider_collection_id: string | null;
  embedding: unknown;
  embedding_model: string | null;
  embedding_generated_at: string | null;
  approved_for_recognition: boolean;
  consent_given: boolean;
  indexing_status: "not_indexed" | "indexing" | "indexed" | "error";
  indexing_error: string | null;
  indexed_at: string | null;
  created_at: string | null;
  signed_url?: string | null;
  face_embedding_id?: string | null;
};

export type AdminFaceEmbeddingRow = {
  id: string;
  player_id: string;
  face_reference_id: string;
  embedding_model: string;
  provider: string;
  consent_given: boolean;
  approved_for_recognition: boolean;
  updated_at: string | null;
};

export type AdminConfirmedPhotoTagRow = {
  id: string;
  photo_id: string;
  player_id: string;
  tag_type: string;
  confidence: number | null;
  confirmed_by_admin: boolean;
  created_at: string | null;
  photos?: {
    id?: string | null;
    slug?: string | null;
    title?: string | null;
    url?: string | null;
    is_public?: boolean | null;
  } | null;
  players?: {
    id?: string | null;
    slug?: string | null;
    nickname?: string | null;
    name?: string | null;
  } | null;
};

export type AdminPhotoDiagnosticRow = AdminPhotoRow & {
  albumTitle: string | null;
  suggestionCount: number;
  pendingSuggestionCount: number;
  confirmedTagCount: number;
  appearsInQueue: boolean;
  queueReason: string;
};

export type PhotoRecognitionSummary = {
  total: number;
  pending: number;
  processing: number;
  needsReview: number;
  processed: number;
  approved: number;
  errors: number;
  withoutUrl: number;
  confirmedTags: number;
};

export type AdminMemberProfileRow = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  account_type: "supporter" | "player" | "candidate" | "partner";
  status: "pending" | "active" | "rejected" | "blocked";
  linked_player_id: string | null;
  preferred_position: string | null;
  birth_date: string | null;
  privacy_accepted_at: string | null;
  created_at: string | null;
  players?: {
    id?: string | null;
    slug?: string | null;
    nickname?: string | null;
    name?: string | null;
  } | null;
};

export async function getAdminSupabase() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase não configurado.");
  }

  return supabase;
}

function assertAdminData<T>(
  data: T | null,
  error: { message?: string } | null,
  scope: string,
) {
  if (error) {
    throw new Error(`${scope}: ${error.message ?? "erro ao consultar Supabase"}`);
  }

  return data;
}

export async function listAdminPlayers() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("nickname");

  return (assertAdminData(data, error, "players") ?? []) as AdminPlayerRow[];
}

export async function listAdminMemberProfiles() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("member_profiles")
    .select("*, players(id, slug, nickname, name)")
    .order("created_at", { ascending: false });

  return (assertAdminData(data, error, "member_profiles") ?? []) as AdminMemberProfileRow[];
}

export async function getAdminPlayer(id: string) {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return assertAdminData(data, error, "player") as AdminPlayerRow | null;
}

export async function listAdminCompetitions() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .order("name");

  return (assertAdminData(data, error, "competitions") ?? []) as AdminCompetitionRow[];
}

export async function listAdminSeasons() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("year", { ascending: false });

  return (assertAdminData(data, error, "seasons") ?? []) as AdminSeasonRow[];
}

export async function listAdminMatches() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("date", { ascending: false });

  return (assertAdminData(data, error, "matches") ?? []) as AdminMatchRow[];
}

export async function getAdminMatch(id: string) {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return assertAdminData(data, error, "match") as AdminMatchRow | null;
}

export async function listPlayerMatchStats(matchId: string) {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("player_match_stats")
    .select("*, players(nickname, name)")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false });

  return (assertAdminData(data, error, "player_match_stats") ?? []) as AdminPlayerMatchStatRow[];
}

export async function listPlayerCompetitionStats(playerId: string) {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("player_competition_stats")
    .select(
      "id, player_id, competition_id, season_id, source_sheet, matches, goals, assists, yellow_cards, red_cards, clean_sheets, goals_conceded, updated_at, competitions(slug, name), seasons(slug, name)",
    )
    .eq("player_id", playerId)
    .order("source_sheet");

  return (assertAdminData(data, error, "player_competition_stats") ??
    []) as unknown as AdminPlayerCompetitionStatRow[];
}

export async function getStatsConsistencyDiagnostic() {
  const supabase = await getAdminSupabase();
  const [granularResult, historicalResult] = await Promise.all([
    supabase
      .from("player_competition_stats")
      .select(
        "id, player_id, competition_id, season_id, source_sheet, matches, goals, assists, yellow_cards, red_cards, clean_sheets, goals_conceded, players!inner(slug, name, nickname), competitions!inner(slug, name), seasons!inner(slug, name)",
      ),
    supabase
      .from("player_historical_stats")
      .select(
        "player_id, source_sheet, matches, goals, assists, yellow_cards, red_cards, clean_sheets, goals_conceded, players!inner(slug, name, nickname)",
      ),
  ]);

  const granularRows = (assertAdminData(
    granularResult.data,
    granularResult.error,
    "stats_consistency.granular",
  ) ?? []) as unknown as SupabasePlayerCompetitionStatRow[];
  const historicalRows = (assertAdminData(
    historicalResult.data,
    historicalResult.error,
    "stats_consistency.historical",
  ) ?? []) as unknown as Array<{
    source_sheet: string;
    matches: number;
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    clean_sheets: number;
    goals_conceded: number;
    players?: { slug?: string; name?: string; nickname?: string } | null;
  }>;
  const statLines = granularRows.map(adaptPlayerCompetitionStat);
  const historicalLines = historicalRows.map<HistoricalPlayerStatLine>((row) => ({
    playerSlug: row.players?.slug ?? "jogador-sem-slug",
    fullName: row.players?.name ?? "Jogador sem nome",
    nickname: row.players?.nickname ?? "-",
    sourceSheet: row.source_sheet,
    matches: row.matches,
    goals: row.goals,
    assists: row.assists,
    yellowCards: row.yellow_cards,
    redCards: row.red_cards,
    cleanSheets: row.clean_sheets,
    goalsConceded: row.goals_conceded,
  }));

  return buildStatsConsistencyReport({
    sourceFile: "Supabase",
    granularSheets: [...new Set(statLines.map((line) => line.sourceSheet))],
    validationSheets: [...new Set(historicalLines.map((line) => line.sourceSheet))],
    statLines,
    historicalLines,
  });
}

export async function listAdminAlbums() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .order("date", { ascending: false });

  return (assertAdminData(data, error, "albums") ?? []) as AdminAlbumRow[];
}

export async function listAdminPhotos() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("uploaded_at", { ascending: false });

  return (assertAdminData(data, error, "photos") ?? []) as AdminPhotoRow[];
}

export async function listConfirmedPhotoTags(playerId?: string) {
  const supabase = await getAdminSupabase();
  let query = supabase
    .from("photo_player_tags")
    .select(
      "id, photo_id, player_id, tag_type, confidence, confirmed_by_admin, created_at, photos(id, slug, title, url, is_public), players(id, slug, nickname, name)",
    )
    .eq("confirmed_by_admin", true)
    .in("tag_type", ["manual", "ai_confirmed"])
    .order("created_at", { ascending: false });

  if (playerId) query = query.eq("player_id", playerId);
  const { data, error } = await query;

  return (assertAdminData(data, error, "confirmed_photo_tags") ??
    []) as unknown as AdminConfirmedPhotoTagRow[];
}

export async function listPhotoDiagnostics(): Promise<AdminPhotoDiagnosticRow[]> {
  const supabase = await getAdminSupabase();
  const [photosResult, suggestionsResult, tagsResult, albumsResult] =
    await Promise.all([
      supabase.from("photos").select("*").order("uploaded_at", { ascending: false }),
      supabase.from("face_detection_suggestions").select("photo_id, status"),
      supabase
        .from("photo_player_tags")
        .select("photo_id, confirmed_by_admin"),
      supabase.from("albums").select("id, title"),
    ]);

  const photos = (assertAdminData(
    photosResult.data,
    photosResult.error,
    "photo_diagnostics.photos",
  ) ?? []) as AdminPhotoRow[];
  const suggestions = assertAdminData(
    suggestionsResult.data,
    suggestionsResult.error,
    "photo_diagnostics.suggestions",
  ) ?? [];
  const tags = assertAdminData(
    tagsResult.data,
    tagsResult.error,
    "photo_diagnostics.tags",
  ) ?? [];
  const albums = assertAdminData(
    albumsResult.data,
    albumsResult.error,
    "photo_diagnostics.albums",
  ) ?? [];
  const albumTitles = new Map(
    albums.map((album) => [album.id as string, album.title as string]),
  );

  return photos.map((photo) => {
    const photoSuggestions = suggestions.filter(
      (suggestion) => suggestion.photo_id === photo.id,
    );
    const pendingSuggestionCount = photoSuggestions.filter(
      (suggestion) => suggestion.status === "pending",
    ).length;
    const confirmedTagCount = tags.filter(
      (tag) => tag.photo_id === photo.id && tag.confirmed_by_admin,
    ).length;

    return {
      ...photo,
      albumTitle: photo.album_id ? albumTitles.get(photo.album_id) ?? null : null,
      suggestionCount: photoSuggestions.length,
      pendingSuggestionCount,
      confirmedTagCount,
      appearsInQueue: isPhotoProcessable(photo.face_recognition_status, photo.url),
      queueReason: getPhotoQueueReason({
        status: photo.face_recognition_status,
        url: photo.url,
        pendingSuggestions: pendingSuggestionCount,
      }),
    };
  });
}

export async function getPhotoRecognitionSummary(): Promise<PhotoRecognitionSummary> {
  const [photos, confirmedTags] = await Promise.all([
    listPhotoDiagnostics(),
    listConfirmedPhotoTags(),
  ]);

  return {
    total: photos.length,
    pending: photos.filter((photo) => photo.appearsInQueue).length,
    processing: photos.filter((photo) => photo.face_recognition_status === "processing").length,
    needsReview: photos.filter((photo) => photo.face_recognition_status === "needs_review").length,
    processed: photos.filter((photo) => photo.face_recognition_status === "processed").length,
    approved: photos.filter((photo) => photo.face_recognition_status === "approved").length,
    errors: photos.filter((photo) => photo.face_recognition_status === "error").length,
    withoutUrl: photos.filter((photo) => !photo.url?.trim()).length,
    confirmedTags: confirmedTags.length,
  };
}

export async function getAdminPhoto(id: string) {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return assertAdminData(data, error, "photo") as AdminPhotoRow | null;
}

export async function listPhotoTags(photoId: string) {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("photo_player_tags")
    .select("*, players(slug, nickname, name)")
    .eq("photo_id", photoId)
    .order("created_at", { ascending: false });

  return (assertAdminData(data, error, "photo_player_tags") ?? []) as AdminPhotoTagRow[];
}

export async function listPlayerFaceReferences(playerId: string) {
  const supabase = await getAdminSupabase();
  const [{ data, error }, embeddingResult] = await Promise.all([
    supabase
      .from("player_face_references")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("player_face_embeddings")
      .select("id, player_id, face_reference_id, embedding_model, provider, consent_given, approved_for_recognition, updated_at")
      .eq("player_id", playerId),
  ]);
  const references = (assertAdminData(data, error, "player_face_references") ??
    []) as AdminFaceReferenceRow[];
  const embeddings = (assertAdminData(
    embeddingResult.data,
    embeddingResult.error,
    "player_face_embeddings",
  ) ?? []) as AdminFaceEmbeddingRow[];
  const embeddingByReference = new Map(
    embeddings.map((embedding) => [embedding.face_reference_id, embedding]),
  );

  return Promise.all(
    references.map(async (reference) => {
      const embedding = embeddingByReference.get(reference.id);
      const enrichedReference = {
        ...reference,
        embedding: null,
        embedding_model: embedding?.embedding_model ?? reference.embedding_model,
        embedding_generated_at: embedding?.updated_at ?? reference.embedding_generated_at,
        face_embedding_id: embedding?.id ?? null,
      };
      if (!reference.storage_path) {
        return enrichedReference;
      }

      const { data: signedData } = await supabase.storage
        .from("face-references")
        .createSignedUrl(reference.storage_path, 15 * 60);

      return { ...enrichedReference, signed_url: signedData?.signedUrl ?? null };
    }),
  );
}

export async function countPlayerFaceEmbeddings() {
  const supabase = await getAdminSupabase();
  const { count, error } = await supabase
    .from("player_face_embeddings")
    .select("id", { count: "exact", head: true });
  assertAdminData(null, error, "player_face_embeddings.count");
  return count ?? 0;
}

export async function listPendingRecognitionPhotos() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("photos")
    .select("id, title, url, face_recognition_status")
    .in("face_recognition_status", ["not_processed", "queued", "error"])
    .order("uploaded_at", { ascending: true });

  return (assertAdminData(data, error, "pending_recognition_photos") ?? []).filter(
    (photo) => isPhotoProcessable(photo.face_recognition_status, photo.url),
  );
}

export async function listPendingFaceSuggestions() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("face_detection_suggestions")
    .select("*, photos(id, title, url, alt), players(id, slug, nickname, name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (assertAdminData(data, error, "face_detection_suggestions") ??
    []) as AdminFaceSuggestionRow[];
}
