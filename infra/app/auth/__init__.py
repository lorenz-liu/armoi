"""Auth package: JWT issuance and OAuth ID-token verification."""

from app.auth.providers import Identity, verify_apple_id_token, verify_google_id_token
from app.auth.tokens import (
    TokenPair,
    create_token_pair,
    decode_access_token,
    decode_refresh_token,
)

__all__ = [
    "Identity",
    "TokenPair",
    "create_token_pair",
    "decode_access_token",
    "decode_refresh_token",
    "verify_apple_id_token",
    "verify_google_id_token",
]
