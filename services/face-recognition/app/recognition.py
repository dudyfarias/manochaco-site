from dataclasses import dataclass
from functools import lru_cache
from threading import Lock
from typing import Any

import numpy as np

from .config import get_settings
from .schemas import BoundingBox


@dataclass(frozen=True)
class DetectedFace:
    embedding: list[float]
    bounding_box: BoundingBox
    detection_score: float


class RecognitionEngine:
    def __init__(self) -> None:
        self._model: Any | None = None
        self._lock = Lock()

    @property
    def model_loaded(self) -> bool:
        return self._model is not None

    def _load_model(self) -> Any:
        if self._model is not None:
            return self._model

        with self._lock:
            if self._model is not None:
                return self._model
            try:
                from insightface.app import FaceAnalysis
            except ImportError as error:
                raise RuntimeError("InsightFace is not installed in this environment.") from error

            settings = get_settings()
            model = FaceAnalysis(
                name=settings.model_name,
                providers=["CPUExecutionProvider"],
            )
            model.prepare(
                ctx_id=-1,
                det_size=(settings.detection_size, settings.detection_size),
            )
            self._model = model
            return model

    def detect_faces(self, image: np.ndarray) -> list[DetectedFace]:
        settings = get_settings()
        model = self._load_model()
        height, width = image.shape[:2]
        faces = model.get(image)
        detected: list[DetectedFace] = []

        for face in faces:
            score = float(getattr(face, "det_score", 0))
            if score < settings.min_confidence:
                continue
            raw_embedding = getattr(face, "normed_embedding", None)
            if raw_embedding is None:
                raw_embedding = getattr(face, "embedding", None)
            if raw_embedding is None:
                continue

            embedding = np.asarray(raw_embedding, dtype=np.float32)
            norm = float(np.linalg.norm(embedding))
            if norm == 0 or not np.all(np.isfinite(embedding)):
                continue
            embedding = embedding / norm

            x1, y1, x2, y2 = [float(value) for value in face.bbox]
            x1 = min(max(x1, 0), width)
            y1 = min(max(y1, 0), height)
            x2 = min(max(x2, x1), width)
            y2 = min(max(y2, y1), height)

            detected.append(
                DetectedFace(
                    embedding=embedding.tolist(),
                    bounding_box=BoundingBox(
                        x=x1 / width,
                        y=y1 / height,
                        width=(x2 - x1) / width,
                        height=(y2 - y1) / height,
                    ),
                    detection_score=score,
                )
            )

        return detected


@lru_cache(maxsize=1)
def get_recognition_engine() -> RecognitionEngine:
    return RecognitionEngine()
