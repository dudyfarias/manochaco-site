from fastapi import Depends, FastAPI, HTTPException, status

from .config import get_settings
from .embeddings import cosine_similarity, euclidean_distance, find_best_match
from .recognition import get_recognition_engine
from .schemas import (
    CompareRequest,
    CompareResponse,
    EmbedFaceRequest,
    EmbedFaceResponse,
    FaceSuggestion,
    HealthResponse,
    ProcessPhotoRequest,
    ProcessPhotoResponse,
)
from .security import require_api_key
from .utils import ImageLoadError, fetch_image_array


app = FastAPI(
    title="Manochaco InsightFace Service",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
)


def _load_faces(image_url: str):
    try:
        image = fetch_image_array(image_url)
        return get_recognition_engine().detect_faces(image)
    except ImageLoadError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error)) from error


@app.get("/health", response_model=HealthResponse, response_model_by_alias=True)
def health() -> HealthResponse:
    settings = get_settings()
    engine = get_recognition_engine()
    return HealthResponse(
        ok=True,
        provider="insightface",
        model=settings.model_name,
        model_loaded=engine.model_loaded,
    )


@app.post(
    "/embed-face",
    response_model=EmbedFaceResponse,
    response_model_by_alias=True,
    dependencies=[Depends(require_api_key)],
)
def embed_face(payload: EmbedFaceRequest) -> EmbedFaceResponse:
    faces = _load_faces(payload.image_url)
    if not faces:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="No face was detected in the reference image.",
        )
    if len(faces) > 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="More than one face was detected. Use a reference photo containing only the player.",
        )

    face = faces[0]
    return EmbedFaceResponse(
        faces_detected=1,
        embedding=face.embedding,
        bounding_box=face.bounding_box,
        model=get_settings().model_name,
    )


@app.post(
    "/process-photo",
    response_model=ProcessPhotoResponse,
    response_model_by_alias=True,
    dependencies=[Depends(require_api_key)],
)
def process_photo(payload: ProcessPhotoRequest) -> ProcessPhotoResponse:
    settings = get_settings()
    faces = _load_faces(payload.image_url)
    suggestions: list[FaceSuggestion] = []

    for face in faces:
        match = find_best_match(
            face.embedding,
            payload.known_faces,
            settings.match_threshold,
        )
        accepted = bool(match and match.accepted)
        similarity = match.similarity if match else -1
        suggestions.append(
            FaceSuggestion(
                player_id=match.known_face.player_id if accepted and match else None,
                player_slug=match.known_face.player_slug if accepted and match else None,
                # This is a normalized ranking score, not a biometric probability.
                confidence=max(0, min(1, (similarity + 1) / 2)),
                distance=match.distance if match else None,
                bounding_box=face.bounding_box,
                face_embedding=face.embedding,
                matched=accepted,
            )
        )

    return ProcessPhotoResponse(
        faces_detected=len(faces),
        suggestions=suggestions,
        model=settings.model_name,
    )


@app.post(
    "/compare",
    response_model=CompareResponse,
    response_model_by_alias=True,
    dependencies=[Depends(require_api_key)],
)
def compare(payload: CompareRequest) -> CompareResponse:
    try:
        similarity = cosine_similarity(payload.first_embedding, payload.second_embedding)
        distance = euclidean_distance(payload.first_embedding, payload.second_embedding)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(error)) from error
    threshold = get_settings().match_threshold
    return CompareResponse(
        cosine_similarity=similarity,
        euclidean_distance=distance,
        match=similarity >= threshold,
        threshold=threshold,
    )
