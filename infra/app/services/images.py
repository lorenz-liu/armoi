"""Item image storage: validation, on-disk persistence, ordering."""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import (
    ALLOWED_IMAGE_CONTENT_TYPES,
    IMAGE_EXTENSION_BY_CONTENT_TYPE,
    MAX_IMAGE_BYTES,
    MAX_IMAGES_PER_ITEM,
    settings,
)
from app.errors import BAD_REQUEST, CONFLICT, CONTENT_TOO_LARGE, UNSUPPORTED_MEDIA_TYPE
from app.models import Item, ItemImage


def media_dir() -> Path:
    path = settings.resolved_media_dir
    path.mkdir(parents=True, exist_ok=True)
    return path


def image_url(filename: str) -> str:
    return f"{settings.media_url_path}/{filename}"


def _probe_dimensions(path: Path) -> tuple[int | None, int | None]:
    """Best-effort size read; unsupported formats (HEIC without a plugin) return None."""
    try:
        from PIL import Image  # imported lazily so the API boots without image work

        with Image.open(path) as img:
            return img.width, img.height
    except Exception:  # noqa: BLE001 - dimensions are cosmetic; any decode failure is fine
        return None, None


def add_images(session: Session, item: Item, uploads: list[UploadFile]) -> list[ItemImage]:
    if not uploads:
        return []

    remaining = MAX_IMAGES_PER_ITEM - len(item.images)
    if len(uploads) > remaining:
        raise HTTPException(
            CONFLICT,
            detail=(
                f"An item holds at most {MAX_IMAGES_PER_ITEM} images; "
                f"{remaining} slot(s) left."
            ),
        )

    next_position = max((img.position for img in item.images), default=-1) + 1
    created: list[ItemImage] = []
    written: list[Path] = []

    try:
        for upload in uploads:
            content_type = (upload.content_type or "").lower()
            if content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
                raise HTTPException(
                    UNSUPPORTED_MEDIA_TYPE,
                    detail=f"Unsupported image type: {content_type or 'unknown'}",
                )
            payload = upload.file.read()
            if len(payload) > MAX_IMAGE_BYTES:
                raise HTTPException(
                    CONTENT_TOO_LARGE,
                    detail=f"Image exceeds {MAX_IMAGE_BYTES // (1024 * 1024)}MB.",
                )
            if not payload:
                raise HTTPException(BAD_REQUEST, detail="Empty image upload.")

            filename = f"{uuid.uuid4().hex}{IMAGE_EXTENSION_BY_CONTENT_TYPE[content_type]}"
            destination = media_dir() / filename
            destination.write_bytes(payload)
            written.append(destination)

            width, height = _probe_dimensions(destination)
            image = ItemImage(
                item_id=item.id,
                filename=filename,
                position=next_position,
                width=width,
                height=height,
            )
            next_position += 1
            session.add(image)
            created.append(image)
    except Exception:
        # Never leave orphan bytes behind when a later file in the batch fails.
        for path in written:
            path.unlink(missing_ok=True)
        raise

    session.flush()
    session.refresh(item)
    return created


def delete_image(session: Session, image: ItemImage) -> None:
    (media_dir() / image.filename).unlink(missing_ok=True)
    session.delete(image)
    session.flush()


def delete_images_for_item(session: Session, item: Item) -> None:
    """Remove the files; the rows go with the item via ON DELETE CASCADE."""
    for image in list(item.images):
        (media_dir() / image.filename).unlink(missing_ok=True)


def reorder(session: Session, item: Item, image_ids: list[int]) -> list[ItemImage]:
    by_id = {image.id: image for image in item.images}
    if set(image_ids) != set(by_id):
        raise HTTPException(
            BAD_REQUEST,
            detail="Reorder must list exactly the item's current image ids.",
        )
    # Park positions out of range first: (item_id, position) is unique, so a
    # direct permutation would collide mid-update.
    for offset, image in enumerate(item.images):
        image.position = -(offset + 1)
    session.flush()
    for position, image_id in enumerate(image_ids):
        by_id[image_id].position = position
    session.flush()
    session.refresh(item)
    return item.images
