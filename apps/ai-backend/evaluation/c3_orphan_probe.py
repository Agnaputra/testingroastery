"""C3 real-HTTP orphan probe against the isolated synthetic pgvector test DB."""

import httpx
import psycopg2

from app.config import settings
from app.price_service import require_price_test_mode


require_price_test_mode()
slug = "orphan-c3-synthetic"
with psycopg2.connect(settings.DATABASE_URL) as connection:
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO coffee_knowledge (title, document_chunk, metadata, embedding) "
            "SELECT title, document_chunk, jsonb_set(metadata, '{slug}', to_jsonb(%s::text)), embedding "
            "FROM coffee_knowledge WHERE metadata->>'slug'=%s LIMIT 1 RETURNING id",
            (slug, "ijen-carbonic-maceration-asmara"),
        )
        row = cursor.fetchone()
        if not row:
            raise RuntimeError("Synthetic source chunk is missing")
        orphan_id = row[0]

try:
    response = httpx.post(
        "http://127.0.0.1:8014/api/search",
        json={"query": "Ijen Carbonic Maceration", "limit": 10}, timeout=10,
    )
    response.raise_for_status()
    slugs = [product["slug"] for product in response.json()["results"]]
    if slug in slugs or "ijen-carbonic-maceration-asmara" not in slugs:
        raise AssertionError(f"Unexpected pgvector result slugs: {slugs}")
    print({"orphan_chunk_inserted": True, "orphan_retrieved": False, "published_retrieved": True})
finally:
    with psycopg2.connect(settings.DATABASE_URL) as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM coffee_knowledge WHERE id=%s", (orphan_id,))
