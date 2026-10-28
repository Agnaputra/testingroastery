"""Apply the additive inventory migration to the verified local test database only."""
from pathlib import Path
from urllib.parse import urlparse

import psycopg2

from app.config import settings

url = urlparse(settings.DATABASE_URL)
if settings.ENVIRONMENT != "development" or url.hostname not in {"localhost", "127.0.0.1"} or url.path != "/testingroastery":
    raise SystemExit("Refusing migration outside local development database")

sql = (Path(__file__).resolve().parents[1] / "migrations/20261026_customer_inventory.sql").read_text()
with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
    with db.cursor() as cur:
        cur.execute("SELECT to_regclass('public.customer_inventory')")
        if cur.fetchone()[0] is not None:
            raise SystemExit("Inventory migration already applied")
        cur.execute(sql)
print("Local customer inventory migration applied")
