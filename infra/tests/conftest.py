"""Test harness: a throwaway SQLite file + media dir per test."""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app import db as db_module
from app.config import settings
from app.db import Base, build_engine, get_session
from app.main import create_app

API = settings.api_prefix


@pytest.fixture()
def tmp_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    monkeypatch.setattr(settings, "media_dir", str(tmp_path / "media"))
    return tmp_path


@pytest.fixture()
def client(tmp_env: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    engine = build_engine(f"sqlite:///{tmp_env / 'test.db'}")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False, future=True
    )
    # init_db() in the lifespan would otherwise touch the real database.
    monkeypatch.setattr(db_module, "engine", engine)
    monkeypatch.setattr(db_module, "SessionLocal", TestingSession)

    def override() -> Iterator:
        session = TestingSession()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    app = create_app()
    app.dependency_overrides[get_session] = override
    with TestClient(app) as test_client:
        yield test_client
    engine.dispose()


# --- helpers ---------------------------------------------------------------
def make_item(client: TestClient, **overrides) -> dict:
    payload = {
        "name": "Wool Coat",
        "brand": "Totême",
        "storage": "Hallway Closet",
        "category_id": "clothing.outerwear.coats",
        "gender": "female",
        "seasons": ["autumn", "winter"],
        "price_amount": "699.00",
        "price_currency": "EUR",
        "notes": "Oversized, double faced wool.",
    }
    payload.update(overrides)
    response = client.post(f"{API}/items", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def png_bytes(color: tuple[int, int, int] = (200, 190, 175), size: int = 8) -> bytes:
    import io

    from PIL import Image

    buffer = io.BytesIO()
    Image.new("RGB", (size, size), color).save(buffer, format="PNG")
    return buffer.getvalue()


@pytest.fixture()
def make() -> type:
    class Factory:
        item = staticmethod(make_item)
        png = staticmethod(png_bytes)

    return Factory
