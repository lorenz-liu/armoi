"""ASGI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db import init_db
from app.routers import auth, catalog, items
from app.routers.vocabularies import brands_router, storages_router
from app.services.images import media_dir


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    if not settings.is_s3_media:
        media_dir()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.api_version,
        description="Personal wardrobe, bag and jewellery library.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix=settings.api_prefix)
    app.include_router(items.router, prefix=settings.api_prefix)
    app.include_router(brands_router, prefix=settings.api_prefix)
    app.include_router(storages_router, prefix=settings.api_prefix)
    app.include_router(catalog.router, prefix=settings.api_prefix)

    if not settings.is_s3_media:
        app.mount(
            settings.media_url_path,
            StaticFiles(directory=media_dir(), check_dir=False),
            name="media",
        )

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        return {"status": "ok", "app": settings.app_name, "version": settings.api_version}

    return app


app = create_app()
