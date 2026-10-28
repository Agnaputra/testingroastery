"""Copy public catalog prices to the isolated local/staging checkout authority."""
import json
import os
import subprocess
from pathlib import Path
from urllib.parse import urlparse

import psycopg2
from psycopg2.extras import execute_values

from app.config import settings

root = Path(__file__).resolve().parents[3]
address = urlparse(settings.DATABASE_URL)
if settings.ENVIRONMENT not in {"development", "test"} or address.hostname not in {"localhost", "127.0.0.1"}:
    raise SystemExit("Refusing to seed a nonlocal or production database")
output = subprocess.run(
    ["node", str(root / "apps/web/scripts/export-customer-catalog.cjs")],
    cwd=root, check=True, capture_output=True, text=True,
)
catalog = json.loads(output.stdout)
rows = catalog["rows"]
blend_prices = catalog["blendPrices"]
if not rows or len({row["skuId"] for row in rows}) != len(rows):
    raise SystemExit("Catalog snapshot is empty or contains duplicate SKUs")
bean_stock = int(os.getenv("CUSTOMER_TEST_BEAN_STOCK_GRAMS", "0"))
accessory_stock = int(os.getenv("CUSTOMER_TEST_ACCESSORY_STOCK_UNITS", "0"))
if not 0 <= bean_stock <= 1_000_000 or not 0 <= accessory_stock <= 10_000:
    raise SystemExit("Invalid local test stock configuration")
with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
    with db.cursor() as cur:
        cur.execute("SELECT pg_advisory_xact_lock(520025)")
        cur.execute("DELETE FROM customer_catalog_prices")
        execute_values(cur, "INSERT INTO customer_catalog_prices(sku_id,slug,product_name,variant_label,amount_idr,in_stock,category,weight_grams,resource_id) VALUES %s",
                       [(row["skuId"], row["slug"], row["productName"], row["variantLabel"], row["amountIdr"], row["inStock"],
                         row["category"], row["weightGrams"], row["resourceId"])
                        for row in rows])
        cur.execute("DELETE FROM customer_blend_prices")
        execute_values(cur, "INSERT INTO customer_blend_prices(slug,product_name,weight_grams,amount_idr) VALUES %s",
                       [(row["slug"], row["productName"], row["weightGrams"], row["amountIdr"])
                        for row in blend_prices])
        resources = {row["resourceId"]: ("unit" if row["category"] == "accessory" else "gram") for row in rows}
        execute_values(cur, "INSERT INTO customer_inventory(resource_id,unit,available_quantity) VALUES %s "
                       "ON CONFLICT(resource_id) DO NOTHING",
                       [(resource, unit, accessory_stock if unit == "unit" else bean_stock)
                        for resource, unit in resources.items()])
print(f"Seeded {len(rows)} published customer SKUs")
