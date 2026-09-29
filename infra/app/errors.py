"""Status-code aliases that stay stable across Starlette renames.

Starlette has been renaming several 4xx constants (422 "Unprocessable Entity"
-> "Unprocessable Content", 413 "Request Entity Too Large" -> "Content Too
Large"). Resolving them once here keeps the routers free of deprecation noise
and of version guards.
"""

from __future__ import annotations

from fastapi import status

UNPROCESSABLE: int = getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422)
CONTENT_TOO_LARGE: int = getattr(status, "HTTP_413_CONTENT_TOO_LARGE", 413)
UNSUPPORTED_MEDIA_TYPE: int = status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
CONFLICT: int = status.HTTP_409_CONFLICT
NOT_FOUND: int = status.HTTP_404_NOT_FOUND
BAD_REQUEST: int = status.HTTP_400_BAD_REQUEST
