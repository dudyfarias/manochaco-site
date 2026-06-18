import type {
  FaceDetectionSuggestion,
  Photo,
  PhotoCategory,
  PhotoPlayerTag,
  PhotoTagType,
} from "@/types";
import type { SupabaseCompetitionRow } from "./competitionAdapter";

export type SupabasePhotoRow = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  url: string;
  alt?: string | null;
  category?: string | null;
  album_id?: string | null;
  match_id?: string | null;
  competition_id?: string | null;
  season_id?: string | null;
  date?: string | null;
  uploaded_at?: string | null;
  face_recognition_status?: string | null;
  created_at?: string | null;
};

export type SupabasePhotoPlayerTagRow = {
  id: string;
  photo_id: string;
  player_id: string;
  tag_type?: string | null;
  confidence?: number | null;
  confirmed_by_admin?: boolean | null;
  bounding_box?: PhotoPlayerTag["boundingBox"] | null;
  created_at?: string | null;
  players?: { slug?: string | null } | null;
};

export type SupabaseFaceSuggestionRow = {
  id: string;
  photo_id: string;
  suggested_player_id?: string | null;
  confidence: number;
  bounding_box: FaceDetectionSuggestion["boundingBox"];
  status: FaceDetectionSuggestion["status"];
  players?: { slug?: string | null } | null;
};

const categories: PhotoCategory[] = [
  "match",
  "team",
  "training",
  "backstage",
  "title",
  "general",
];

function toCategory(category?: string | null): PhotoCategory {
  return categories.includes(category as PhotoCategory)
    ? (category as PhotoCategory)
    : "general";
}

function toTagType(tagType?: string | null): PhotoTagType {
  if (tagType === "ai_suggested" || tagType === "ai_confirmed") {
    return tagType;
  }

  return "manual";
}

export function adaptPhoto(
  row: SupabasePhotoRow,
  relations: {
    competition?: SupabaseCompetitionRow;
    seasonSlug?: string;
  } = {},
): Photo {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? undefined,
    url: row.url,
    alt: row.alt ?? row.title,
    category: toCategory(row.category),
    albumId: row.album_id ?? undefined,
    matchId: row.match_id ?? undefined,
    competitionSlug: relations.competition?.slug ?? row.competition_id ?? undefined,
    seasonSlug: relations.seasonSlug ?? row.season_id ?? undefined,
    date: row.date ? `${row.date}T12:00:00-03:00` : undefined,
    uploadedAt: row.uploaded_at ?? undefined,
    faceRecognitionStatus:
      row.face_recognition_status === "processing" ||
      row.face_recognition_status === "processed" ||
      row.face_recognition_status === "needs_review" ||
      row.face_recognition_status === "approved" ||
      row.face_recognition_status === "rejected"
        ? row.face_recognition_status
        : "not_processed",
    createdAt: row.created_at ?? undefined,
  };
}

export function adaptPhotoPlayerTag(row: SupabasePhotoPlayerTagRow): PhotoPlayerTag {
  return {
    id: row.id,
    photoId: row.photo_id,
    playerId: row.player_id,
    playerSlug: row.players?.slug ?? row.player_id,
    tagType: toTagType(row.tag_type),
    confidence: row.confidence ?? undefined,
    confirmedByAdmin: row.confirmed_by_admin ?? false,
    boundingBox: row.bounding_box ?? undefined,
    createdAt: row.created_at ?? undefined,
  };
}

export function adaptFaceSuggestion(
  row: SupabaseFaceSuggestionRow,
): FaceDetectionSuggestion {
  return {
    id: row.id,
    photoId: row.photo_id,
    suggestedPlayerId: row.suggested_player_id ?? undefined,
    suggestedPlayerSlug: row.players?.slug ?? undefined,
    confidence: row.confidence,
    boundingBox: row.bounding_box,
    status: row.status,
  };
}
