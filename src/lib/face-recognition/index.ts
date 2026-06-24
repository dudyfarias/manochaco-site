import {
  assertHumanReviewRequired,
  assertProviderAllowedInRuntime,
  FaceRecognitionError,
  getFaceRecognitionProviderName,
} from "./provider";
import type {
  FaceRecognitionProvider,
  FaceRecognitionProviderName,
} from "./types";

export async function getFaceRecognitionProvider(
  requestedProvider?: FaceRecognitionProviderName,
): Promise<FaceRecognitionProvider> {
  assertHumanReviewRequired();
  const provider = requestedProvider ?? getFaceRecognitionProviderName();
  assertProviderAllowedInRuntime(provider);

  if (provider === "mock") {
    const { MockFaceRecognitionProvider } = await import("./mock-provider");
    return new MockFaceRecognitionProvider();
  }

  if (provider === "faceapi") {
    const { FaceApiRecognitionProvider } = await import("./faceapi-provider");
    return new FaceApiRecognitionProvider();
  }

  if (provider === "aws") {
    const { AwsRekognitionProvider } = await import("./aws-rekognition");
    return new AwsRekognitionProvider();
  }

  if (provider === "insightface") {
    const { InsightFaceRecognitionProvider } = await import("./insightface-provider");
    return new InsightFaceRecognitionProvider();
  }

  throw new FaceRecognitionError(
    "provider_not_implemented",
    `Provider não implementado: ${provider}.`,
    "O provedor de reconhecimento facial não está disponível.",
  );
}

export * from "./provider";
export * from "./similarity";
export * from "./types";
