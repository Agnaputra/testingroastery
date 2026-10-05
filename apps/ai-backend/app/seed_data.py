"""Seed public catalog chunks and their OpenAI embeddings into pgvector.

Run from ``apps/ai-backend`` with ``python -m app.seed_data`` after applying
``schema.sql`` to PostgreSQL. This script replaces a product's previous public
knowledge chunk, so it can safely be rerun when the catalog changes.
"""
from __future__ import annotations

from pathlib import Path

import psycopg2
import psycopg2.extras
from pgvector import Vector
from pgvector.psycopg2 import register_vector

from .config import settings
from .rag_service import PUBLISHED_COFFEE_KNOWLEDGE_BASE, rag_service


def _catalog_chunk(item: dict[str, object]) -> str:
    return (
        f"Kopi: {item['name']} | Series: {item['series']} | Origin: {item['origin']} | "
        f"Proses: {item['process']} | Tasting Notes: {', '.join(item['notes'])} | "
        f"Resep: {item['recipe']} | Deskripsi: {item['description']}"
    )


def _assert_vector_dimension(cursor: object) -> None:
    cursor.execute(
        """SELECT format_type(attribute.atttypid, attribute.atttypmod)
        FROM pg_attribute AS attribute
        WHERE attribute.attrelid = 'coffee_knowledge'::regclass
          AND attribute.attname = 'embedding' AND NOT attribute.attisdropped"""
    )
    row = cursor.fetchone()
    expected = f"vector({settings.EMBEDDING_DIMENSIONS})"
    if row and row[0] != expected:
        raise RuntimeError(
            "Dimensi embedding database tidak cocok. Buat ulang coffee_knowledge dengan "
            f"{expected} sebelum menjalankan seed. Jalankan python -m app.migrate_pgvector terlebih dahulu."
        )


def seed_database() -> None:
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY wajib diisi untuk membuat embedding pgvector.")

    print("Connecting to PostgreSQL database ...")
    with psycopg2.connect(settings.DATABASE_URL) as connection:
        with connection.cursor() as cursor:
            schema_path = Path(__file__).parents[1] / "schema.sql"
            cursor.execute(schema_path.read_text(encoding="utf-8"))
            # The pgvector adapter can only register after schema.sql has
            # created the vector extension and its database type.
            register_vector(connection)
            _assert_vector_dimension(cursor)

            categories = [
                ("Filter Based", "filter", "Koleksi single origin untuk seduhan manual brew V60, Kalita, Aeropress"),
                ("Espresso Based", "espresso", "Profil sangrai medium-dark untuk espresso machine, moka pot, dan es kopi susu"),
                ("Grand Reserve Micro-Lot", "reserve", "Lini kopi langka kompetisi dunia dalam kemasan tasting dose hingga 200g"),
            ]
            for name, slug, description in categories:
                cursor.execute(
                    """INSERT INTO categories (name, slug, description) VALUES (%s, %s, %s)
                    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description""",
                    (name, slug, description),
                )

            series_data = [
                (1, "Ijen Series", "ijen-series"),
                (1, "Enrekang Series", "enrekang-series"),
                (1, "Sunda Series", "sunda-series"),
                (1, "Java Exotic", "java-exotic"),
                (1, "Argopuro Walida", "argopuro-walida"),
                (3, "Grand Reserve", "grand-reserve"),
                (2, "Arabica Espresso", "arabica-espresso"),
                (2, "Robusta Espresso", "robusta-espresso"),
            ]
            for category_id, name, slug in series_data:
                cursor.execute(
                    """INSERT INTO series (category_id, name, slug) VALUES (%s, %s, %s)
                    ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, name = EXCLUDED.name""",
                    (category_id, name, slug),
                )

            for item in PUBLISHED_COFFEE_KNOWLEDGE_BASE:
                cursor.execute("SELECT id FROM series WHERE slug = %s", (item["series"].lower().replace(" ", "-"),))
                series_id = cursor.fetchone()[0]
                base_price = float(item.get("price_100g", item.get("price_200g", item.get("price_16g", 0))))
                cursor.execute(
                    """INSERT INTO products (
                        name, slug, series_id, origin, process, varietal, roast_profile,
                        tasting_notes, flavor_category, description, story, base_price
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (slug) DO UPDATE SET
                        name = EXCLUDED.name, series_id = EXCLUDED.series_id, origin = EXCLUDED.origin,
                        process = EXCLUDED.process, varietal = EXCLUDED.varietal,
                        roast_profile = EXCLUDED.roast_profile, tasting_notes = EXCLUDED.tasting_notes,
                        flavor_category = EXCLUDED.flavor_category, description = EXCLUDED.description,
                        story = EXCLUDED.story, base_price = EXCLUDED.base_price
                    RETURNING id""",
                    (
                        item["name"], item["slug"], series_id, item["origin"], item["process"],
                        item.get("varietal", ""), item.get("roast", ""), item["notes"],
                        item["flavor_category"], item["description"], item["description"], base_price,
                    ),
                )
                product_id = cursor.fetchone()[0]
                chunk = _catalog_chunk(item)
                embedding = rag_service._create_embedding(chunk)
                if embedding is None:
                    raise RuntimeError(f"Embedding gagal dibuat untuk {item['slug']}; transaksi dibatalkan.")

                # Do not accumulate stale chunks when a product is reseeded.
                cursor.execute("DELETE FROM coffee_knowledge WHERE metadata->>'slug' = %s", (item["slug"],))
                cursor.execute(
                    """INSERT INTO coffee_knowledge (product_id, title, document_chunk, metadata, embedding)
                    VALUES (%s, %s, %s, %s, %s)""",
                    (product_id, item["name"], chunk, psycopg2.extras.Json(item), Vector(embedding)),
                )
    print(f"Seeded {len(PUBLISHED_COFFEE_KNOWLEDGE_BASE)} public catalog chunks with pgvector embeddings.")


if __name__ == "__main__":
    seed_database()
