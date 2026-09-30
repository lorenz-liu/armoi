"""Auth router: JWT issue / refresh / logout / me."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.auth.providers import Identity
from app.auth.tokens import decode_access_token
from app.auth.users import upsert_user
from app.config import settings

API = settings.api_prefix


def test_me_requires_auth(client: TestClient) -> None:
    bare = client.get(f"{API}/auth/me", headers={"Authorization": ""})
    # Empty Authorization is treated as missing by HTTPBearer.
    assert bare.status_code == 401


def test_me_returns_current_user(client: TestClient) -> None:
    response = client.get(f"{API}/auth/me")
    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "google"
    assert body["email"] == "test@armoi.app"


def test_refresh_and_logout(client: TestClient) -> None:
    refresh_token = client.refresh_token  # type: ignore[attr-defined]
    user_id = client.user_id  # type: ignore[attr-defined]

    refreshed = client.post(
        f"{API}/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert refreshed.status_code == 200
    new_access = refreshed.json()["access_token"]
    assert decode_access_token(new_access)["sub"] == str(user_id)

    logout = client.post(f"{API}/auth/logout")
    assert logout.status_code == 204

    # Old refresh must fail after logout bumps token_version.
    denied = client.post(
        f"{API}/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert denied.status_code == 401


def test_upsert_user_is_idempotent(tmp_env, monkeypatch) -> None:
    from sqlalchemy.orm import sessionmaker

    from app import db as db_module
    from app.db import Base, build_engine

    engine = build_engine(f"sqlite:///{tmp_env / 'auth.db'}")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False, future=True)
    monkeypatch.setattr(db_module, "SessionLocal", Session)

    identity = Identity(
        provider="apple",
        subject="apple-sub-1",
        email="a@example.com",
        display_name="Ada",
    )
    with Session() as session:
        first = upsert_user(session, identity)
        session.commit()
        first_id = first.id
    with Session() as session:
        second = upsert_user(
            session,
            Identity(
                provider="apple",
                subject="apple-sub-1",
                email="a@example.com",
                display_name="Ada Lovelace",
            ),
        )
        session.commit()
        assert second.id == first_id
        assert second.display_name == "Ada Lovelace"
    engine.dispose()


def test_items_reject_unauthenticated(client: TestClient) -> None:
    response = client.get(f"{API}/items", headers={"Authorization": "Bearer not-a-jwt"})
    assert response.status_code == 401
