"""Promote an existing verified account on the verified local development database."""
import os
from urllib.parse import urlparse

import psycopg2

from app.config import settings

email = os.getenv("CUSTOMER_ADMIN_EMAIL", "").strip().lower()
address = urlparse(settings.DATABASE_URL)
if (settings.ENVIRONMENT != "development" or address.hostname not in {"localhost", "127.0.0.1"}
        or address.path != "/testingroastery" or not email):
    raise SystemExit("Refusing admin promotion outside local development database or without CUSTOMER_ADMIN_EMAIL")
with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
    with db.cursor() as cur:
        cur.execute("UPDATE customer_users SET role='admin' WHERE email=%s AND email_verified_at IS NOT NULL "
                    "AND disabled_at IS NULL RETURNING id", (email,))
        if cur.fetchone() is None:
            raise SystemExit("Verified customer account not found")
print("Verified local customer account promoted to admin")
