import type { FaceReferenceEmbedding } from "./types";

function assertComparable(a: number[], b: number[]) {
  if (a.length === 0 || a.length !== b.length) {
    throw new Error("Embeddings faciais incompatíveis.");
  }

  if (![...a, ...b].every(Number.isFinite)) {
    throw new Error("Embedding facial contém valores inválidos.");
  }
}

export function euclideanDistance(a: number[], b: number[]) {
  assertComparable(a, b);
  return Math.sqrt(a.reduce((sum, value, index) => {
    const difference = value - b[index];
    return sum + difference * difference;
  }, 0));
}

export function cosineSimilarity(a: number[], b: number[]) {
  assertComparable(a, b);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dotProduct += a[index] * b[index];
    magnitudeA += a[index] * a[index];
    magnitudeB += b[index] * b[index];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

export function findBestMatch(
  faceEmbedding: number[],
  playerEmbeddings: FaceReferenceEmbedding[],
  maxDistance: number,
) {
  const candidates = playerEmbeddings
    .filter((reference) => reference.embedding.length === faceEmbedding.length)
    .map((reference) => ({
      reference,
      distance: euclideanDistance(faceEmbedding, reference.embedding),
    }))
    .sort((a, b) => a.distance - b.distance);
  const best = candidates[0];

  if (!best) {
    return null;
  }

  return {
    ...best,
    accepted: best.distance <= maxDistance,
    confidence: Math.min(1, Math.max(0, 1 - best.distance)),
  };
}
