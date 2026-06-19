import { AwsRekognitionProvider } from "./aws-rekognition";
import { MockFaceRecognitionProvider } from "./mock-provider";
import {
  assertHumanReviewRequired,
  getFaceRecognitionProviderName,
} from "./provider";
import type { FaceRecognitionProvider } from "./types";

export function getFaceRecognitionProvider(): FaceRecognitionProvider {
  assertHumanReviewRequired();

  return getFaceRecognitionProviderName() === "mock"
    ? new MockFaceRecognitionProvider()
    : new AwsRekognitionProvider();
}

export * from "./provider";
export * from "./types";
