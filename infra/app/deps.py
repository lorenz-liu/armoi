"""Reusable FastAPI dependencies."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.config import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from app.db import get_session
from app.services.items import DEFAULT_ORDER, DEFAULT_SORT, SORT_FIELDS, ItemFilters

SessionDep = Annotated[Session, Depends(get_session)]


def item_filters(
    search: Annotated[str | None, Query(description="Matches any textual field")] = None,
    brand_id: Annotated[list[int] | None, Query()] = None,
    storage_id: Annotated[list[int] | None, Query()] = None,
    category_id: Annotated[list[str] | None, Query(description="Includes the subtree")] = None,
    gender: Annotated[list[str] | None, Query()] = None,
    season: Annotated[list[str] | None, Query()] = None,
    currency: Annotated[str | None, Query()] = None,
    min_price: Annotated[float | None, Query(ge=0)] = None,
    max_price: Annotated[float | None, Query(ge=0)] = None,
    sort: Annotated[str, Query(pattern="|".join(SORT_FIELDS))] = DEFAULT_SORT,
    order: Annotated[str, Query(pattern="^(asc|desc)$")] = DEFAULT_ORDER,
    limit: Annotated[int, Query(ge=1, le=MAX_PAGE_SIZE)] = DEFAULT_PAGE_SIZE,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> ItemFilters:
    return ItemFilters(
        search=search,
        brand_ids=brand_id or [],
        storage_ids=storage_id or [],
        category_ids=category_id or [],
        genders=gender or [],
        seasons=season or [],
        currency=currency,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        order=order,
        limit=limit,
        offset=offset,
    )


FiltersDep = Annotated[ItemFilters, Depends(item_filters)]
