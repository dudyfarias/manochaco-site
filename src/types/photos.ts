export type PhotoCategory =
  | "match"
  | "team"
  | "training"
  | "backstage"
  | "title"
  | "general";

export type PhotoTagType = "manual" | "ai_suggested" | "ai_confirmed";

export type FaceRecognitionStatus =
  | "not_processed"
  | "processing"
  | "processed"
  | "needs_review"
  | "approved"
  | "rejected";

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface Photo {
  id: string;
  slug: string;
  title: string;
  description?: string;
  url: string;
  alt: string;
  category: PhotoCategory;
  albumId?: string;
  matchId?: string;
  competitionSlug?: string;
  seasonSlug?: string;
  date?: string;
  uploadedAt?: string;
  faceRecognitionStatus: FaceRecognitionStatus;
  createdAt?: string;
}

export interface Album {
  id: string;
  slug: string;
  title: string;
  description?: string;
  coverImage: string;
  category: PhotoCategory;
  matchId?: string;
  competitionSlug?: string;
  seasonSlug?: string;
  date?: string;
  photoIds: string[];
}

export interface PhotoPlayerTag {
  id: string;
  photoId: string;
  playerId: string;
  playerSlug: string;
  tagType: PhotoTagType;
  confidence?: number;
  confirmedByAdmin: boolean;
  boundingBox?: BoundingBox;
  createdAt?: string;
}

export interface FaceDetectionSuggestion {
  id: string;
  photoId: string;
  suggestedPlayerId?: string;
  suggestedPlayerSlug?: string;
  confidence: number;
  boundingBox: BoundingBox;
  status: "pending" | "confirmed" | "changed" | "ignored";
}

export interface PlayerFaceReference {
  id: string;
  playerId: string;
  playerSlug: string;
  imageUrl: string;
  approvedForRecognition: boolean;
  consentGiven: boolean;
  createdAt?: string;
}
