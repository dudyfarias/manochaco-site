import type { FaceRecognitionProviderName } from "./types";

export class FaceRecognitionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly publicMessage = message,
  ) {
    super(message);
    this.name = "FaceRecognitionError";
  }
}

export function getFaceRecognitionProviderName(): FaceRecognitionProviderName {
  const provider = process.env.FACE_RECOGNITION_PROVIDER?.trim().toLowerCase();

  if (!provider) {
    return "mock";
  }

  if (["aws", "mock", "faceapi", "insightface"].includes(provider)) {
    return provider as FaceRecognitionProviderName;
  }

  throw new FaceRecognitionError(
    "unsupported_provider",
    `Provedor de reconhecimento facial não suportado: ${provider}`,
    "O provedor de reconhecimento facial não está configurado corretamente.",
  );
}

export function getMinimumConfidence() {
  const raw = Number(process.env.FACE_RECOGNITION_MIN_CONFIDENCE ?? "0.75");

  if (!Number.isFinite(raw) || raw < 0 || raw > 100) {
    throw new FaceRecognitionError(
      "invalid_min_confidence",
      "FACE_RECOGNITION_MIN_CONFIDENCE deve estar entre 0 e 1, ou usar percentual entre 1 e 100.",
    );
  }

  return raw > 1 ? raw / 100 : raw;
}

export function getMaximumDistance() {
  const raw = Number(process.env.FACE_RECOGNITION_MAX_DISTANCE ?? "0.6");

  if (!Number.isFinite(raw) || raw <= 0 || raw > 2) {
    throw new FaceRecognitionError(
      "invalid_max_distance",
      "FACE_RECOGNITION_MAX_DISTANCE deve estar acima de 0 e até 2.",
    );
  }

  return raw;
}

export function assertHumanReviewRequired() {
  if (process.env.FACE_RECOGNITION_AUTO_APPROVE?.toLowerCase() === "true") {
    throw new FaceRecognitionError(
      "auto_approve_forbidden",
      "FACE_RECOGNITION_AUTO_APPROVE deve permanecer false.",
      "A aprovação automática está bloqueada. Todas as sugestões exigem revisão humana.",
    );
  }
}

export function toPublicFaceRecognitionError(error: unknown) {
  if (error instanceof FaceRecognitionError) {
    return error.publicMessage;
  }

  return "Não foi possível concluir o reconhecimento facial. Verifique a configuração e tente novamente.";
}
