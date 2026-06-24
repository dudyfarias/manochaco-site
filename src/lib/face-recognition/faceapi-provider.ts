import "server-only";

import { access } from "node:fs/promises";
import path from "node:path";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api/dist/face-api.node-wasm.js";
import sharp from "sharp";
import { FaceRecognitionError } from "./provider";
import { findBestMatch } from "./similarity";
import type {
  FaceRecognitionProvider,
  IndexedPlayerFace,
  IndexPlayerFaceInput,
  SearchPhotoInput,
} from "./types";

const MODEL_NAME = "faceapi-vladmandic-1.7.15-128d";
const COLLECTION_ID = "manochaco-local-embeddings";
const MODEL_DIRECTORY = path.join(process.cwd(), "public", "models", "face-api");
const REQUIRED_MODEL_FILES = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model.bin",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model.bin",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model.bin",
];

let modelsPromise: Promise<void> | null = null;

async function ensureModelFiles() {
  try {
    await Promise.all(
      REQUIRED_MODEL_FILES.map((file) => access(path.join(MODEL_DIRECTORY, file))),
    );
  } catch {
    throw new FaceRecognitionError(
      "faceapi_models_missing",
      `Modelos do face-api.js ausentes em ${MODEL_DIRECTORY}.`,
      "Os modelos gratuitos de reconhecimento facial não foram encontrados no servidor.",
    );
  }
}

async function loadModels() {
  if (!modelsPromise) {
    modelsPromise = (async () => {
      await ensureModelFiles();
      await tf.setBackend("cpu");
      await tf.ready();
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_DIRECTORY),
        faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_DIRECTORY),
        faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_DIRECTORY),
      ]);
    })().catch((error) => {
      modelsPromise = null;
      throw new FaceRecognitionError(
        "faceapi_model_load_failed",
        error instanceof Error ? error.message : "Falha ao carregar modelos do face-api.js.",
        "Não foi possível inicializar o reconhecimento facial gratuito.",
      );
    });
  }

  return modelsPromise;
}

async function imageTensor(imageBytes: Uint8Array) {
  try {
    const { data, info } = await sharp(imageBytes)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .removeAlpha()
      .toColourspace("srgb")
      .raw()
      .toBuffer({ resolveWithObject: true });

    return {
      tensor: tf.tensor3d(
        new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
        [info.height, info.width, info.channels],
        "int32",
      ),
      width: info.width,
      height: info.height,
    };
  } catch (error) {
    throw new FaceRecognitionError(
      "faceapi_image_decode_failed",
      error instanceof Error ? error.message : "Imagem inválida.",
      "A imagem não pôde ser preparada para reconhecimento facial.",
    );
  }
}

async function detectDescriptors(imageBytes: Uint8Array) {
  await loadModels();
  const prepared = await imageTensor(imageBytes);

  try {
    const detections = await faceapi
      .detectAllFaces(
        prepared.tensor as unknown as faceapi.TNetInput,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 608,
          scoreThreshold: 0.2,
        }),
      )
      .withFaceLandmarks()
      .withFaceDescriptors();

    return {
      width: prepared.width,
      height: prepared.height,
      detections,
    };
  } finally {
    prepared.tensor.dispose();
  }
}

function normalizedBoundingBox(
  box: { x: number; y: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number,
) {
  return {
    x: Math.min(1, Math.max(0, box.x / imageWidth)),
    y: Math.min(1, Math.max(0, box.y / imageHeight)),
    width: Math.min(1, Math.max(0, box.width / imageWidth)),
    height: Math.min(1, Math.max(0, box.height / imageHeight)),
  };
}

export class FaceApiRecognitionProvider implements FaceRecognitionProvider {
  readonly name = "faceapi" as const;

  async createOrEnsureCollection() {
    await loadModels();
    return COLLECTION_ID;
  }

  async indexPlayerFace(input: IndexPlayerFaceInput): Promise<IndexedPlayerFace> {
    if (!input.imageBytes) {
      throw new FaceRecognitionError("faceapi_image_missing", "Bytes da imagem ausentes.");
    }
    const result = await detectDescriptors(input.imageBytes);

    if (result.detections.length === 0) {
      throw new FaceRecognitionError(
        "faceapi_face_not_found",
        "Nenhum rosto foi detectado na referência.",
        "Nenhum rosto nítido foi encontrado na foto de referência.",
      );
    }

    if (result.detections.length > 1) {
      throw new FaceRecognitionError(
        "faceapi_multiple_faces",
        "Mais de um rosto foi detectado na referência.",
        "Use uma foto de referência com apenas o rosto do jogador.",
      );
    }

    const detection = result.detections[0];

    return {
      provider: this.name,
      providerFaceId: `faceapi-${input.referenceId}`,
      providerCollectionId: COLLECTION_ID,
      confidence: detection.detection.score,
      embedding: Array.from(detection.descriptor),
      embeddingModel: MODEL_NAME,
      raw: {
        model: MODEL_NAME,
        detectionScore: detection.detection.score,
      },
    };
  }

  async searchFacesInPhoto(input: SearchPhotoInput) {
    if (!input.imageBytes) {
      throw new FaceRecognitionError("faceapi_image_missing", "Bytes da imagem ausentes.");
    }
    const result = await detectDescriptors(input.imageBytes);

    const matches = result.detections.map((detection) => {
      const descriptor = Array.from(detection.descriptor);
      const match = findBestMatch(descriptor, input.references, input.maxDistance);
      const accepted = Boolean(match?.accepted);

      return {
        provider: this.name,
        providerFaceId: accepted ? match?.reference.providerFaceId : undefined,
        playerExternalId: accepted ? match?.reference.playerId : undefined,
        confidence: match?.confidence ?? 0,
        boundingBox: normalizedBoundingBox(
          detection.detection.box,
          result.width,
          result.height,
        ),
        raw: {
          model: MODEL_NAME,
          detectionScore: detection.detection.score,
          distance: match?.distance ?? null,
          threshold: input.maxDistance,
          matched: accepted,
        },
      };
    });

    return { facesDetected: result.detections.length, matches, model: MODEL_NAME };
  }

  async deleteIndexedFace() {
    // Embeddings locais são removidos do banco; não há índice externo a limpar.
  }
}
