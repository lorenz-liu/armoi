"""Pluggable media backends: local disk or S3-compatible (Tigris)."""

from __future__ import annotations

import io
from abc import ABC, abstractmethod
from functools import lru_cache
from pathlib import Path
from typing import BinaryIO

from app.config import settings


class MediaStorage(ABC):
    @abstractmethod
    def put(self, key: str, data: bytes, content_type: str) -> None: ...

    @abstractmethod
    def delete(self, key: str) -> None: ...

    @abstractmethod
    def url(self, key: str) -> str: ...


class LocalMediaStorage(MediaStorage):
    def __init__(self, root: Path, url_path: str) -> None:
        self.root = root
        self.url_path = url_path.rstrip("/")
        self.root.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        return self.root / key

    def put(self, key: str, data: bytes, content_type: str) -> None:
        destination = self._path(key)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)

    def delete(self, key: str) -> None:
        self._path(key).unlink(missing_ok=True)

    def url(self, key: str) -> str:
        return f"{self.url_path}/{key}"


class S3MediaStorage(MediaStorage):
    def __init__(self) -> None:
        import boto3
        from botocore.client import Config

        if not settings.s3_bucket or not settings.s3_access_key_id:
            raise RuntimeError(
                "ARMOI_MEDIA_BACKEND=s3 requires ARMOI_S3_BUCKET and credentials."
            )
        self.bucket = settings.s3_bucket
        self.presign_ttl = settings.s3_presign_ttl_seconds
        self.public_base = settings.s3_public_base_url.rstrip("/")
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url or None,
            region_name=settings.s3_region or "auto",
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
            config=Config(signature_version="s3v4"),
        )

    def put(self, key: str, data: bytes, content_type: str) -> None:
        body: BinaryIO = io.BytesIO(data)
        self.client.upload_fileobj(
            body,
            self.bucket,
            key,
            ExtraArgs={"ContentType": content_type},
        )

    def delete(self, key: str) -> None:
        self.client.delete_object(Bucket=self.bucket, Key=key)

    def url(self, key: str) -> str:
        if self.public_base:
            return f"{self.public_base}/{key}"
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=self.presign_ttl,
        )


@lru_cache(maxsize=1)
def get_storage() -> MediaStorage:
    if settings.is_s3_media:
        return S3MediaStorage()
    return LocalMediaStorage(settings.resolved_media_dir, settings.media_url_path)


def reset_storage_cache() -> None:
    """Clear the cached backend (tests flip settings between cases)."""
    get_storage.cache_clear()
