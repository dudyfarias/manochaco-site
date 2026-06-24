import "server-only";

import {
  CreateCollectionCommand,
  DeleteFacesCommand,
  DescribeCollectionCommand,
  IndexFacesCommand,
  RekognitionClient,
  ResourceAlreadyExistsException,
  ResourceNotFoundException,
  SearchFacesCommand,
  type BoundingBox as AwsBoundingBox,
} from "@aws-sdk/client-rekognition";
import { FaceRecognitionError } from "./provider";
import type {
  FaceRecognitionMatch,
  FaceRecognitionProvider,
  IndexedPlayerFace,
  IndexPlayerFaceInput,
  SearchPhotoInput,
} from "./types";

type AwsConfig = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  collectionId: string;
};

function getAwsConfig(): AwsConfig {
  const region = process.env.AWS_REGION?.trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const collectionId =
    process.env.AWS_REKOGNITION_COLLECTION_ID?.trim() || "manochaco-players";

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new FaceRecognitionError(
      "aws_credentials_missing",
      "AWS_REGION, AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY são obrigatórias.",
      "As credenciais do Amazon Rekognition ainda não foram configuradas no servidor.",
    );
  }

  return { region, accessKeyId, secretAccessKey, collectionId };
}

function clampUnit(value: number | undefined) {
  return Math.min(1, Math.max(0, (value ?? 0) / 100));
}

function normalizeBoundingBox(box?: AwsBoundingBox): FaceRecognitionMatch["boundingBox"] {
  return {
    x: Math.min(1, Math.max(0, box?.Left ?? 0)),
    y: Math.min(1, Math.max(0, box?.Top ?? 0)),
    width: Math.min(1, Math.max(0, box?.Width ?? 0)),
    height: Math.min(1, Math.max(0, box?.Height ?? 0)),
  };
}

export class AwsRekognitionProvider implements FaceRecognitionProvider {
  readonly name = "aws" as const;
  private readonly client: RekognitionClient;
  private readonly collectionId: string;

  constructor() {
    const config = getAwsConfig();
    this.collectionId = config.collectionId;
    this.client = new RekognitionClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async createOrEnsureCollection() {
    try {
      await this.client.send(
        new DescribeCollectionCommand({ CollectionId: this.collectionId }),
      );
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }

      try {
        await this.client.send(
          new CreateCollectionCommand({ CollectionId: this.collectionId }),
        );
      } catch (createError) {
        if (!(createError instanceof ResourceAlreadyExistsException)) {
          throw createError;
        }
      }
    }

    return this.collectionId;
  }

  async indexPlayerFace(input: IndexPlayerFaceInput): Promise<IndexedPlayerFace> {
    if (!input.imageBytes) {
      throw new FaceRecognitionError("aws_image_missing", "Bytes da imagem ausentes.");
    }
    await this.createOrEnsureCollection();
    const response = await this.client.send(
      new IndexFacesCommand({
        CollectionId: this.collectionId,
        Image: { Bytes: input.imageBytes },
        ExternalImageId: input.externalImageId,
        MaxFaces: 1,
        QualityFilter: "HIGH",
        DetectionAttributes: ["DEFAULT"],
      }),
    );
    const record = response.FaceRecords?.[0];
    const faceId = record?.Face?.FaceId;

    if (!faceId) {
      throw new FaceRecognitionError(
        "face_not_indexed",
        "O Rekognition não encontrou um rosto utilizável na referência.",
        "Nenhum rosto com qualidade suficiente foi encontrado na foto de referência.",
      );
    }

    return {
      provider: this.name,
      providerFaceId: faceId,
      providerCollectionId: this.collectionId,
      confidence: clampUnit(record.FaceDetail?.Confidence),
      raw: {
        faceModelVersion: response.FaceModelVersion,
        unindexedFaces: response.UnindexedFaces?.length ?? 0,
      },
    };
  }

  async searchFacesInPhoto(input: SearchPhotoInput) {
    if (!input.imageBytes) {
      throw new FaceRecognitionError("aws_image_missing", "Bytes da imagem ausentes.");
    }
    await this.createOrEnsureCollection();
    const scanExternalId = `scan-${input.photoId}-${Date.now()}`.slice(0, 255);
    const indexed = await this.client.send(
      new IndexFacesCommand({
        CollectionId: this.collectionId,
        Image: { Bytes: input.imageBytes },
        ExternalImageId: scanExternalId,
        MaxFaces: 100,
        QualityFilter: "AUTO",
        DetectionAttributes: ["DEFAULT"],
      }),
    );
    const temporaryFaceIds = (indexed.FaceRecords ?? [])
      .map((record) => record.Face?.FaceId)
      .filter((faceId): faceId is string => Boolean(faceId));
    const temporarySet = new Set(temporaryFaceIds);

    try {
      const matches: FaceRecognitionMatch[] = [];

      // Sequential searches avoid bursting the account's Rekognition TPS quota.
      for (const record of indexed.FaceRecords ?? []) {
        const searchedFaceId = record.Face?.FaceId;
        const boundingBox = normalizeBoundingBox(record.FaceDetail?.BoundingBox);

        if (!searchedFaceId) {
          matches.push({
            provider: this.name,
            confidence: 0,
            boundingBox,
            raw: { reason: "missing_temporary_face_id" },
          });
          continue;
        }

        const result = await this.client.send(
          new SearchFacesCommand({
            CollectionId: this.collectionId,
            FaceId: searchedFaceId,
            FaceMatchThreshold: input.minConfidence * 100,
            MaxFaces: 100,
          }),
        );
        const match = result.FaceMatches?.find(
          (candidate) =>
            candidate.Face?.FaceId &&
            !temporarySet.has(candidate.Face.FaceId) &&
            !candidate.Face.ExternalImageId?.startsWith("scan-"),
        );

        matches.push({
          provider: this.name,
          providerFaceId: match?.Face?.FaceId,
          playerExternalId: match?.Face?.ExternalImageId,
          confidence: clampUnit(match?.Similarity),
          boundingBox,
          raw: {
            detection: record.FaceDetail,
            searchResponse: {
              searchedFaceId: result.SearchedFaceId,
              faceMatch: match,
              faceModelVersion: result.FaceModelVersion,
            },
          },
        });
      }

      return {
        facesDetected: indexed.FaceRecords?.length ?? 0,
        matches,
        model: indexed.FaceModelVersion,
      };
    } finally {
      if (temporaryFaceIds.length > 0) {
        try {
          await this.client.send(
            new DeleteFacesCommand({
              CollectionId: this.collectionId,
              FaceIds: temporaryFaceIds,
            }),
          );
        } catch (error) {
          console.error("[face-recognition] Falha ao remover rostos temporários", error);
        }
      }
    }
  }

  async deleteIndexedFace(providerFaceId: string) {
    await this.createOrEnsureCollection();
    await this.client.send(
      new DeleteFacesCommand({
        CollectionId: this.collectionId,
        FaceIds: [providerFaceId],
      }),
    );
  }
}
