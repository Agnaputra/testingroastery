"""Read-only eligibility check for the unchanged 3B.2 draft dataset."""

import json
from pathlib import Path
from urllib.parse import urlparse

import psycopg2

from app.config import settings


def main() -> None:
    address = urlparse(settings.DATABASE_URL)
    if address.hostname not in {"localhost", "127.0.0.1"} or address.port not in {None, 5432} or address.path != "/testingroastery":
        raise RuntimeError("Snapshot check permits only the known local read-only audit DB")

    dataset = json.loads((Path(__file__).parent / "dataset_candidates_3b.json").read_text(encoding="utf-8"))
    selected = [item for item in dataset["candidates"] if item.get("proposed_final")]
    with psycopg2.connect(settings.DATABASE_URL) as connection:
        connection.set_session(readonly=True)
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT DISTINCT metadata->>'slug' FROM coffee_knowledge "
                "WHERE embedding IS NOT NULL "
                "AND COALESCE(metadata->>'publication_status', 'published') = 'published'"
            )
            embedded = {row[0] for row in cursor.fetchall()}
            cursor.execute("SELECT slug, is_published FROM catalog_publication_overrides")
            overrides = dict(cursor.fetchall())

    missing = []
    inactive = []
    for item in selected:
        for slug in item["expected_slugs"]:
            if slug not in embedded:
                missing.append((item["id"], slug))
            if overrides.get(slug) is False:
                inactive.append((item["id"], slug))
    print(json.dumps({
        "dataset_status": dataset["dataset_status"],
        "selected": len(selected),
        "embedded_slugs": len(embedded),
        "missing": missing,
        "unpublished": inactive,
        "read_only": True,
        "source": "localhost:5432/testingroastery",
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
