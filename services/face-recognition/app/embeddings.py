from dataclasses import dataclass

import numpy as np

from .schemas import KnownFace


def _normalized_vector(values: list[float] | np.ndarray) -> np.ndarray:
    vector = np.asarray(values, dtype=np.float32)
    if vector.ndim != 1 or vector.size == 0 or not np.all(np.isfinite(vector)):
        raise ValueError("Embedding must be a finite one-dimensional vector.")
    norm = float(np.linalg.norm(vector))
    if norm == 0:
        raise ValueError("Embedding cannot be a zero vector.")
    return vector / norm


def cosine_similarity(first: list[float] | np.ndarray, second: list[float] | np.ndarray) -> float:
    first_vector = _normalized_vector(first)
    second_vector = _normalized_vector(second)
    if first_vector.shape != second_vector.shape:
        raise ValueError("Embeddings must have the same dimensions.")
    return float(np.clip(np.dot(first_vector, second_vector), -1, 1))


def euclidean_distance(first: list[float] | np.ndarray, second: list[float] | np.ndarray) -> float:
    first_vector = _normalized_vector(first)
    second_vector = _normalized_vector(second)
    if first_vector.shape != second_vector.shape:
        raise ValueError("Embeddings must have the same dimensions.")
    return float(np.linalg.norm(first_vector - second_vector))


@dataclass(frozen=True)
class BestMatch:
    known_face: KnownFace
    distance: float
    similarity: float
    accepted: bool


def find_best_match(
    face_embedding: list[float] | np.ndarray,
    known_faces: list[KnownFace],
    min_similarity: float,
) -> BestMatch | None:
    best: BestMatch | None = None

    for known_face in known_faces:
        try:
            distance = euclidean_distance(face_embedding, known_face.embedding)
            similarity = cosine_similarity(face_embedding, known_face.embedding)
        except ValueError:
            continue

        candidate = BestMatch(
            known_face=known_face,
            distance=distance,
            similarity=similarity,
            accepted=similarity >= min_similarity,
        )
        if best is None or candidate.similarity > best.similarity:
            best = candidate

    return best
