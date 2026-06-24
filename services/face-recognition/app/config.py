from dataclasses import dataclass
from functools import lru_cache
import os

from dotenv import load_dotenv


load_dotenv()


def _float_env(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except ValueError as error:
        raise RuntimeError(f"{name} must be numeric") from error


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError as error:
        raise RuntimeError(f"{name} must be an integer") from error


@dataclass(frozen=True)
class Settings:
    api_key: str
    model_name: str
    detection_size: int
    min_confidence: float
    match_threshold: float
    max_image_mb: int
    request_timeout_seconds: float
    allowed_image_hosts: frozenset[str]

    @property
    def max_image_bytes(self) -> int:
        return self.max_image_mb * 1024 * 1024


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    allowed_hosts = frozenset(
        host.strip().lower()
        for host in os.getenv("FACE_ALLOWED_IMAGE_HOSTS", "").split(",")
        if host.strip()
    )
    settings = Settings(
        api_key=os.getenv("FACE_API_KEY", "").strip(),
        model_name=os.getenv("FACE_MODEL_NAME", "buffalo_l").strip() or "buffalo_l",
        detection_size=_int_env("FACE_DETECTION_SIZE", 640),
        min_confidence=_float_env("FACE_MIN_CONFIDENCE", 0.45),
        match_threshold=_float_env("FACE_MATCH_THRESHOLD", 0.35),
        max_image_mb=_int_env("MAX_IMAGE_MB", 15),
        request_timeout_seconds=_float_env("IMAGE_REQUEST_TIMEOUT_SECONDS", 20),
        allowed_image_hosts=allowed_hosts,
    )

    if settings.detection_size < 128 or settings.detection_size > 2048:
        raise RuntimeError("FACE_DETECTION_SIZE must be between 128 and 2048")
    if not 0 <= settings.min_confidence <= 1:
        raise RuntimeError("FACE_MIN_CONFIDENCE must be between 0 and 1")
    if not -1 <= settings.match_threshold <= 1:
        raise RuntimeError("FACE_MATCH_THRESHOLD must be between -1 and 1")
    if settings.max_image_mb < 1 or settings.max_image_mb > 50:
        raise RuntimeError("MAX_IMAGE_MB must be between 1 and 50")

    return settings
