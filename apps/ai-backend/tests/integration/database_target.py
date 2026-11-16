"""Fail closed before enabling tests that can write database rows."""
import os
from urllib.parse import urlparse

from app.core.config import settings


def isolated_database_enabled() -> bool:
    try:
        target = urlparse(settings.DATABASE_URL)
        return (
            os.getenv("BACKEND_DATABASE_IT") == "1"
            and settings.ENVIRONMENT == "test"
            and target.hostname in {"localhost", "127.0.0.1"}
            and target.port == 55433
            and target.path == "/coffee_backend_refactor_it"
        )
    except ValueError:
        return False
