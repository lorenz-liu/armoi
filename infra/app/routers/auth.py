"""/auth — Google / Apple ID-token exchange and session refresh."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.auth.providers import verify_apple_id_token, verify_google_id_token
from app.auth.tokens import create_token_pair, decode_refresh_token
from app.auth.users import bump_token_version, upsert_user
from app.deps import CurrentUser, SessionDep
from app.errors import UNAUTHORIZED
from app.models import User
from app.schemas import (
    AppleAuthRequest,
    AuthTokens,
    GoogleAuthRequest,
    RefreshRequest,
    UserRead,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _tokens_for(user: User) -> AuthTokens:
    pair = create_token_pair(user_id=user.id, token_version=user.token_version)
    return AuthTokens(
        access_token=pair.access_token,
        refresh_token=pair.refresh_token,
        token_type=pair.token_type,
        expires_in=pair.expires_in,
        user=UserRead.model_validate(user),
    )


def _exchange(session: Session, identity) -> AuthTokens:
    user = upsert_user(session, identity)
    return _tokens_for(user)


@router.post("/google", response_model=AuthTokens)
def auth_google(payload: GoogleAuthRequest, session: SessionDep) -> AuthTokens:
    identity = verify_google_id_token(payload.id_token)
    return _exchange(session, identity)


@router.post("/apple", response_model=AuthTokens)
def auth_apple(payload: AppleAuthRequest, session: SessionDep) -> AuthTokens:
    identity = verify_apple_id_token(payload.id_token, full_name=payload.full_name)
    return _exchange(session, identity)


@router.post("/refresh", response_model=AuthTokens)
def auth_refresh(payload: RefreshRequest, session: SessionDep) -> AuthTokens:
    claims = decode_refresh_token(payload.refresh_token)
    try:
        user_id = int(claims["sub"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(UNAUTHORIZED, detail="Invalid refresh token.") from exc
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(UNAUTHORIZED, detail="User no longer exists.")
    if int(claims.get("ver") or 0) != int(user.token_version or 0):
        raise HTTPException(UNAUTHORIZED, detail="Refresh token has been revoked.")
    return _tokens_for(user)


@router.get("/me", response_model=UserRead)
def auth_me(user: CurrentUser) -> UserRead:
    return UserRead.model_validate(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def auth_logout(user: CurrentUser, session: SessionDep) -> Response:
    bump_token_version(session, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
