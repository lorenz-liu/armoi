"""User upsert and token-version helpers."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.providers import Identity
from app.models import User


def upsert_user(session: Session, identity: Identity) -> User:
    user = session.scalar(
        select(User).where(
            User.provider == identity.provider,
            User.provider_sub == identity.subject,
        )
    )
    if user is None:
        user = User(
            provider=identity.provider,
            provider_sub=identity.subject,
            email=identity.email,
            display_name=identity.display_name,
            avatar_url=identity.avatar_url,
        )
        session.add(user)
    else:
        if identity.email:
            user.email = identity.email
        if identity.display_name:
            user.display_name = identity.display_name
        if identity.avatar_url:
            user.avatar_url = identity.avatar_url
    session.flush()
    session.refresh(user)
    return user


def bump_token_version(session: Session, user: User) -> User:
    user.token_version = int(user.token_version or 0) + 1
    session.flush()
    session.refresh(user)
    return user
