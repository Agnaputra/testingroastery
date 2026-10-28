"""C3 real-HTTP chunkless probe, restoring the synthetic test row in finally."""

import httpx
import psycopg2
from psycopg2.extras import Json
from pgvector.psycopg2 import register_vector

from app.config import settings
from app.price_service import require_price_test_mode


require_price_test_mode()
slug = "ijen-carbonic-maceration-asmara"
with psycopg2.connect(settings.DATABASE_URL) as connection:
    register_vector(connection)
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT id, title, document_chunk, metadata, embedding FROM coffee_knowledge "
            "WHERE metadata->>'slug'=%s", (slug,),
        )
        rows = cursor.fetchall()
        if len(rows) != 1:
            raise RuntimeError("Expected exactly one synthetic test chunk")
        cursor.execute("DELETE FROM coffee_knowledge WHERE id=%s", (rows[0][0],))

try:
    with httpx.Client(timeout=15) as client:
        health = client.get("http://127.0.0.1:8014/health")
        health.raise_for_status()
        retrieval = health.json()["retrieval"]
        if retrieval["embedded_chunks"] != 0 or retrieval["runtime"] != "fallback_in_memory":
            raise AssertionError("Health incorrectly reports pgvector")
        search = client.post(
            "http://127.0.0.1:8014/api/search",
            json={"query": "Ijen Carbonic Maceration", "limit": 5},
        )
        search.raise_for_status()
        # An in-memory result can still contain Ijen; zero chunks proves it is not pgvector.
        print({"embedded_chunks": 0, "search_slugs": [item["slug"] for item in search.json()["results"]]})
finally:
    with psycopg2.connect(settings.DATABASE_URL) as connection:
        register_vector(connection)
        with connection.cursor() as cursor:
            cursor.executemany(
                "INSERT INTO coffee_knowledge (id, title, document_chunk, metadata, embedding) "
                "VALUES (%s,%s,%s,%s,%s)",
                [(id_, title, chunk, Json(metadata), embedding) for id_, title, chunk, metadata, embedding in rows],
            )
