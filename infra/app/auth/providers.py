"""Verify Google and Apple ID tokens via JWKS."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx
import jwt
from fastapi import HTTPException
from jwt import PyJWKClient

from app.config import (
    APPLE_ISSUER,
    APPLE_JWKS_URL,
    GOOGLE_ISSUERS,
    GOOGLE_JWKS_URL,
    settings,
)
from app.errors import UNAUTHORIZED

_google_jwks = PyJWKClient(GOOGLE_JWKS_URL, cache_keys=True)
_apple_jwks = PyJWKClient(APPLE_JWKS_URL, cache_keys=True)


@dataclass(frozen=True, slots=True)
class Identity:
    provider: str
    subject: str
    email: str | None = None
    display_name: str | None = None
    avatar_url: str | None = None


def _require_audience(audiences: list[str], label: str) -> list[str]:
    if not audiences:
        raise HTTPException(
            UNAUTHORIZED,
            detail=f"{label} sign-in is not configured on this server.",
        )
    return audiences


def _decode_with_jwks(
    id_token: str,
    *,
    jwks: PyJWKClient,
    audience: list[str] | str,
    issuer: str | list[str],
) -> dict[str, Any]:
    try:
        signing_key = jwks.get_signing_key_from_jwt(id_token)
        return jwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256"],
            audience=audience,
            issuer=issuer,
            options={"require": ["exp", "iat", "sub"]},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(UNAUTHORIZED, detail="Invalid identity token.") from exc
    except httpx.HTTPError as exc:  # pragma: no cover - network to IdP
        raise HTTPException(UNAUTHORIZED, detail="Could not reach identity provider.") from exc


def verify_google_id_token(id_token: str) -> Identity:
    audiences = _require_audience(settings.google_client_id_list, "Google")
    claims = _decode_with_jwks(
        id_token,
        jwks=_google_jwks,
        audience=audiences,
        issuer=list(GOOGLE_ISSUERS),
    )
    return Identity(
        provider="google",
        subject=str(claims["sub"]),
        email=claims.get("email"),
        display_name=claims.get("name"),
        avatar_url=claims.get("picture"),
    )


def verify_apple_id_token(
    id_token: str, *, full_name: str | None = None
) -> Identity:
    audience = _require_audience(
        [settings.apple_client_id] if settings.apple_client_id.strip() else [],
        "Apple",
    )
    claims = _decode_with_jwks(
        id_token,
        jwks=_apple_jwks,
        audience=audience[0],
        issuer=APPLE_ISSUER,
    )
    email = claims.get("email")
    return Identity(
        provider="apple",
        subject=str(claims["sub"]),
        email=email if isinstance(email, str) else None,
        display_name=full_name,
        avatar_url=None,
    )
