"""Safely migrate legacy vector dimensions before reseeding OpenAI embeddings.

The legacy embedding values are copied to a timestamped backup table before the
column is changed. They cannot be compared with a different vector dimension,
so the active column is reset to NULL and must be repopulated by seed_data.
"""
from __future__ import annotations

from datetime import datetime

import psycopg2
from psycopg2 import sql

from .config import settings


def migrate() -> None:
    dimensions = settings.EMBEDDING_DIMENSIONS
    if dimensions < 1 or dimensions > 16000:
        raise RuntimeError("EMBEDDING_DIMENSIONS tidak valid.")

    with psycopg2.connect(settings.DATABASE_URL) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """SELECT format_type(attribute.atttypid, attribute.atttypmod)
                FROM pg_attribute AS attribute
                WHERE attribute.attrelid = 'coffee_knowledge'::regclass
                  AND attribute.attname = 'embedding' AND NOT attribute.attisdropped"""
            )
            current_type = cursor.fetchone()[0]
            expected_type = f"vector({dimensions})"
            if current_type == expected_type:
                print(f"pgvector sudah menggunakan {expected_type}; tidak ada migrasi.")
                return

            backup_table = f"coffee_knowledge_embedding_backup_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            cursor.execute(
                sql.SQL("CREATE TABLE {} AS SELECT id, product_id, embedding, created_at FROM coffee_knowledge WHERE embedding IS NOT NULL")
                .format(sql.Identifier(backup_table))
            )
            cursor.execute("DROP INDEX IF EXISTS idx_coffee_knowledge_embedding")
            cursor.execute(
                f"ALTER TABLE coffee_knowledge ALTER COLUMN embedding TYPE vector({dimensions}) USING NULL"
            )
            cursor.execute(
                "CREATE INDEX idx_coffee_knowledge_embedding "
                "ON coffee_knowledge USING hnsw (embedding vector_cosine_ops)"
            )
    print(f"Migrated {current_type} to {expected_type}. Legacy vectors saved in {backup_table}.")
    print("Run python -m app.seed_data to create the new embeddings.")


if __name__ == "__main__":
    migrate()
