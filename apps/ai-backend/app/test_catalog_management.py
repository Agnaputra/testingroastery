"""Opt-in local integration for managed catalog CRUD and image storage."""
import io
import os
import unittest
from uuid import uuid4
from urllib.parse import urlparse

import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.testclient import TestClient
from fastapi import HTTPException
from PIL import Image

from .config import settings
from .main import app
from .customer_orders import LineInput, priced_lines
from .catalog_management import Product


@unittest.skipUnless(os.getenv("CUSTOMER_COMMERCE_IT") == "1", "local integration only")
class ManagedCatalogIntegration(unittest.TestCase):
    def setUp(self):
        url = urlparse(settings.DATABASE_URL)
        if settings.ENVIRONMENT != "development" or url.hostname not in {"localhost", "127.0.0.1"} \
                or url.path != "/testingroastery" or not settings.ADMIN_API_KEY:
            raise RuntimeError("Refusing catalog integration outside local development")
        self.slug = f"qa-managed-{uuid4().hex[:10]}"
        self.client = TestClient(app)
        self.admin = {"X-Admin-Key": settings.ADMIN_API_KEY}

    def tearDown(self):
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("DELETE FROM catalog_managed_products WHERE slug=%s", (self.slug,))
                cur.execute("DELETE FROM catalog_publication_overrides WHERE slug=%s", (self.slug,))
                cur.execute("DELETE FROM customer_shipping_weights WHERE sku_id LIKE %s", (f"{self.slug}:%",))
                cur.execute("DELETE FROM customer_inventory_movements WHERE resource_id LIKE %s", (f"pack:{self.slug}:%",))
                cur.execute("DELETE FROM customer_inventory WHERE resource_id LIKE %s", (f"pack:{self.slug}:%",))
                cur.execute("DELETE FROM customer_catalog_prices WHERE slug=%s", (self.slug,))
        self.client.close()

    def product(self):
        return {"id": self.slug, "slug": self.slug, "name": "QA Managed Coffee", "category": "filter",
                "categoryLabel": "Filter Based", "series": "Ijen Series", "origin": "East Java",
                "region": "Ijen", "altitude": "1400 MASL", "varietal": "Typica", "process": "Washed",
                "roastLevel": "Light", "tastingNotes": ["Citrus"], "flavorCategory": ["Fruity"],
                "description": "Synthetic product for local catalog integration.", "story": "Local fixture.",
                "variants": [{"weightGrams": 100, "weightLabel": "100g", "price": 45000,
                              "inStock": True, "stockUnits": 3}],
                "basePrice": 45000, "defaultWeight": "100g", "imageUrl": "/images/bag-prau.jpg",
                "acidity": 3, "sweetness": 4, "body": 3,
                "brewingRecipe": {"method": "V60", "dose": "15g", "water": "225ml", "ratio": "1:15",
                                  "temp": "92C", "time": "2m", "steps": ["Bloom."]}}

    def test_variant_labels_can_share_weight(self):
        payload = self.product()
        payload["variants"].append({**payload["variants"][0], "weightLabel": "100g Gift Box"})
        payload["defaultWeight"] = "100g"
        self.assertEqual(len(Product.model_validate(payload).variants), 2)

    def test_create_edit_image_publish_archive(self):
        payload = self.product()
        self.assertEqual(self.client.post("/api/catalog/managed", json=payload).status_code, 401)
        created = self.client.post("/api/catalog/managed", headers=self.admin, json=payload)
        self.assertEqual(created.status_code, 201, created.text)
        self.assertFalse(created.json()["isPublished"])
        self.assertNotIn(self.slug, [row["slug"] for row in self.client.get("/api/catalog/publication").json()["managedProducts"]])
        sku = f"{self.slug}:beans:100:100g"
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("SELECT amount_idr FROM customer_catalog_prices WHERE sku_id=%s", (sku,))
                self.assertEqual(cur.fetchone()[0], 45000)
                cur.execute("SELECT available_quantity FROM customer_inventory WHERE resource_id=%s", (f"pack:{sku}",))
                self.assertEqual(cur.fetchone()[0], 3)
                with db.cursor(cursor_factory=RealDictCursor) as keyed:
                    with self.assertRaises(HTTPException) as blocked:
                        priced_lines(keyed, [LineInput(skuId=sku, quantity=1, unitPrice=45000, grindLabel="Whole Beans")])
                self.assertEqual(blocked.exception.status_code, 409)
        changed = {**payload, "name": "QA Managed Coffee Edited",
                   "variants": [{**payload["variants"][0], "price": 47000}], "basePrice": 47000}
        self.assertEqual(self.client.put(f"/api/catalog/managed/{self.slug}", headers=self.admin,
                                         json=changed).status_code, 200)
        picture = io.BytesIO()
        Image.new("RGB", (40, 40), "#3c4f45").save(picture, format="PNG")
        upload = self.client.post(f"/api/catalog/managed/{self.slug}/image", headers=self.admin,
                                  files={"file": ("product.png", picture.getvalue(), "image/png")})
        self.assertEqual(upload.status_code, 200, upload.text)
        self.assertEqual(self.client.get(f"/api/catalog/managed/{self.slug}/image").status_code, 404)
        self.assertEqual(self.client.get(f"/api/catalog/managed/{self.slug}/image", headers=self.admin).status_code, 200)
        self.assertEqual(self.client.patch(f"/api/catalog/managed/{self.slug}/publication", headers=self.admin,
                                           json={"isPublished": True}).status_code, 200)
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor(cursor_factory=RealDictCursor) as cur:
                lines, resources = priced_lines(cur, [LineInput(skuId=sku, quantity=1,
                                                  unitPrice=47000, grindLabel="Whole Beans")])
                self.assertEqual(lines[0]["amount_idr"], 47000)
                self.assertEqual(resources, {f"pack:{sku}": 1})
        listed = self.client.get("/api/catalog/publication").json()["managedProducts"]
        self.assertEqual(next(row for row in listed if row["slug"] == self.slug)["name"], changed["name"])
        self.assertEqual(self.client.get(f"/api/catalog/managed/{self.slug}/image").headers["content-type"], "image/webp")
        self.assertEqual(self.client.delete(f"/api/catalog/managed/{self.slug}", headers=self.admin).status_code, 200)
        self.assertNotIn(self.slug, [row["slug"] for row in self.client.get("/api/catalog/publication").json()["managedProducts"]])
        self.assertEqual(self.client.patch(f"/api/catalog/managed/{self.slug}/restore", headers=self.admin).status_code, 200)
        self.assertNotIn(self.slug, [row["slug"] for row in self.client.get("/api/catalog/publication").json()["managedProducts"]])
