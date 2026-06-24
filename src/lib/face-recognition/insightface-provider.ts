import "server-only";

import { FaceRecognitionError } from "./provider";
import type {
  FaceRecognitionHealth,
  FaceRecognitionMatch,
  FaceRecognitionProvider,
  IndexedPlayerFace,
  IndexPlayerFaceInput,
  SearchPhotoInput,
} from "./types";

type InsightFaceConfig = {
  apiUrl: string;
  apiKey: string;
};

type EmbedResponse = {
  success?: boolean;
  facesDetected?: number;
  embedding?: unknown;
  boundingBox?: unknown;
  model?: string;
};

type ProcessResponse = {
  success?: boolean;
  facesDetected?: number;
  suggestions?: unknown;
  model?: string;
};

function getInsightFaceConfig(): InsightFaceConfig {
  const rawUrl = process.env.FACE_RECOGNITION_API_URL?.trim();
  const apiKey = process.env.FACE_RECOGNITION_API_KEY?.trim();
  if (!rawUrl || !apiKey) {
    throw new FaceRecognitionError(
      "insightface_config_missing",
      "FACE_RECOGNITION_API_URL e FACE_RECOGNITION_API_KEY são obrigatórias.",
      "O microserviço InsightFace ainda não foi configurado no servidor.",
    );
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new FaceRecognitionError(
      "insightface_url_invalid",
      "FACE_RECOGNITION_API_URL não é uma URL válida.",
    );
  }
  if (!new Set(["http:", "https:"]).has(url.protocol)) {
    throw new FaceRecognitionError(
      "insightface_url_invalid",
      "FACE_RECOGNITION_API_URL precisa usar HTTP ou HTTPS.",
    );
  }

  return { apiUrl: url.toString().replace(/\/$/, ""), apiKey };
}

function numberArray(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const numbers = value.map(Number);
  return numbers.every(Number.isFinite) ? numbers : null;
}

function boundingBox(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const box = value as Record<string, unknown>;
  const normalized = {
    x: Number(box.x),
    y: Number(box.y),
    width: Number(box.width),
    height: Number(box.height),
  };
  return Object.values(normalized).every(
    (number) => Number.isFinite(number) && number >= 0 && number <= 1,
  )
    ? normalized
    : null;
}

async function errorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { detail?: unknown; error?: unknown };
    return String(payload.detail ?? payload.error ?? `HTTP ${response.status}`);
  } catch {
    return `HTTP ${response.status}`;
  }
}

export class InsightFaceRecognitionProvider implements FaceRecognitionProvider {
  readonly name = "insightface" as const;
  private readonly config = getInsightFaceConfig();

  private async request<T>(
    path: string,
    init?: RequestInit,
    timeoutMs = 55_000,
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.config.apiUrl}${path}`, {
        ...init,
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          "Content-Type": "application/json",
          "x-face-api-key": this.config.apiKey,
          ...init?.headers,
        },
      });
    } catch (error) {
      throw new FaceRecognitionError(
        "insightface_unavailable",
        error instanceof Error ? error.message : "Falha de conexão com InsightFace.",
        "O serviço InsightFace não respondeu. Tente novamente em instantes.",
      );
    }

    if (!response.ok) {
      const message = await errorMessage(response);
      throw new FaceRecognitionError(
        "insightface_request_failed",
        `InsightFace ${path}: ${message}`,
        message,
      );
    }
    return response.json() as Promise<T>;
  }

  async health(): Promise<FaceRecognitionHealth> {
    const response = await this.request<{
      ok?: boolean;
      provider?: string;
      model?: string;
      modelLoaded?: boolean;
    }>("/health", { method: "GET" }, 8_000);
    return {
      ok: response.ok === true,
      provider: "insightface",
      model: response.model,
      modelLoaded: response.modelLoaded,
    };
  }

  async createOrEnsureCollection() {
    const health = await this.health();
    if (!health.ok) {
      throw new FaceRecognitionError(
        "insightface_unhealthy",
        "O microserviço InsightFace não está saudável.",
      );
    }
    return health.model ?? "insightface";
  }

  async indexPlayerFace(input: IndexPlayerFaceInput): Promise<IndexedPlayerFace> {
    if (!input.imageUrl) {
      throw new FaceRecognitionError(
        "insightface_image_url_missing",
        "URL assinada da referência facial ausente.",
      );
    }
    const response = await this.request<EmbedResponse>("/embed-face", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: input.imageUrl,
        externalId: input.externalImageId,
      }),
    });
    const embedding = numberArray(response.embedding);
    const box = boundingBox(response.boundingBox);
    if (!embedding || !box || response.facesDetected !== 1 || !response.model) {
      throw new FaceRecognitionError(
        "insightface_invalid_embed_response",
        "Resposta inválida do endpoint /embed-face.",
        "O serviço InsightFace retornou um embedding inválido.",
      );
    }

    return {
      provider: this.name,
      providerFaceId: `insightface-${input.referenceId}`,
      providerCollectionId: response.model,
      confidence: 1,
      embedding,
      embeddingModel: response.model,
      raw: { model: response.model, boundingBox: box },
    };
  }

  async searchFacesInPhoto(input: SearchPhotoInput) {
    if (!input.imageUrl) {
      throw new FaceRecognitionError(
        "insightface_image_url_missing",
        "URL da foto ausente.",
      );
    }
    const response = await this.request<ProcessResponse>("/process-photo", {
      method: "POST",
      body: JSON.stringify({
        photoId: input.photoId,
        imageUrl: input.imageUrl,
        knownFaces: input.references.map((reference) => ({
          playerId: reference.playerId,
          playerSlug: reference.playerSlug,
          embedding: reference.embedding,
        })),
      }),
    });
    if (!Array.isArray(response.suggestions) || !Number.isInteger(response.facesDetected)) {
      throw new FaceRecognitionError(
        "insightface_invalid_process_response",
        "Resposta inválida do endpoint /process-photo.",
      );
    }

    const matches = response.suggestions.flatMap((value, index): FaceRecognitionMatch[] => {
      if (!value || typeof value !== "object") return [];
      const suggestion = value as Record<string, unknown>;
      const box = boundingBox(suggestion.boundingBox);
      const faceEmbedding = numberArray(suggestion.faceEmbedding);
      const confidence = Number(suggestion.confidence);
      const distance = Number(suggestion.distance);
      const playerId = typeof suggestion.playerId === "string" ? suggestion.playerId : null;
      const matched = suggestion.matched === true;
      if (
        !box ||
        !faceEmbedding ||
        !Number.isFinite(confidence) ||
        confidence > 1
      ) {
        return [];
      }
      const acceptedPlayerId = matched && playerId && confidence >= input.minConfidence
        ? playerId
        : undefined;
      return [{
        provider: this.name,
        providerFaceId: `insightface-${input.photoId}-${index}`,
        playerExternalId: acceptedPlayerId,
        confidence,
        boundingBox: box,
        faceEmbedding,
        matched: Boolean(acceptedPlayerId),
        raw: {
          model: response.model ?? null,
          distance: Number.isFinite(distance) ? distance : null,
          faceEmbedding,
          matched: Boolean(acceptedPlayerId),
          playerSlug:
            acceptedPlayerId && typeof suggestion.playerSlug === "string"
              ? suggestion.playerSlug
              : null,
        },
      }];
    });

    return {
      facesDetected: response.facesDetected ?? 0,
      matches,
      model: response.model,
    };
  }

  async deleteIndexedFace() {
    // InsightFace embeddings are stored in Supabase and removed there.
  }
}

export async function getInsightFaceHealth() {
  return new InsightFaceRecognitionProvider().health();
}
