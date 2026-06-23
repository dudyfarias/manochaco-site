import type { FaceRecognitionStatus } from "@/types";

export const faceRecognitionStatuses: FaceRecognitionStatus[] = [
  "not_processed",
  "queued",
  "processing",
  "needs_review",
  "processed",
  "approved",
  "error",
];

export const processablePhotoStatuses: FaceRecognitionStatus[] = [
  "not_processed",
  "queued",
  "error",
];

export function isFaceRecognitionStatus(
  value: string | null | undefined,
): value is FaceRecognitionStatus {
  return faceRecognitionStatuses.includes(value as FaceRecognitionStatus);
}

export function isPhotoProcessable(
  status: string | null | undefined,
  url: string | null | undefined,
) {
  return Boolean(
    url?.trim() &&
      isFaceRecognitionStatus(status) &&
      processablePhotoStatuses.includes(status),
  );
}

export function getPhotoQueueReason({
  status,
  url,
  pendingSuggestions = 0,
}: {
  status: string | null | undefined;
  url: string | null | undefined;
  pendingSuggestions?: number;
}) {
  if (!url?.trim()) return "Sem URL";
  if (!isFaceRecognitionStatus(status)) return "Status inválido";
  if (processablePhotoStatuses.includes(status)) return "Elegível para processamento";
  if (status === "processing") return "Em processamento";
  if (status === "needs_review") {
    return pendingSuggestions > 0
      ? "Aguardando revisão humana"
      : "Revisão sem sugestão pendente";
  }
  if (status === "processed") return "Já processada";
  return "Aprovada";
}
