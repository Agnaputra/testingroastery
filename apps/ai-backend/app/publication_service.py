from __future__ import annotations

from typing import Any

import psycopg2
from psycopg2.extras import execute_values

from .config import settings


def ensure_publication_schema() -> None:
    with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS catalog_publication_overrides (
                    slug VARCHAR(150) PRIMARY KEY,
                    is_published BOOLEAN NOT NULL,
                    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )


def get_publication_overrides() -> dict[str, bool]:
    with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT slug, is_published FROM catalog_publication_overrides")
            return {slug: bool(is_published) for slug, is_published in cursor.fetchall()}


def set_publication(slugs: list[str], is_published: bool) -> None:
    with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as connection:
        with connection.cursor() as cursor:
            execute_values(
                cursor,
                """
                INSERT INTO catalog_publication_overrides (slug, is_published)
                VALUES %s
                ON CONFLICT (slug) DO UPDATE SET
                    is_published = EXCLUDED.is_published,
                    updated_at = CURRENT_TIMESTAMP
                """,
                [(slug, is_published) for slug in slugs],
            )


def apply_publication_overrides(
    products: list[dict[str, Any]], overrides: dict[str, bool]
) -> list[dict[str, Any]]:
    return [product for product in products if overrides.get(str(product["slug"]), True)]
