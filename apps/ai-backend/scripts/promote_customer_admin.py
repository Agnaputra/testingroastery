"""Promote an existing verified customer account to admin."""
import os
from urllib.parse import urlparse

import psycopg2

from app.config import settings

email = os.getenv("CUSTOMER_ADMIN_EMAIL", "").strip().lower()
address = urlparse(settings.DATABASE_URL)
local_database = (settings.ENVIRONMENT == "development"
                  and address.hostname in {"localhost", "127.0.0.1"}
                  and address.path == "/testingroastery")
production_database = (settings.ENVIRONMENT == "production"
                       and address.hostname not in {"localhost", "127.0.0.1"}
                       and os.getenv("CUSTOMER_COMMERCE_MODE") == "operational"
                       and os.getenv("CUSTOMER_ADMIN_PROMOTION_PRODUCTION") == "1")
if not email or not (local_database or production_database):
    raise SystemExit("Refusing admin promotion without a verified database and explicit production confirmation")
with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
    with db.cursor() as cur:
        cur.execute("UPDATE customer_users SET role='admin' WHERE email=%s AND email_verified_at IS NOT NULL "
                    "AND disabled_at IS NULL RETURNING id", (email,))
        if cur.fetchone() is None:
            raise SystemExit("Verified customer account not found")
print("Verified customer account promoted to admin")
