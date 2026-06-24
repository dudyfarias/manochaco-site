from pydantic import BaseModel, ConfigDict, Field, field_validator


class ApiModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class BoundingBox(ApiModel):
    x: float = Field(ge=0, le=1)
    y: float = Field(ge=0, le=1)
    width: float = Field(ge=0, le=1)
    height: float = Field(ge=0, le=1)


class EmbedFaceRequest(ApiModel):
    image_url: str = Field(alias="imageUrl", min_length=1, max_length=4096)
    external_id: str = Field(alias="externalId", min_length=1, max_length=200)


class EmbedFaceResponse(ApiModel):
    success: bool = True
    faces_detected: int = Field(alias="facesDetected", ge=0)
    embedding: list[float]
    bounding_box: BoundingBox = Field(alias="boundingBox")
    model: str


class KnownFace(ApiModel):
    player_id: str = Field(alias="playerId", min_length=1, max_length=200)
    player_slug: str = Field(alias="playerSlug", min_length=1, max_length=200)
    embedding: list[float] = Field(min_length=1)

    @field_validator("embedding")
    @classmethod
    def embedding_must_be_finite(cls, values: list[float]) -> list[float]:
        if any(value != value or value in (float("inf"), float("-inf")) for value in values):
            raise ValueError("embedding contains non-finite values")
        return values


class ProcessPhotoRequest(ApiModel):
    photo_id: str = Field(alias="photoId", min_length=1, max_length=200)
    image_url: str = Field(alias="imageUrl", min_length=1, max_length=4096)
    known_faces: list[KnownFace] = Field(alias="knownFaces", max_length=1000)


class FaceSuggestion(ApiModel):
    player_id: str | None = Field(default=None, alias="playerId")
    player_slug: str | None = Field(default=None, alias="playerSlug")
    confidence: float = Field(ge=0, le=1)
    distance: float | None = Field(default=None, ge=0)
    bounding_box: BoundingBox = Field(alias="boundingBox")
    face_embedding: list[float] = Field(alias="faceEmbedding", min_length=1)
    matched: bool


class ProcessPhotoResponse(ApiModel):
    success: bool = True
    faces_detected: int = Field(alias="facesDetected", ge=0)
    suggestions: list[FaceSuggestion]
    model: str


class CompareRequest(ApiModel):
    first_embedding: list[float] = Field(alias="firstEmbedding", min_length=1)
    second_embedding: list[float] = Field(alias="secondEmbedding", min_length=1)


class CompareResponse(ApiModel):
    success: bool = True
    cosine_similarity: float = Field(alias="cosineSimilarity")
    euclidean_distance: float = Field(alias="euclideanDistance")
    match: bool
    threshold: float


class HealthResponse(ApiModel):
    ok: bool
    provider: str
    model: str
    model_loaded: bool = Field(alias="modelLoaded")
