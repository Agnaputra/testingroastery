"""One-time price baseline migration, hard-guarded to the isolated 3B.4 test DB."""

import hashlib
import json
import os
from pathlib import Path
from urllib.parse import urlparse

import psycopg2
from psycopg2.extras import execute_values

from app.config import settings
from app.publication_service import PUBLICATION_SLUG_GROUPS
from app.rag_service import PUBLISHED_COFFEE_KNOWLEDGE_BASE


BASELINE = Path(__file__).with_name("price_baseline_3b4_c2.json")
EXPECTED_DATABASE = "coffee_publication_it_3b4"


def require_test_database() -> None:
    address = urlparse(settings.DATABASE_URL)
    if (
        settings.ENVIRONMENT != "test"
        or os.environ.get("PUBLICATION_PRICE_TEST_MODE") != "1"
        or address.hostname not in {"127.0.0.1", "localhost"}
        or address.port != 55432
        or address.path != f"/{EXPECTED_DATABASE}"
    ):
        raise RuntimeError("Price migration is restricted to the isolated 3B.4 test DB")


def snapshot_hash(rows: list[tuple[str, int]]) -> str:
    payload = json.dumps(sorted(rows), separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def validate_baseline(document: dict) -> None:
    rows = document["skus"]
    slugs = {row["slug"] for row in rows}
    if document["product_count"] != 31 or document["sku_count"] != len(rows) or len(slugs) != 31:
        raise RuntimeError("Baseline must contain exactly 31 coffee products")
    if len({row["sku_id"] for row in rows}) != len(rows):
        raise RuntimeError("Duplicate baseline SKU")
    web_slug_by_kb = {group[1]: group[0] for group in PUBLICATION_SLUG_GROUPS}
    matched = set()
    indexed = {row["sku_id"]: row["amount_idr"] for row in rows}
    for product in PUBLISHED_COFFEE_KNOWLEDGE_BASE:
        web_slug = product["slug"] if product["slug"] in slugs else web_slug_by_kb.get(product["slug"], product["slug"])
        if web_slug not in slugs:
            raise RuntimeError(f"Missing web product for KB slug {product['slug']}")
        matched.add(web_slug)
        for key, amount in product.items():
            if key.startswith("price_") and key.endswith("g"):
                weight = int(key.removeprefix("price_").removesuffix("g"))
                sku_id = f"{web_slug}:beans:{weight}"
                if indexed.get(sku_id) != amount:
                    raise RuntimeError(f"Web/KB baseline price mismatch: {sku_id}")
            elif key == "cup_price" and amount:
                sku_id = f"{web_slug}:cup:1"
                if indexed.get(sku_id) != amount:
                    raise RuntimeError(f"Web/KB baseline cup price mismatch: {sku_id}")
    if len(matched) != 26 or len(slugs - matched) != 5:
        raise RuntimeError("Expected 26 matched KB and 5 web-only coffee slugs")


def main() -> None:
    require_test_database()
    document = json.loads(BASELINE.read_text(encoding="utf-8"))
    validate_baseline(document)
    rows = document["skus"]
    digest = snapshot_hash([(row["sku_id"], row["amount_idr"]) for row in rows])
    with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT current_database()")
            if cursor.fetchone()[0] != EXPECTED_DATABASE:
                raise RuntimeError("Connected to an unexpected database")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS catalog_price_state (
                    singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
                    current_revision BIGINT NOT NULL CHECK (current_revision > 0)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS catalog_price_revisions (
                    revision BIGINT PRIMARY KEY,
                    source TEXT NOT NULL,
                    source_sha256 CHAR(64) NOT NULL,
                    snapshot_sha256 CHAR(64) NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS catalog_effective_prices (
                    sku_id TEXT PRIMARY KEY,
                    slug TEXT NOT NULL,
                    kind TEXT NOT NULL CHECK (kind IN ('beans', 'cup')),
                    weight_grams INTEGER NOT NULL CHECK (weight_grams > 0),
                    amount_idr BIGINT NOT NULL CHECK (amount_idr > 0),
                    revision BIGINT NOT NULL REFERENCES catalog_price_revisions(revision),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CHECK (sku_id = slug || ':' || kind || ':' || weight_grams::text)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS catalog_price_history (
                    revision BIGINT NOT NULL REFERENCES catalog_price_revisions(revision),
                    sku_id TEXT NOT NULL,
                    old_amount_idr BIGINT NOT NULL,
                    new_amount_idr BIGINT NOT NULL,
                    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (revision, sku_id)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS catalog_demo_quotes (
                    id UUID PRIMARY KEY,
                    revision BIGINT NOT NULL REFERENCES catalog_price_revisions(revision),
                    request_json JSONB NOT NULL,
                    quote_json JSONB NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMPTZ NOT NULL,
                    confirmed_at TIMESTAMPTZ
                )
            """)
            cursor.execute("SELECT current_revision FROM catalog_price_state")
            existing = cursor.fetchone()
            if existing:
                cursor.execute("SELECT count(*) FROM catalog_effective_prices")
                if cursor.fetchone()[0] != len(rows):
                    raise RuntimeError("Existing price store has a different SKU count")
                print(json.dumps({"status": "already_seeded", "revision": existing[0], "skus": len(rows)}))
                return
            cursor.execute(
                "INSERT INTO catalog_price_revisions (revision, source, source_sha256, snapshot_sha256) VALUES (1,%s,%s,%s)",
                (document["source"], document["source_sha256"], digest),
            )
            execute_values(cursor, """
                INSERT INTO catalog_effective_prices
                (sku_id, slug, kind, weight_grams, amount_idr, revision) VALUES %s
            """, [
                (r["sku_id"], r["slug"], r["kind"], r["weight_grams"], r["amount_idr"], 1)
                for r in rows
            ])
            cursor.execute("INSERT INTO catalog_price_state (singleton, current_revision) VALUES (TRUE,1)")
    print(json.dumps({"status": "seeded", "revision": 1, "products": 31, "skus": len(rows), "snapshot_sha256": digest}))


if __name__ == "__main__":
    main()
