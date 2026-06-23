import {
  assertHumanReviewRequired,
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

  throw new FaceRecognitionError(
    "provider_not_implemented",
    "O provider InsightFace ainda não foi implementado.",
    "O InsightFace está reservado para uma integração futura. Use faceapi ou mock.",
  );
}

export * from "./provider";
export * from "./similarity";
export * from "./types";
