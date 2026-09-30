"""Issue and validate Armoi JWTs (access + refresh)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, Literal

import jwt
from fastapi import HTTPException

from app.config import settings
from app.errors import UNAUTHORIZED

TokenKind = Literal["access", "refresh"]


@dataclass(frozen=True, slots=True)
class TokenPair:
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 0


def _encode(claims: dict[str, Any], ttl_seconds: int) -> str:
    now = datetime.now(UTC)
    payload = {
        **claims,
        "iat": now,
        "exp": now + timedelta(seconds=ttl_seconds),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def create_token_pair(*, user_id: int, token_version: int) -> TokenPair:
    access = _encode(
        {"sub": str(user_id), "typ": "access", "ver": token_version},
        settings.jwt_access_ttl_seconds,
    )
    refresh = _encode(
        {"sub": str(user_id), "typ": "refresh", "ver": token_version},
        settings.jwt_refresh_ttl_seconds,
    )
    return TokenPair(
        access_token=access,
        refresh_token=refresh,
        expires_in=settings.jwt_access_ttl_seconds,
    )


def _decode(token: str, *, expected: TokenKind) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(UNAUTHORIZED, detail="Invalid or expired token.") from exc
    if payload.get("typ") != expected:
        raise HTTPException(UNAUTHORIZED, detail=f"Expected a {expected} token.")
    if "sub" not in payload:
        raise HTTPException(UNAUTHORIZED, detail="Token is missing a subject.")
    return payload


def decode_access_token(token: str) -> dict[str, Any]:
    return _decode(token, expected="access")


def decode_refresh_token(token: str) -> dict[str, Any]:
    return _decode(token, expected="refresh")
