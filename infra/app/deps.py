"""Reusable FastAPI dependencies."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.tokens import decode_access_token
from app.config import (
    DEFAULT_ORDER,
    DEFAULT_PAGE_SIZE,
    DEFAULT_SORT,
    MAX_PAGE_SIZE,
    SORT_FIELDS,
)
from app.db import get_session
from app.errors import UNAUTHORIZED
from app.models import User
from app.services.items import ItemFilters

SessionDep = Annotated[Session, Depends(get_session)]

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    session: SessionDep,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(UNAUTHORIZED, detail="Authentication required.")
    payload = decode_access_token(credentials.credentials)
    try:
        user_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(UNAUTHORIZED, detail="Invalid token subject.") from exc
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(UNAUTHORIZED, detail="User no longer exists.")
    token_version = int(payload.get("ver") or 0)
    if token_version != int(user.token_version or 0):
        raise HTTPException(UNAUTHORIZED, detail="Token has been revoked.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


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
