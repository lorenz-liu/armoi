"""/items — the library itself."""

from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, Response, UploadFile, status

from app.config import MAX_IMAGES_PER_ITEM
from app.deps import FiltersDep, SessionDep
from app.errors import NOT_FOUND, UNPROCESSABLE
from app.models import ItemImage
from app.schemas import (
    ImageRead,
    ImageReorder,
    ItemCreate,
    ItemRead,
    ItemSummary,
    ItemUpdate,
    Page,
    PairingWrite,
)
from app.services import images as image_service
from app.services import items as item_service

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=Page[ItemSummary], summary="List / search / filter the library")
def list_items(session: SessionDep, filters: FiltersDep) -> Page[ItemSummary]:
    rows, total = item_service.list_items(session, filters)
    return Page[ItemSummary](
        items=[item_service.serialize_summary(row) for row in rows],
        total=total,
        limit=filters.limit,
        offset=filters.offset,
    )


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(payload: ItemCreate, session: SessionDep) -> ItemRead:
    item = item_service.create_item(session, payload)
    return item_service.serialize_detail(session, item)


@router.get("/{item_id}", response_model=ItemRead)
def read_item(item_id: int, session: SessionDep) -> ItemRead:
    return item_service.serialize_detail(session, item_service.get_item(session, item_id))


@router.put("/{item_id}", response_model=ItemRead)
def update_item(item_id: int, payload: ItemUpdate, session: SessionDep) -> ItemRead:
    item = item_service.get_item(session, item_id)
    item_service.update_item(session, item, payload)
    return item_service.serialize_detail(session, item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, session: SessionDep) -> Response:
    item_service.delete_item(session, item_service.get_item(session, item_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- images -----------------------------------------------------------------
@router.post(
    "/{item_id}/images",
    response_model=list[ImageRead],
    status_code=status.HTTP_201_CREATED,
    summary=f"Attach up to {MAX_IMAGES_PER_ITEM} images in total",
)
def upload_images(
    item_id: int, session: SessionDep, files: list[UploadFile] = File(...)
) -> list[ImageRead]:
    item = item_service.get_item(session, item_id)
    created = image_service.add_images(session, item, files)
    return [item_service.serialize_image(image) for image in created]


@router.put("/{item_id}/images/order", response_model=list[ImageRead])
def reorder_images(item_id: int, payload: ImageReorder, session: SessionDep) -> list[ImageRead]:
    item = item_service.get_item(session, item_id)
    ordered = image_service.reorder(session, item, payload.image_ids)
    return [item_service.serialize_image(image) for image in ordered]


@router.delete("/{item_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(item_id: int, image_id: int, session: SessionDep) -> Response:
    item = item_service.get_item(session, item_id)
    image = session.get(ItemImage, image_id)
    if image is None or image.item_id != item.id:
        raise HTTPException(NOT_FOUND, detail="Image not found on this item.")
    image_service.delete_image(session, image)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- pairings ---------------------------------------------------------------
@router.get("/{item_id}/pairings", response_model=list[ItemSummary])
def list_pairings(item_id: int, session: SessionDep) -> list[ItemSummary]:
    item_service.get_item(session, item_id)
    return [
        item_service.serialize_summary(partner)
        for partner in item_service.paired_items(session, item_id)
    ]


@router.post(
    "/{item_id}/pairings", response_model=list[ItemSummary], status_code=status.HTTP_201_CREATED
)
def add_pairing(item_id: int, payload: PairingWrite, session: SessionDep) -> list[ItemSummary]:
    item = item_service.get_item(session, item_id)
    if payload.item_id == item_id:
        raise HTTPException(UNPROCESSABLE, detail="An item cannot pair with itself.")
    item_service.add_pairing(session, item, payload.item_id)
    return [
        item_service.serialize_summary(partner)
        for partner in item_service.paired_items(session, item_id)
    ]


@router.delete("/{item_id}/pairings/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_pairing(item_id: int, partner_id: int, session: SessionDep) -> Response:
    item = item_service.get_item(session, item_id)
    item_service.remove_pairing(session, item, partner_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
