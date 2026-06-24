import ipaddress
import socket
from io import BytesIO
from urllib.parse import urlparse

import cv2
import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError
import requests

from .config import get_settings


SUPPORTED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


class ImageLoadError(ValueError):
    pass


def _assert_safe_host(hostname: str) -> None:
    settings = get_settings()
    normalized_host = hostname.lower().rstrip(".")
    if normalized_host in settings.allowed_image_hosts:
        return

    try:
        addresses = {
            address[4][0]
            for address in socket.getaddrinfo(normalized_host, None, proto=socket.IPPROTO_TCP)
        }
    except socket.gaierror as error:
        raise ImageLoadError("Image host could not be resolved.") from error

    for address in addresses:
        ip = ipaddress.ip_address(address)
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        ):
            raise ImageLoadError("Private or local image hosts are not allowed.")


def download_image(image_url: str) -> bytes:
    settings = get_settings()
    parsed = urlparse(image_url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ImageLoadError("imageUrl must use HTTP or HTTPS.")
    if parsed.username or parsed.password:
        raise ImageLoadError("Credentials are not allowed inside imageUrl.")

    _assert_safe_host(parsed.hostname)

    try:
        with requests.get(
            image_url,
            stream=True,
            timeout=settings.request_timeout_seconds,
            allow_redirects=False,
            headers={"User-Agent": "Manochaco-InsightFace/1.0"},
        ) as response:
            if 300 <= response.status_code < 400:
                raise ImageLoadError("Image URL redirects are not allowed.")
            response.raise_for_status()
            content_type = response.headers.get("content-type", "").split(";")[0].lower()
            if content_type not in SUPPORTED_CONTENT_TYPES:
                raise ImageLoadError("URL did not return a supported image type.")

            declared_size = int(response.headers.get("content-length", "0") or 0)
            if declared_size > settings.max_image_bytes:
                raise ImageLoadError("Image exceeds the configured size limit.")

            chunks: list[bytes] = []
            downloaded = 0
            for chunk in response.iter_content(chunk_size=64 * 1024):
                if not chunk:
                    continue
                downloaded += len(chunk)
                if downloaded > settings.max_image_bytes:
                    raise ImageLoadError("Image exceeds the configured size limit.")
                chunks.append(chunk)
    except requests.RequestException as error:
        raise ImageLoadError("Image could not be downloaded.") from error

    if not chunks:
        raise ImageLoadError("Image is empty.")
    return b"".join(chunks)


def decode_image(image_bytes: bytes) -> np.ndarray:
    try:
        with Image.open(BytesIO(image_bytes)) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            rgb = np.asarray(image)
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as error:
        raise ImageLoadError("Image payload is invalid or unsafe.") from error

    if rgb.size == 0:
        raise ImageLoadError("Decoded image is empty.")
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def fetch_image_array(image_url: str) -> np.ndarray:
    return decode_image(download_image(image_url))
