from hmac import compare_digest

from fastapi import Header, HTTPException, status

from .config import get_settings


async def require_api_key(
    x_face_api_key: str | None = Header(default=None, alias="x-face-api-key"),
) -> None:
    expected_key = get_settings().api_key

    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="FACE_API_KEY is not configured on the recognition service.",
        )

    if not x_face_api_key or not compare_digest(x_face_api_key, expected_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid face recognition API key.",
        )
