import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const { data, error } = await supabase
    .from("player_face_references")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });
  const references = (assertAdminData(data, error, "player_face_references") ??
    []) as AdminFaceReferenceRow[];

  return Promise.all(
    references.map(async (reference) => {
      if (!reference.storage_path) {
        return reference;
      }

      const { data: signedData } = await supabase.storage
        .from("face-references")
        .createSignedUrl(reference.storage_path, 15 * 60);

      return { ...reference, signed_url: signedData?.signedUrl ?? null };
    }),
  );
}

export async function listPendingRecognitionPhotos() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("photos")
    .select("id, title, face_recognition_status")
    .in("face_recognition_status", ["not_processed", "queued", "error"])
    .order("uploaded_at", { ascending: true });

  return assertAdminData(data, error, "pending_recognition_photos") ?? [];
}

export async function listPendingFaceSuggestions() {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("face_detection_suggestions")
    .select("*, photos(id, title, url, alt), players(nickname, name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (assertAdminData(data, error, "face_detection_suggestions") ??
    []) as AdminFaceSuggestionRow[];
}
