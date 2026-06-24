import type {
  FaceRecognitionProvider,
  FaceRecognitionMatch,
  IndexedPlayerFace,
  IndexPlayerFaceInput,
  SearchPhotoInput,
} from "./types";

function mockEmbedding(seed: string) {
  let state = Array.from(seed).reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    2166136261,
  );

  return Array.from({ length: 128 }, () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff - 0.5;
  });
}

export class MockFaceRecognitionProvider implements FaceRecognitionProvider {
  readonly name = "mock" as const;
  private readonly collectionId = "manochaco-mock";

  async createOrEnsureCollection() {
    return this.collectionId;
  }

  async indexPlayerFace(input: IndexPlayerFaceInput): Promise<IndexedPlayerFace> {
    return {
      provider: this.name,
      providerFaceId: `mock-${input.referenceId}`,
      providerCollectionId: this.collectionId,
      confidence: 1,
      embedding: mockEmbedding(input.externalImageId),
      embeddingModel: "mock-embedding-v1",
    };
  }

  async searchFacesInPhoto(input: SearchPhotoInput) {
    const reference = input.references[0];

    if (!reference) {
      return { facesDetected: 0, matches: [] };
    }

    const match: FaceRecognitionMatch = {
      provider: this.name,
      providerFaceId: reference.providerFaceId ?? `mock-${reference.referenceId}`,
      playerExternalId: reference.playerId,
      confidence: 0.95,
      boundingBox: { x: 0.35, y: 0.2, width: 0.3, height: 0.45 },
      raw: { simulated: true, model: "mock-embedding-v1" },
    };
    return { facesDetected: 1, matches: [match], model: "mock-embedding-v1" };
  }

  async deleteIndexedFace() {}
}
