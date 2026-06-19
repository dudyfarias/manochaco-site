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

  if (!provider || provider === "aws") {
    return "aws";
  }

  if (provider === "mock") {
    return "mock";
  }

  throw new FaceRecognitionError(
    "unsupported_provider",
    `Provedor de reconhecimento facial não suportado: ${provider}`,
    "O provedor de reconhecimento facial não está configurado corretamente.",
  );
}

export function getMinimumConfidence() {
  const raw = Number(process.env.FACE_RECOGNITION_MIN_CONFIDENCE ?? "80");

  if (!Number.isFinite(raw) || raw < 0 || raw > 100) {
    throw new FaceRecognitionError(
      "invalid_min_confidence",
      "FACE_RECOGNITION_MIN_CONFIDENCE deve estar entre 0 e 100.",
    );
  }

  return raw / 100;
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
