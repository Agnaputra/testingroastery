"""Configure the verified operational shipping origin from explicit environment values."""
import os
from urllib.parse import urlparse

import psycopg2

from app.config import settings

address = urlparse(settings.DATABASE_URL)
values = [
    os.getenv("CUSTOMER_SHIPPING_ORIGIN_NAME", "").strip(),
    os.getenv("CUSTOMER_SHIPPING_ORIGIN_ADDRESS", "").strip(),
    os.getenv("CUSTOMER_SHIPPING_ORIGIN_CITY", "").strip(),
    os.getenv("CUSTOMER_SHIPPING_ORIGIN_PROVINCE", "").strip(),
    os.getenv("CUSTOMER_SHIPPING_ORIGIN_POSTAL_CODE", "").strip(),
]
confirmed_production = (
    settings.ENVIRONMENT == "production"
    and address.hostname not in {"localhost", "127.0.0.1"}
    and os.getenv("CUSTOMER_COMMERCE_MODE") == "operational"
    and os.getenv("CUSTOMER_SHIPPING_ORIGIN_PRODUCTION") == "1"
)
confirmed_preview = (
    settings.ENVIRONMENT == "preview"
    and address.hostname
    and address.hostname.endswith(".neon.tech")
    and os.getenv("CUSTOMER_COMMERCE_TEST_MODE") == "1"
)
confirmed_local = (
    settings.ENVIRONMENT in {"development", "test"}
    and address.hostname in {"localhost", "127.0.0.1"}
)
confirmed = confirmed_production or confirmed_preview or confirmed_local
if (
    not confirmed
    or min(map(len, values[:4])) < 2
    or len(values[1]) < 5
    or len(values[4]) != 5
    or not values[4].isdigit()
):
    raise SystemExit(
        "Refusing shipping origin update without complete values and explicit production confirmation"
    )

with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO customer_shipping_origin(id,name,full_address,city,province,postal_code,verified_at) "
            "VALUES (TRUE,%s,%s,%s,%s,%s,now()) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,"
            "full_address=EXCLUDED.full_address,city=EXCLUDED.city,province=EXCLUDED.province,"
            "postal_code=EXCLUDED.postal_code,verified_at=now(),updated_at=now()",
            values,
        )
print("Verified production shipping origin configured")
