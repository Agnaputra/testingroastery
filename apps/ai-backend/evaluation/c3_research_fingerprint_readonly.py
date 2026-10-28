"""Hash the local research DB through read-only psql without exposing row contents."""

import hashlib
import json
import subprocess
from pathlib import Path


query = """
SELECT json_build_array(knowledge.metadata, knowledge.document_chunk, knowledge.embedding::text)
FROM coffee_knowledge AS knowledge
LEFT JOIN catalog_publication_overrides AS publication
  ON publication.slug = knowledge.metadata->>'slug'
WHERE knowledge.embedding IS NOT NULL
  AND COALESCE(knowledge.metadata->>'publication_status', 'published') = 'published'
  AND COALESCE(publication.is_published, TRUE) = TRUE
ORDER BY knowledge.metadata->>'slug', knowledge.id
"""
result = subprocess.run(
    ["docker", "exec", "testingroastery-pgvector", "psql", "-X", "-q", "-t", "-A",
     "-U", "postgres", "-d", "testingroastery", "-c", query],
    check=True, capture_output=True, encoding="utf-8", timeout=15,
)
rows = [json.loads(line) for line in result.stdout.splitlines() if line.strip()]
if not rows:
    raise RuntimeError("Research KB has no published embedded rows")
payload = json.dumps(rows, ensure_ascii=False, sort_keys=True, default=str)
dataset = json.loads((Path(__file__).parent / "dataset_candidates_3b.json").read_text(encoding="utf-8"))
selected = [item for item in dataset["candidates"] if item.get("proposed_final")]
published_slugs = {row[0]["slug"] for row in rows}
missing = [(item["id"], slug) for item in selected for slug in item["expected_slugs"]
           if slug not in published_slugs]
print({"database": "testingroastery", "read_only": True, "rows": len(rows),
       "fingerprint": "pgvector:" + hashlib.sha256(payload.encode("utf-8")).hexdigest(),
       "selected_fixtures": len(selected), "not_in_published_kb": missing})
