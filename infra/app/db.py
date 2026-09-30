"""Engine, session factory and the FastAPI session dependency.

Production schema changes go through Alembic (`alembic upgrade head`).
`init_db` still runs `create_all` so a fresh local SQLite file appears without
a manual migrate step; additive column sync remains for nullable columns on
dev databases that pre-date a model field.
"""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    """Declarative base for every ORM model."""


def _ensure_sqlite_parent(url: str) -> None:
    prefix = "sqlite:///"
    if not url.startswith(prefix):
        return
    raw = url[len(prefix) :]
    if raw and raw != ":memory:":
        Path(raw).parent.mkdir(parents=True, exist_ok=True)


def build_engine(url: str | None = None, **kwargs) -> Engine:
    """Create an engine with the SQLite pragmas Armoi relies on."""
    url = url or settings.resolved_database_url
    _ensure_sqlite_parent(url)
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    engine = create_engine(url, connect_args=connect_args, future=True, **kwargs)

    if url.startswith("sqlite"):

        @event.listens_for(engine, "connect")
        def _set_sqlite_pragmas(dbapi_connection, _record):  # pragma: no cover - driver hook
            cursor = dbapi_connection.cursor()
            # ON DELETE CASCADE is off by default in SQLite; the schema depends on it.
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.close()

    return engine


engine: Engine = build_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False, future=True)


def _add_missing_columns(target_engine: Engine) -> list[str]:
    """Add columns the models declare but an existing table lacks.

    Only nullable columns (or ones with a server default) can be added this
    way. Breaking changes — new NOT NULL columns, constraint renames — belong
    in Alembic migrations; production should not rely on this helper.
    """
    from sqlalchemy import inspect, text

    inspector = inspect(target_engine)
    added: list[str] = []

    with target_engine.begin() as connection:
        for table in Base.metadata.sorted_tables:
            if not inspector.has_table(table.name):
                continue
            existing = {column["name"] for column in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in existing:
                    continue
                if not column.nullable and column.server_default is None:
                    raise RuntimeError(
                        f"{table.name}.{column.name} is NOT NULL with no default; "
                        "run `alembic upgrade head` (or reset the local database)."
                    )
                ddl = column.type.compile(dialect=target_engine.dialect)
                connection.execute(
                    text(f"ALTER TABLE {table.name} ADD COLUMN {column.name} {ddl}")
                )
                added.append(f"{table.name}.{column.name}")

    return added


def init_db(target_engine: Engine | None = None) -> list[str]:
    """Create any missing tables, then any missing columns on existing ones."""
    from app import models  # noqa: F401  (import registers the mappers)

    bind = target_engine or engine
    Base.metadata.create_all(bind=bind)
    return _add_missing_columns(bind)


def get_session() -> Iterator[Session]:
    """FastAPI dependency yielding a request-scoped session."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
