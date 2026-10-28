from __future__ import annotations

from typing import Any

import psycopg2
from psycopg2.extras import execute_values

from .config import settings


# Admin mapping aliases and knowledge slugs must change as one publication unit.
PUBLICATION_SLUG_GROUPS = (
    ("prau-natural-surya", "prau-natural-el-davisio-surya"),
    ("grand-reserve-magnum-sidra", "magnum-sidra-el-vergel-soberano"),
    ("grand-reserve-el-triunfo-geisha", "el-triunfo-geisha-tolima-aurora"),
    ("grand-reserve-sudan-rume-carmin", "sudan-rume-huila-carmin"),
    ("grand-reserve-yemen-sahara", "yemen-haraz-golden-harvest-sahara"),
    ("dampit-natural-robusta-espresso", "dampit-natural-espresso"),
)
WEB_ONLY_SLUGS = frozenset({
    "prau-not-chiroso-unchiro", "sindoro-lavender-candy",
    "inmaculada-pink-bourbon-marfil", "telemung-honey-robusta-espresso",
    "gayo-full-wash-arabica-espresso",
})


def _publication_group(slug: str) -> tuple[str, ...]:
    return next((group for group in PUBLICATION_SLUG_GROUPS if slug in group), (slug,))


def known_publication_slugs() -> set[str]:
    from .rag_service import PUBLISHED_COFFEE_KNOWLEDGE_BASE

    return (
        {str(product["slug"]) for product in PUBLISHED_COFFEE_KNOWLEDGE_BASE}
        | {slug for group in PUBLICATION_SLUG_GROUPS for slug in group}
        | set(WEB_ONLY_SLUGS)
    )


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
            overrides = {slug: bool(is_published) for slug, is_published in cursor.fetchall()}
            for group in PUBLICATION_SLUG_GROUPS:
                if any(overrides.get(slug) is False for slug in group):
                    overrides.update({slug: False for slug in group})
            return overrides


def set_publication(slugs: list[str], is_published: bool) -> None:
    expanded = sorted({member for slug in slugs for member in _publication_group(slug)})
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
                [(slug, is_published) for slug in expanded],
            )


def apply_publication_overrides(
    products: list[dict[str, Any]], overrides: dict[str, bool]
) -> list[dict[str, Any]]:
    return [product for product in products if overrides.get(str(product["slug"]), True)]
