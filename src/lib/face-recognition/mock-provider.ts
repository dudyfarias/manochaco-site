import type {
  FaceRecognitionProvider,
  IndexedPlayerFace,
  IndexPlayerFaceInput,
} from "./types";

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
    };
  }

  async searchFacesInPhoto() {
    return [];
  }

  async deleteIndexedFace() {}
}
