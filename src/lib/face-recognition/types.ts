import type { BoundingBox } from "@/types";

export type FaceRecognitionProviderName =
  | "aws"
  | "mock"
  | "faceapi"
  | "insightface";

export interface FaceReferenceEmbedding {
  referenceId: string;
  playerId: string;
  playerSlug: string;
  embedding: number[];
  embeddingModel: string;
  providerFaceId?: string;
}

export interface IndexPlayerFaceInput {
  imageBytes?: Uint8Array;
  imageUrl?: string;
  externalImageId: string;
  referenceId: string;
}

export interface IndexedPlayerFace {
  provider: FaceRecognitionProviderName;
  providerFaceId: string;
  providerCollectionId: string;
  confidence?: number;
  embedding?: number[];
  embeddingModel?: string;
  raw?: unknown;
}

export interface SearchPhotoInput {
  imageBytes?: Uint8Array;
  imageUrl?: string;
  photoId: string;
  minConfidence: number;
  maxDistance: number;
  references: FaceReferenceEmbedding[];
}

export interface FaceRecognitionMatch {
  provider: FaceRecognitionProviderName;
  providerFaceId?: string;
  playerExternalId?: string;
  confidence: number;
  boundingBox: BoundingBox;
  faceEmbedding?: number[];
  matched?: boolean;
  raw?: unknown;
}

export interface FaceSearchResult {
  facesDetected: number;
  matches: FaceRecognitionMatch[];
  model?: string;
}

export interface FaceRecognitionHealth {
  ok: boolean;
  provider: FaceRecognitionProviderName;
  model?: string;
  modelLoaded?: boolean;
}

export interface FaceRecognitionProvider {
  readonly name: FaceRecognitionProviderName;
  createOrEnsureCollection(): Promise<string>;
  indexPlayerFace(input: IndexPlayerFaceInput): Promise<IndexedPlayerFace>;
  searchFacesInPhoto(input: SearchPhotoInput): Promise<FaceSearchResult>;
  deleteIndexedFace(providerFaceId: string): Promise<void>;
  health?(): Promise<FaceRecognitionHealth>;
}
