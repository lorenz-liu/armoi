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
    # ``dev`` enables the test-only auth bypass; ``prod`` is Fly / production.
    env: str = "dev"

    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    database_url: str = "sqlite:///./data/armoi.db"
    media_dir: str = "./media"
    media_url_path: str = "/media"
    # ``local`` writes to media_dir; ``s3`` uses Tigris / any S3-compatible store.
    media_backend: str = "local"

    cors_origins: str = "*"

    # Auth — JWT issued after verifying a Google / Apple ID token.
    jwt_secret: str = "dev-only-change-me"
    jwt_access_ttl_seconds: int = 60 * 60  # 1 hour
    jwt_refresh_ttl_seconds: int = 60 * 60 * 24 * 30  # 30 days
    # Comma-separated OAuth client IDs accepted as `aud` on Google ID tokens
    # (iOS, Android, and optionally a web client).
    google_client_ids: str = ""
    # Apple bundle id / Services ID accepted as `aud` on Apple ID tokens.
    apple_client_id: str = ""

    # Tigris / S3-compatible object storage (used when media_backend=s3).
    s3_endpoint_url: str = ""
    s3_region: str = "auto"
    s3_bucket: str = ""
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_public_base_url: str = ""
    s3_presign_ttl_seconds: int = 60 * 60

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

    @property
    def google_client_id_list(self) -> list[str]:
        return [c.strip() for c in self.google_client_ids.split(",") if c.strip()]

    @property
    def is_s3_media(self) -> bool:
        return self.media_backend.strip().lower() == "s3"

    @property
    def is_dev(self) -> bool:
        return self.env.strip().lower() == "dev"


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

# Sorting. The column each name maps to lives in services/items.py, which is
# where the ORM is in scope; only the vocabulary is configuration.
SORT_FIELDS: tuple[str, ...] = ("created_at", "updated_at", "name", "price", "last_used")
DEFAULT_SORT: str = "created_at"
DEFAULT_ORDER: str = "desc"

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

AUTH_PROVIDERS: tuple[str, ...] = ("google", "apple")
APPLE_JWKS_URL: str = "https://appleid.apple.com/auth/keys"
GOOGLE_JWKS_URL: str = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ISSUERS: frozenset[str] = frozenset(
    {"https://accounts.google.com", "accounts.google.com"}
)
APPLE_ISSUER: str = "https://appleid.apple.com"
