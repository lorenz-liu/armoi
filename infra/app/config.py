"""Single source of truth for every tunable constant in the Armoi backend.

Rule: no module outside this file may define a configuration constant.
Everything else imports `settings` (env-overridable) or the frozen
domain constants declared underneath it.
"""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Directory layout -----------------------------------------------------------
INFRA_ROOT: Path = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Environment-driven settings. Prefix every env var with ``ARMOI_``."""

    model_config = SettingsConfigDict(
        env_prefix="ARMOI_",
        env_file=str(INFRA_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Armoi"
    api_version: str = "0.1.0"
    api_prefix: str = "/api/v1"

    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    database_url: str = "sqlite:///./data/armoi.db"
    media_dir: str = "./media"
    media_url_path: str = "/media"

    cors_origins: str = "*"

    # --- derived helpers ---------------------------------------------------
    @property
    def resolved_media_dir(self) -> Path:
        path = Path(self.media_dir)
        return path if path.is_absolute() else (INFRA_ROOT / path).resolve()

    @property
    def resolved_database_url(self) -> str:
        """Turn a relative sqlite path into an absolute one rooted at infra/."""
        prefix = "sqlite:///"
        if not self.database_url.startswith(prefix):
            return self.database_url
        raw = self.database_url[len(prefix) :]
        if raw.startswith("/") or raw == ":memory:":
            return self.database_url
        return prefix + str((INFRA_ROOT / raw).resolve())

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()

# Domain constants -----------------------------------------------------------
# Kept here (not in models/routers) so product rules are auditable in one place.

MAX_IMAGES_PER_ITEM: int = 10
MAX_IMAGE_BYTES: int = 12 * 1024 * 1024
ALLOWED_IMAGE_CONTENT_TYPES: frozenset[str] = frozenset(
    {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}
)
IMAGE_EXTENSION_BY_CONTENT_TYPE: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/heic": ".heic",
    "image/heif": ".heif",
}

SEASONS: tuple[str, ...] = ("spring", "summer", "autumn", "winter")
GENDERS: tuple[str, ...] = ("male", "female", "unisex")

# Currencies offered by the price dropdown, in display order.
CURRENCIES: tuple[str, ...] = (
    "CNY", "USD", "EUR", "GBP", "JPY", "KRW", "HKD", "TWD",
    "SGD", "AUD", "CAD", "CHF", "SEK", "THB",
)
DEFAULT_CURRENCY: str = "CNY"

# Pagination
DEFAULT_PAGE_SIZE: int = 60
MAX_PAGE_SIZE: int = 200

# Free-text fields
MAX_NAME_LENGTH: int = 120
MAX_BRAND_LENGTH: int = 80
MAX_STORAGE_LENGTH: int = 80
MAX_NOTES_LENGTH: int = 2000
AUTOCOMPLETE_LIMIT: int = 12

CATEGORY_PATH_SEPARATOR: str = "."
