import numpy as np
from fastapi.testclient import TestClient

from app import api
from app.config import get_settings
from app.recognition import DetectedFace
from app.schemas import BoundingBox


class FakeRecognitionEngine:
    model_loaded = True

    def __init__(self, faces: list[DetectedFace]):
        self.faces = faces

    def detect_faces(self, _image: np.ndarray) -> list[DetectedFace]:
        return self.faces


def face(embedding: list[float]) -> DetectedFace:
    return DetectedFace(
        embedding=embedding,
        bounding_box=BoundingBox(x=0.2, y=0.1, width=0.3, height=0.4),
        detection_score=0.95,
    )


def client(monkeypatch, faces: list[DetectedFace]) -> TestClient:
    monkeypatch.setenv("FACE_API_KEY", "test-secret")
    get_settings.cache_clear()
    monkeypatch.setattr(api, "fetch_image_array", lambda _url: np.zeros((20, 20, 3)))
    monkeypatch.setattr(api, "get_recognition_engine", lambda: FakeRecognitionEngine(faces))
    return TestClient(api.app)


def test_health_does_not_require_api_key(monkeypatch):
    test_client = client(monkeypatch, [])
    response = test_client.get("/health")
    assert response.status_code == 200
    assert response.json()["provider"] == "insightface"


def test_protected_endpoint_requires_api_key(monkeypatch):
    test_client = client(monkeypatch, [])
    response = test_client.post(
        "/embed-face",
        json={"imageUrl": "https://example.com/player.jpg", "externalId": "player"},
    )
    assert response.status_code == 401


def test_embed_face_returns_embedding(monkeypatch):
    test_client = client(monkeypatch, [face([1, 0, 0])])
    response = test_client.post(
        "/embed-face",
        headers={"x-face-api-key": "test-secret"},
        json={"imageUrl": "https://example.com/player.jpg", "externalId": "player"},
    )
    assert response.status_code == 200
    assert response.json()["facesDetected"] == 1
    assert response.json()["embedding"] == [1.0, 0.0, 0.0]


def test_process_photo_returns_only_accepted_matches(monkeypatch):
    test_client = client(monkeypatch, [face([1, 0, 0]), face([0, 1, 0])])
    response = test_client.post(
        "/process-photo",
        headers={"x-face-api-key": "test-secret"},
        json={
            "photoId": "photo-1",
            "imageUrl": "https://example.com/photo.jpg",
            "knownFaces": [
                {
                    "playerId": "player-1",
                    "playerSlug": "dudu",
                    "embedding": [1, 0, 0],
                }
            ],
        },
    )
    assert response.status_code == 200
    assert response.json()["facesDetected"] == 2
    assert len(response.json()["suggestions"]) == 1
    assert response.json()["suggestions"][0]["playerSlug"] == "dudu"


def test_similarity_threshold_accepts_realistic_pose_variation(monkeypatch):
    test_client = client(monkeypatch, [face([0.66, 0.75, 0])])
    response = test_client.post(
        "/process-photo",
        headers={"x-face-api-key": "test-secret"},
        json={
            "photoId": "photo-2",
            "imageUrl": "https://example.com/photo.jpg",
            "knownFaces": [
                {
                    "playerId": "player-1",
                    "playerSlug": "dudu",
                    "embedding": [1, 0, 0],
                }
            ],
        },
    )
    assert response.status_code == 200
    assert len(response.json()["suggestions"]) == 1
    assert response.json()["suggestions"][0]["confidence"] > 0.8


def test_compare_uses_cosine_similarity_threshold(monkeypatch):
    test_client = client(monkeypatch, [])
    response = test_client.post(
        "/compare",
        headers={"x-face-api-key": "test-secret"},
        json={
            "firstEmbedding": [1, 0, 0],
            "secondEmbedding": [0.66, 0.75, 0],
        },
    )
    assert response.status_code == 200
    assert response.json()["match"] is True
