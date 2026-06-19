import type { BoundingBox } from "@/types";

export type FaceRecognitionProviderName = "aws" | "mock";

export interface IndexPlayerFaceInput {
  imageBytes: Uint8Array;
  externalImageId: string;
  referenceId: string;
}

export interface IndexedPlayerFace {
  provider: FaceRecognitionProviderName;
  providerFaceId: string;
  providerCollectionId: string;
  confidence?: number;
  raw?: unknown;
}

export interface SearchPhotoInput {
  imageBytes: Uint8Array;
  photoId: string;
  minConfidence: number;
}

export interface FaceRecognitionMatch {
  provider: FaceRecognitionProviderName;
  providerFaceId?: string;
  playerExternalId?: string;
  confidence: number;
  boundingBox: BoundingBox;
  raw?: unknown;
}

export interface FaceRecognitionProvider {
  readonly name: FaceRecognitionProviderName;
  createOrEnsureCollection(): Promise<string>;
  indexPlayerFace(input: IndexPlayerFaceInput): Promise<IndexedPlayerFace>;
  searchFacesInPhoto(input: SearchPhotoInput): Promise<FaceRecognitionMatch[]>;
  deleteIndexedFace(providerFaceId: string): Promise<void>;
}
