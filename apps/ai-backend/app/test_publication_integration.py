"""Isolated publication tests. Never run against the research or production DB."""

import copy
import os
import unittest
from unittest.mock import patch
from urllib.parse import urlparse

import psycopg2
from psycopg2.extras import Json
from fastapi.testclient import TestClient
from pgvector.psycopg2 import register_vector
from pgvector import Vector

from .config import settings
from .main import app
from .publication_service import get_publication_overrides, set_publication
from .rag_service import PUBLISHED_COFFEE_KNOWLEDGE_BASE, rag_service


TEST_DATABASE = "coffee_publication_it_3b4"
TEST_PORT = 55432


def require_isolated_database():
    address = urlparse(settings.DATABASE_URL)
    if (
        settings.ENVIRONMENT != "test"
        or address.hostname not in {"127.0.0.1", "localhost"}
        or address.port != TEST_PORT
        or address.path.lstrip("/") != TEST_DATABASE
    ):
        raise RuntimeError("Publication integration tests require isolated DB and no OpenAI key")


@unittest.skipUnless(os.environ.get("PUBLICATION_IT_3B4") == "1", "isolated integration suite only")
class PublicationIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        require_isolated_database()
        settings.OPENAI_API_KEY = ""
        rag_service.openai_api_key = ""

    def setUp(self):
        require_isolated_database()
        self.product = copy.deepcopy(PUBLISHED_COFFEE_KNOWLEDGE_BASE[0])
        self.slug = self.product["slug"]
        self.vector = [1.0] + [0.0] * 1535
        with psycopg2.connect(settings.DATABASE_URL) as connection:
            register_vector(connection)
            with connection.cursor() as cursor:
                cursor.execute("TRUNCATE coffee_knowledge, catalog_publication_overrides")
                cursor.execute(
                    "INSERT INTO coffee_knowledge (title, document_chunk, metadata, embedding) "
                    "VALUES (%s, %s, %s, %s)",
                    ("Synthetic published chunk", "Synthetic publication fixture", Json(self.product), Vector(self.vector)),
                )

    def search(self):
        with patch.object(rag_service, "_create_embedding", return_value=self.vector):
            return rag_service.search_similar_products(self.slug, top_k=5)

    def test_it01_published_retrieval(self):
        results = self.search()
        self.assertEqual(results[0][0]["slug"], self.slug)
        self.assertNotIn(self.slug, get_publication_overrides())

    def test_it02_unpublish_retains_chunk_but_blocks_retrieval(self):
        set_publication([self.slug], False)
        with psycopg2.connect(settings.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT count(*) FROM coffee_knowledge WHERE metadata->>'slug' = %s", (self.slug,))
                self.assertEqual(cursor.fetchone()[0], 1)
        self.assertTrue(all(item[0]["slug"] != self.slug for item in self.search()))
        with TestClient(app) as client:
            self.assertNotIn(self.slug, {p["slug"] for p in client.get("/api/products").json()["data"]})
            with patch.object(rag_service, "_create_embedding", return_value=self.vector):
                results = client.post("/api/search", json={"query": self.slug, "limit": 5})
            self.assertEqual(results.status_code, 200)
            self.assertNotIn(self.slug, {item["slug"] for item in results.json()["results"]})

    def test_it03_republish_and_no_chunk(self):
        set_publication([self.slug], False)
        set_publication([self.slug], True)
        self.assertEqual(self.search()[0][0]["slug"], self.slug)
        with psycopg2.connect(settings.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM coffee_knowledge")
        # In-memory response is allowed, but it cannot be called pgvector retrieval.
        with patch.object(rag_service, "_create_embedding", return_value=self.vector):
            self.assertEqual(rag_service._search_pgvector(self.slug, 5), [])

    def test_it05_orphan_chunk_and_alias_pair(self):
        orphan = dict(self.product, slug="synthetic-orphan-slug")
        with psycopg2.connect(settings.DATABASE_URL) as connection:
            register_vector(connection)
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO coffee_knowledge (title, document_chunk, metadata, embedding) VALUES (%s,%s,%s,%s)",
                    ("Orphan", "Stale orphan chunk", Json(orphan), Vector(self.vector)),
                )
        with patch.object(rag_service, "_create_embedding", return_value=self.vector):
            results = rag_service._search_pgvector(self.slug, 5)
        self.assertTrue(all(row[0]["slug"] != orphan["slug"] for row in results))
        set_publication(["prau-natural-surya"], False)
        overrides = get_publication_overrides()
        self.assertFalse(overrides["prau-natural-surya"])
        self.assertFalse(overrides["prau-natural-el-davisio-surya"])

    def test_it06_status_outage_fails_closed(self):
        with patch("app.rag_service.get_publication_overrides", side_effect=psycopg2.OperationalError("test outage")):
            self.assertEqual(self.search(), [])
        with TestClient(app) as client:
            with patch("app.main.get_publication_overrides", side_effect=psycopg2.OperationalError("test outage")):
                self.assertEqual(client.get("/api/catalog/publication").status_code, 503)
                self.assertEqual(client.get("/api/products").status_code, 503)

    def test_admin_rejects_unknown_slug_and_updates_pair(self):
        settings.ADMIN_API_KEY = "synthetic-test-key"
        with TestClient(app) as client:
            invalid = client.patch(
                "/api/catalog/publication",
                headers={"X-Admin-Key": settings.ADMIN_API_KEY},
                json={"slugs": ["synthetic-orphan-slug"], "isPublished": True},
            )
            self.assertEqual(invalid.status_code, 422)
            updated = client.patch(
                "/api/catalog/publication",
                headers={"X-Admin-Key": settings.ADMIN_API_KEY},
                json={"slugs": ["prau-natural-surya"], "isPublished": False},
            )
            self.assertEqual(updated.status_code, 200)
            overrides = client.get("/api/catalog/publication").json()["overrides"]
            self.assertFalse(overrides["prau-natural-surya"])
            self.assertFalse(overrides["prau-natural-el-davisio-surya"])


if __name__ == "__main__":
    unittest.main()
