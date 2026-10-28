"""Local development integration test; opt in with CUSTOMER_COMMERCE_IT=1."""
import io
import hashlib
import os
import secrets
import unittest
import uuid
from concurrent.futures import ThreadPoolExecutor
from math import floor
from pathlib import Path
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

import psycopg2
from fastapi.testclient import TestClient
from PIL import Image
from pypdf import PdfWriter

from .config import settings
from .main import app


@unittest.skipUnless(os.getenv("CUSTOMER_COMMERCE_IT") == "1", "local commerce integration only")
class CustomerCommerceIntegration(unittest.TestCase):
    def setUp(self):
        url = urlparse(settings.DATABASE_URL)
        if settings.ENVIRONMENT != "development" or url.hostname not in {"localhost", "127.0.0.1"} \
                or url.path != "/testingroastery" or os.getenv("CUSTOMER_COMMERCE_TEST_MODE") != "1":
            raise RuntimeError("Refusing test outside local development database")
        self.client = TestClient(app)
        self.users = []
        self.synthetic_resources = []
        self.synthetic_blend_slugs = []
        self.synthetic_rates = []
        self.synthetic_weight_keys = []
        self.synthetic_origin_created = False
        self.previous_operational_mode = os.environ.get("CUSTOMER_OPERATIONAL_TEST_MODE")
        self.previous_allowlist = os.environ.get("CUSTOMER_TEST_EMAIL_ALLOWLIST")
        self.outbox = Path(".private/customer-auth-outbox")
        self.password = secrets.token_urlsafe(24)
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("DELETE FROM customer_auth_attempts WHERE key_hash=%s",
                            (hashlib.sha256(b"register-ip:testclient").hexdigest(),))

    def tearDown(self):
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                for user_id in self.users:
                    cur.execute("SELECT id FROM customer_orders WHERE user_id=%s", (user_id,))
                    ids = [row[0] for row in cur.fetchall()]
                    if ids:
                        cur.execute("SELECT resource_id,sum(quantity) FROM customer_order_inventory "
                                    "WHERE order_id=ANY(%s::uuid[]) GROUP BY resource_id", (ids,))
                        for resource, quantity in cur.fetchall():
                            cur.execute("UPDATE customer_inventory SET available_quantity=available_quantity+%s "
                                        "WHERE resource_id=%s", (quantity, resource))
                        cur.execute("DELETE FROM customer_order_inventory WHERE order_id=ANY(%s::uuid[])", (ids,))
                        cur.execute("DELETE FROM customer_order_status_history WHERE order_id=ANY(%s::uuid[])", (ids,))
                        cur.execute("DELETE FROM customer_payment_proofs WHERE order_id=ANY(%s::uuid[])", (ids,))
                        cur.execute("DELETE FROM customer_payments WHERE order_id=ANY(%s::uuid[])", (ids,))
                        cur.execute("DELETE FROM customer_order_items WHERE order_id=ANY(%s::uuid[])", (ids,))
                        cur.execute("DELETE FROM customer_orders WHERE id=ANY(%s::uuid[])", (ids,))
                    cur.execute("DELETE FROM customer_users WHERE id=%s", (user_id,))
                for sku, resource in self.synthetic_resources:
                    cur.execute("DELETE FROM customer_shipping_weights WHERE sku_id=%s", (sku,))
                    cur.execute("DELETE FROM customer_catalog_prices WHERE sku_id=%s", (sku,))
                    cur.execute("DELETE FROM customer_inventory_movements WHERE resource_id=%s", (resource,))
                    cur.execute("DELETE FROM customer_inventory WHERE resource_id=%s", (resource,))
                for sku in self.synthetic_weight_keys:
                    cur.execute("DELETE FROM customer_shipping_weights WHERE sku_id=%s", (sku,))
                for slug in self.synthetic_blend_slugs:
                    cur.execute("DELETE FROM customer_blend_prices WHERE slug=%s", (slug,))
                for province, city, district in self.synthetic_rates:
                    cur.execute("DELETE FROM customer_shipping_rates WHERE province=%s AND city=%s AND district=%s",
                                (province, city, district))
                if self.synthetic_origin_created:
                    cur.execute("DELETE FROM customer_shipping_origin WHERE id=TRUE")
        self.client.close()
        if self.previous_allowlist is None:
            os.environ.pop("CUSTOMER_TEST_EMAIL_ALLOWLIST", None)
        else:
            os.environ["CUSTOMER_TEST_EMAIL_ALLOWLIST"] = self.previous_allowlist
        if self.previous_operational_mode is None:
            os.environ.pop("CUSTOMER_OPERATIONAL_TEST_MODE", None)
        else:
            os.environ["CUSTOMER_OPERATIONAL_TEST_MODE"] = self.previous_operational_mode

    def register_login(self, role="customer"):
        email = f"commerce-{uuid.uuid4().hex}@example.invalid"
        before = set(self.outbox.glob("verify-*.txt")) if self.outbox.exists() else set()
        response = self.client.post("/api/customer/auth/register",
                                    json={"email": email, "password": self.password, "displayName": "Synthetic Tester"})
        self.assertEqual(response.status_code, 202, response.text)
        after = set(self.outbox.glob("verify-*.txt")) - before
        self.assertEqual(len(after), 1)
        link = next(iter(after)).read_text(encoding="utf-8").splitlines()[1]
        next(iter(after)).unlink()
        self.assertEqual(urlparse(link).query, "")
        token = parse_qs(urlparse(link).fragment)["token"][0]
        self.assertEqual(self.client.post("/api/customer/auth/verify", json={"token": token}).status_code, 200)
        self.assertEqual(self.client.post("/api/customer/auth/verify", json={"token": token}).status_code, 400)
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("SELECT id FROM customer_users WHERE email=%s", (email,))
                user_id = cur.fetchone()[0]
                if role == "admin":
                    cur.execute("UPDATE customer_users SET role='admin' WHERE id=%s", (user_id,))
        self.users.append(user_id)
        os.environ["CUSTOMER_TEST_EMAIL_ALLOWLIST"] = ",".join(
            filter(None, [os.environ.get("CUSTOMER_TEST_EMAIL_ALLOWLIST", ""), email]))
        login = self.client.post("/api/customer/auth/login", json={"email": email, "password": self.password})
        self.assertEqual(login.status_code, 200, login.text)
        return {"Authorization": "Bearer " + login.json()["token"]}

    def test_operational_stock_shipping_and_concurrent_checkout(self):
        owner = self.register_login()
        admin = {**self.register_login("admin"), "X-Admin-Key": settings.ADMIN_API_KEY}
        self.assertEqual(self.client.get("/api/customer/admin/inventory", headers=owner).status_code, 403)
        self.assertEqual(self.client.get("/api/customer/admin/inventory", headers={
            "Authorization": admin["Authorization"],
        }).status_code, 403)
        os.environ["CUSTOMER_OPERATIONAL_TEST_MODE"] = "1"
        suffix = uuid.uuid4().hex[:12]
        province, city, district = f"Test-{suffix}", "Test City", "Test District"
        self.synthetic_rates.append((province, city, district))
        address = self.client.post("/api/customer/addresses", headers=owner, json={
            "recipientName": "Synthetic Tester", "whatsapp": "6281234567890",
            "province": province, "city": city, "district": district,
            "postalCode": "65111", "fullAddress": "Jl. Testing No. 1", "notes": "",
        }).json()["id"]
        slugs = [f"qa-a-{suffix}", f"qa-b-{suffix}"]
        skus = [f"{slug}:beans:200:200g" for slug in slugs]
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                for slug, sku in zip(slugs, skus):
                    cur.execute("INSERT INTO customer_catalog_prices(sku_id,slug,product_name,variant_label,amount_idr,"
                                "in_stock,category,weight_grams,resource_id) "
                                "VALUES (%s,%s,'QA Beans','200g',80000,TRUE,'beans',200,%s)",
                                (sku, slug, f"bean:{slug}"))
                    cur.execute("INSERT INTO customer_blend_prices(slug,product_name,weight_grams,amount_idr) "
                                "VALUES (%s,'QA Beans',250,100000)", (slug,))
                    self.synthetic_blend_slugs.append(slug)
                    self.synthetic_resources.extend([(sku, f"bean:{slug}"), (sku, f"pack:{sku}")])
                cur.execute("SELECT 1 FROM customer_shipping_origin WHERE id=TRUE")
                self.synthetic_origin_created = cur.fetchone() is None
        self.assertEqual(self.client.get(f"/api/customer/checkout-policy?addressId={address}",
                                         headers=owner).status_code, 409)
        if self.synthetic_origin_created:
            origin = self.client.put("/api/customer/admin/shipping/origin", headers=admin, json={
                "name": "QA Warehouse", "fullAddress": "Jl. Local Testing No. 1",
                "city": "Malang", "province": "Jawa Timur", "postalCode": "65111",
            })
            self.assertEqual(origin.status_code, 200, origin.text)
        self.assertEqual(self.client.get(f"/api/customer/checkout-policy?addressId={address}",
                                         headers=owner).status_code, 409)
        rate = self.client.put("/api/customer/admin/shipping/rate", headers=admin, json={
            "province": province, "city": city, "district": district, "amountIdr": 18000,
            "courierCode": "jne", "serviceName": "REG", "maxWeightGrams": 1000,
            "sourceUrl": "https://www.jne.co.id/shipping-fee",
        })
        self.assertEqual(rate.status_code, 200, rate.text)
        policy = self.client.get(f"/api/customer/checkout-policy?addressId={address}", headers=owner)
        self.assertEqual(policy.status_code, 409)
        java_address = self.client.post("/api/customer/addresses", headers=owner, json={
            "recipientName": "Synthetic Tester", "whatsapp": "6281234567890",
            "province": "DI Yogyakarta", "city": "Yogyakarta", "district": "Gondokusuman",
            "postalCode": "55221", "fullAddress": "Jl. Testing No. 2", "notes": "",
        }).json()["id"]
        java_policy = self.client.get(f"/api/customer/checkout-policy?addressId={java_address}", headers=owner)
        self.assertEqual(java_policy.status_code, 200, java_policy.text)
        self.assertEqual(java_policy.json()["shippingCost"], 0)
        self.assertIn("Gratis ongkir", java_policy.json()["shippingPolicy"])
        for slug in slugs:
            result = self.client.post("/api/customer/admin/inventory/adjust", headers=admin, json={
                "resourceId": f"bean:{slug}", "availableQuantity": 1000,
                "reason": "Synthetic opening balance",
            })
            self.assertEqual(result.status_code, 200, result.text)
        before_pack = {"idempotencyKey": str(uuid.uuid4()), "addressId": java_address,
                       "paymentMethod": "bca_transfer", "items": [{
                           "skuId": skus[0], "quantity": 1, "unitPrice": 80000, "grindLabel": "Whole Beans",
                       }]}
        self.assertEqual(self.client.post("/api/customer/orders", headers=owner, json=before_pack).status_code, 409)
        converted = self.client.post("/api/customer/admin/inventory/pack", headers=admin,
                                     json={"skuId": skus[0], "quantity": 3})
        self.assertEqual(converted.status_code, 200, converted.text)
        self.assertEqual(converted.json()["bulkUsedGrams"], 600)
        weight = self.client.put("/api/customer/admin/shipping/weights", headers=admin,
                                 json={"skuId": skus[0], "packedWeightGrams": 280})
        self.assertEqual(weight.status_code, 200, weight.text)
        self.assertEqual(self.client.post("/api/customer/admin/inventory/pack", headers=admin,
                                          json={"skuId": skus[0], "quantity": 3}).status_code, 409)
        first_quote = self.client.post("/api/customer/checkout-policy", headers=owner,
                                       json={"addressId": java_address, "items": before_pack["items"]}).json()
        before_pack.update({"shippingOptionId": first_quote["shippingOptions"][0]["id"],
                            "shippingQuotedPrice": first_quote["shippingCost"]})
        packed = self.client.post("/api/customer/orders", headers=owner,
                                  json={**before_pack, "idempotencyKey": str(uuid.uuid4())})
        self.assertEqual(packed.status_code, 201, packed.text)
        self.assertEqual(packed.json()["checkoutMode"], "operational")
        self.assertEqual(packed.json()["shippingCost"], 0)
        self.assertEqual(packed.json()["total"], 80000)
        self.assertEqual(self.client.post(f"/api/customer/admin/orders/{packed.json()['id']}/fulfillment",
                                          headers=admin, json={"status": "cancelled"}).status_code, 200)
        self.assertEqual(self.client.put("/api/customer/admin/shipping/weights", headers=admin,
                                         json={"skuId": skus[0], "packedWeightGrams": 150}).status_code, 422)
        self.assertEqual(self.client.put("/api/customer/admin/shipping/rate", headers=admin, json={
            "province": province, "city": city, "district": district, "amountIdr": 25000,
            "courierCode": "jnt", "serviceName": "EZ", "maxWeightGrams": 1000,
            "sourceUrl": "https://jet.co.id/rates",
        }).status_code, 200)
        self.assertEqual(self.client.put("/api/customer/admin/shipping/rate", headers=admin, json={
            "province": province, "city": city, "district": district, "amountIdr": 1,
            "courierCode": "jne", "serviceName": "REG", "maxWeightGrams": 1000,
            "sourceUrl": "https://example.com/rates",
        }).status_code, 422)
        quote = self.client.post("/api/customer/checkout-policy", headers=owner, json={
            "addressId": address, "items": before_pack["items"],
        })
        self.assertEqual(quote.status_code, 200, quote.text)
        self.assertEqual(quote.json()["shippingOptions"][0]["id"], "manual-confirmation")
        self.assertEqual(self.client.post("/api/customer/orders", headers=owner, json={
            **before_pack, "idempotencyKey": str(uuid.uuid4()), "addressId": address,
            "shippingOptionId": "manual-confirmation", "shippingQuotedPrice": 0,
        }).status_code, 409)
        java_order = self.client.post("/api/customer/orders", headers=owner,
                                      json={**before_pack, "idempotencyKey": str(uuid.uuid4()), "addressId": java_address,
                                            "shippingOptionId": "free-java", "shippingQuotedPrice": 0})
        self.assertEqual(java_order.status_code, 201, java_order.text)
        self.assertEqual(java_order.json()["shippingCost"], 0)
        self.assertEqual(java_order.json()["total"], 80000)
        self.assertEqual(self.client.post(f"/api/customer/admin/orders/{java_order.json()['id']}/fulfillment",
                                          headers=admin, json={"status": "cancelled"}).status_code, 200)
        blend = {"idempotencyKey": str(uuid.uuid4()), "addressId": java_address,
                 "paymentMethod": "qris_static", "items": [{
                     "skuId": "byob:byob-1234", "quantity": 1, "unitPrice": 100000,
                     "grindLabel": "Whole Beans", "weightGrams": 250,
                     "blendComponents": [{"slug": slugs[0], "ratio": 50}, {"slug": slugs[1], "ratio": 50}],
                 }]}
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("SELECT 1 FROM customer_shipping_weights WHERE sku_id='byob:250'")
                if cur.fetchone() is None:
                    self.synthetic_weight_keys.append("byob:250")
                    self.assertEqual(self.client.put("/api/customer/admin/shipping/weights", headers=admin,
                                                     json={"skuId": "byob:250", "packedWeightGrams": 330}).status_code, 200)
        blend_quote = self.client.post("/api/customer/checkout-policy", headers=owner,
                                       json={"addressId": java_address, "items": blend["items"]}).json()
        blend.update({"shippingOptionId": blend_quote["shippingOptions"][0]["id"],
                      "shippingQuotedPrice": blend_quote["shippingCost"]})
        blended = self.client.post("/api/customer/orders", headers=owner, json=blend)
        self.assertEqual(blended.status_code, 201, blended.text)
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("UPDATE customer_orders SET expires_at=now()-interval '1 minute' WHERE id=%s",
                            (blended.json()["id"],))
        self.client.get("/api/customer/orders", headers=owner)
        self.assertEqual(self.client.get(f"/api/customer/orders/{blended.json()['id']}",
                                         headers=owner).json()["paymentStatus"], "cancelled")
        self.assertEqual(self.client.post("/api/customer/admin/inventory/adjust", headers=admin, json={
            "resourceId": f"pack:{skus[0]}", "availableQuantity": 1,
            "reason": "Synthetic concurrency balance",
        }).status_code, 200)
        with ThreadPoolExecutor(max_workers=2) as pool:
            statuses = list(pool.map(lambda _: self.client.post("/api/customer/orders", headers=owner,
                json={**before_pack, "idempotencyKey": str(uuid.uuid4())}).status_code, range(2)))
        self.assertEqual(sorted(statuses), [201, 409])
        history = self.client.get("/api/customer/admin/inventory/movements", headers=admin)
        self.assertEqual(history.status_code, 200)
        self.assertTrue(any(row["reason"].startswith("Konversi") for row in history.json()))

    def test_customer_checkout_payment_and_admin_verification(self):
        owner = self.register_login()
        stranger = self.register_login()
        admin = self.register_login("admin")
        address = self.client.post("/api/customer/addresses", headers=owner, json={
            "recipientName": "Synthetic Tester", "whatsapp": "6281234567890",
            "province": "Jawa Timur", "city": "Malang", "district": "Klojen",
            "postalCode": "65111", "fullAddress": "Jl. Testing No. 1",
            "notes": "", "isDefault": True,
        })
        self.assertEqual(address.status_code, 201, address.text)
        address_id = address.json()["id"]
        self.assertEqual(self.client.get("/api/customer/addresses", headers=stranger).json(), [])
        self.assertEqual(self.client.delete(f"/api/customer/addresses/{address_id}", headers=stranger).status_code, 404)
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("SELECT sku_id,amount_idr FROM customer_catalog_prices WHERE in_stock ORDER BY sku_id LIMIT 1")
                sku, price = cur.fetchone()
        payload = {
            "idempotencyKey": str(uuid.uuid4()), "addressId": address_id,
            "items": [{"skuId": sku, "quantity": 1, "unitPrice": price, "grindLabel": "Whole Beans"}],
            "paymentMethod": "bca_transfer",
        }
        tampered = {**payload, "idempotencyKey": str(uuid.uuid4()),
                    "items": [{**payload["items"][0], "unitPrice": 1}]}
        self.assertEqual(self.client.post("/api/customer/orders", headers=owner, json=tampered).status_code, 409)
        created = self.client.post("/api/customer/orders", headers=owner, json=payload)
        self.assertEqual(created.status_code, 201, created.text)
        self.assertEqual(created.json()["checkoutMode"], "testing")
        order_id = created.json()["id"]
        self.assertEqual(created.json()["paymentStatus"], "pending")
        self.assertEqual(created.json()["total"], price)
        self.assertEqual(self.client.post("/api/customer/orders", headers=owner, json=payload).json()["id"], order_id)
        self.assertEqual(self.client.get(f"/api/customer/orders/{order_id}", headers=stranger).status_code, 404)
        self.assertEqual(self.client.get("/api/customer/admin/orders", headers=owner).status_code, 403)
        image = io.BytesIO()
        Image.new("RGB", (8, 8), "white").save(image, format="PNG")
        proof = image.getvalue()
        self.assertEqual(self.client.post(f"/api/customer/orders/{order_id}/proof", headers=owner,
                                          files={"file": ("bad.pdf", b"not a PDF", "application/pdf")}).status_code, 422)
        self.assertEqual(self.client.post(f"/api/customer/orders/{order_id}/proof", headers=owner,
                                          files={"file": ("bad.png", proof[:-12] + b"bad checksum!!", "image/png")}).status_code, 422)
        self.assertEqual(self.client.post(f"/api/customer/orders/{order_id}/proof", headers=stranger,
                                          files={"file": ("proof.png", proof, "image/png")}).status_code, 404)
        uploaded = self.client.post(f"/api/customer/orders/{order_id}/proof", headers=owner,
                                    files={"file": ("proof.png", proof, "image/png")})
        self.assertEqual(uploaded.status_code, 201, uploaded.text)
        self.assertEqual(self.client.get(f"/api/customer/orders/{order_id}", headers=owner).json()["paymentStatus"],
                         "awaiting_verification")
        self.assertEqual(self.client.get(f"/api/customer/orders/{order_id}/proof-file", headers=stranger).status_code, 404)
        self.assertEqual(self.client.post(f"/api/customer/admin/orders/{order_id}/payment", headers=owner,
                                          json={"action": "approve", "receiptConfirmed": True}).status_code, 403)
        admin_headers = {**admin, "X-Admin-Key": settings.ADMIN_API_KEY}
        self.assertEqual(self.client.post(f"/api/customer/admin/orders/{order_id}/payment", headers=admin_headers,
                                          json={"action": "approve", "receiptConfirmed": False}).status_code, 422)
        rejected = self.client.post(f"/api/customer/admin/orders/{order_id}/payment", headers=admin_headers,
                                    json={"action": "reject", "reason": "Bukti tidak cocok"})
        self.assertEqual(rejected.status_code, 200, rejected.text)
        self.assertEqual(rejected.json()["paymentStatus"], "rejected")
        pdf = io.BytesIO()
        writer = PdfWriter()
        writer.add_blank_page(width=72, height=72)
        writer.write(pdf)
        self.assertEqual(self.client.post(f"/api/customer/orders/{order_id}/proof", headers=owner,
                                          files={"file": ("proof.pdf", pdf.getvalue(), "application/pdf")}).status_code, 201)
        approved = self.client.post(f"/api/customer/admin/orders/{order_id}/payment", headers=admin_headers,
                                    json={"action": "approve", "receiptConfirmed": True})
        self.assertEqual(approved.status_code, 200, approved.text)
        self.assertEqual(approved.json()["paymentStatus"], "paid")
        self.assertEqual(self.client.post(f"/api/customer/admin/orders/{order_id}/fulfillment", headers=admin_headers,
                                          json={"status": "cancelled"}).status_code, 409)
        cancel_payload = {**payload, "idempotencyKey": str(uuid.uuid4())}
        cancelled_id = self.client.post("/api/customer/orders", headers=owner, json=cancel_payload).json()["id"]
        cancelled = self.client.post(f"/api/customer/admin/orders/{cancelled_id}/fulfillment", headers=admin_headers,
                                     json={"status": "cancelled"})
        self.assertEqual(cancelled.status_code, 200)
        self.assertEqual(cancelled.json()["paymentStatus"], "cancelled")
        summary = self.client.get("/api/customer/admin/payment-summary", headers=admin_headers)
        self.assertEqual(summary.status_code, 200)
        self.assertGreaterEqual(summary.json()["paidTotal"], approved.json()["total"])
        self.assertEqual(self.client.post(f"/api/customer/admin/orders/{order_id}/payment", headers=admin_headers,
                                          json={"action": "approve", "receiptConfirmed": True}).status_code, 409)
        processed = self.client.post(f"/api/customer/admin/orders/{order_id}/fulfillment", headers=admin_headers,
                                     json={"status": "processing"})
        self.assertEqual(processed.status_code, 200)
        self.assertEqual(self.client.get(f"/api/customer/orders/{order_id}", headers=owner).json()["fulfillmentStatus"],
                         "processing")
        history = self.client.get("/api/customer/payments", headers=owner).json()
        self.assertEqual(next(item for item in history if item["orderId"] == order_id)["status"], "paid")
        self.assertEqual(next(item for item in history if item["orderId"] == cancelled_id)["status"], "cancelled")
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("SELECT count(*) FROM customer_order_status_history WHERE order_id=%s", (order_id,))
                self.assertGreaterEqual(cur.fetchone()[0], 5)
        self.assertEqual(self.client.delete(f"/api/customer/addresses/{address_id}", headers=owner).status_code, 200)
        self.assertEqual(self.client.get("/api/customer/addresses", headers=owner).json(), [])

    def test_accessory_blend_stock_and_expiry(self):
        owner = self.register_login()
        address = self.client.post("/api/customer/addresses", headers=owner, json={
            "recipientName": "Synthetic Tester", "whatsapp": "6281234567890",
            "province": "Jawa Timur", "city": "Malang", "district": "Klojen",
            "postalCode": "65111", "fullAddress": "Jl. Testing No. 1", "notes": "",
        }).json()["id"]
        suffix = uuid.uuid4().hex
        sku, resource = f"addon-test-{suffix}", f"accessory:test-{suffix}"
        self.synthetic_resources.append((sku, resource))
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("INSERT INTO customer_inventory(resource_id,unit,available_quantity) VALUES (%s,'unit',1)", (resource,))
                cur.execute("INSERT INTO customer_catalog_prices(sku_id,slug,product_name,variant_label,amount_idr,"
                            "in_stock,category,weight_grams,resource_id) VALUES (%s,'brewing-accessories','Test Accessory',"
                            "'1 Unit',42000,true,'accessory',0,%s)", (sku, resource))
        payload = {"idempotencyKey": str(uuid.uuid4()), "addressId": address,
                   "paymentMethod": "bca_transfer", "items": [{"skuId": sku, "quantity": 1,
                   "unitPrice": 42000, "grindLabel": "Aksesoris Seduh"}]}
        first = self.client.post("/api/customer/orders", headers=owner, json=payload)
        self.assertEqual(first.status_code, 201, first.text)
        self.assertEqual(self.client.post("/api/customer/orders", headers=owner,
                                          json={**payload, "idempotencyKey": str(uuid.uuid4())}).status_code, 409)
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("UPDATE customer_orders SET expires_at=now()-interval '1 minute' WHERE id=%s", (first.json()["id"],))
        self.assertEqual(self.client.get("/api/customer/orders", headers=owner).status_code, 200)
        self.assertEqual(self.client.get(f"/api/customer/orders/{first.json()['id']}", headers=owner).json()["paymentStatus"], "cancelled")
        replacement = self.client.post("/api/customer/orders", headers=owner,
                                       json={**payload, "idempotencyKey": str(uuid.uuid4())})
        self.assertEqual(replacement.status_code, 201, replacement.text)
        self.assertEqual(self.client.post("/api/customer/orders", headers=owner,
                                          json={**payload, "idempotencyKey": str(uuid.uuid4()),
                                                "items": [{**payload["items"][0], "unitPrice": 1}]}).status_code, 409)
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("UPDATE customer_orders SET expires_at=now()-interval '1 minute' WHERE id=%s", (replacement.json()["id"],))
        self.client.get("/api/customer/orders", headers=owner)
        with ThreadPoolExecutor(max_workers=2) as pool:
            statuses = list(pool.map(lambda _: self.client.post("/api/customer/orders", headers=owner,
                json={**payload, "idempotencyKey": str(uuid.uuid4())}).status_code, range(2)))
        self.assertEqual(sorted(statuses), [201, 409])
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("SELECT slug,weight_grams,amount_idr FROM customer_blend_prices "
                            "WHERE weight_grams=250 ORDER BY slug LIMIT 2")
                a, b = cur.fetchall()
        expected = floor((a[2] * 70 + b[2] * 30) / 100000 + 0.5) * 1000
        blend = self.client.post("/api/customer/orders", headers=owner, json={
            "idempotencyKey": str(uuid.uuid4()), "addressId": address, "paymentMethod": "qris_static",
            "items": [{"skuId": f"byob:byob-{uuid.uuid4().int % 100000000}", "quantity": 1,
                       "unitPrice": expected, "grindLabel": "Biji utuh (Dark Espresso Roast)", "weightGrams": 250,
                       "blendComponents": [{"slug": a[0], "ratio": 70}, {"slug": b[0], "ratio": 30}]}],
        })
        self.assertEqual(blend.status_code, 201, blend.text)
        self.assertEqual(blend.json()["items"][0]["unitPrice"], expected)
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db:
            with db.cursor() as cur:
                cur.execute("SELECT amount_idr FROM customer_catalog_prices WHERE sku_id='addon-v60-paper'")
                accessory_price = cur.fetchone()[0]
        accessory = self.client.post("/api/customer/orders", headers=owner, json={
            "idempotencyKey": str(uuid.uuid4()), "addressId": address, "paymentMethod": "bca_transfer",
            "items": [{"skuId": "addon-v60-paper", "quantity": 1, "unitPrice": accessory_price,
                       "grindLabel": "Aksesoris Seduh"}],
        })
        self.assertEqual(accessory.status_code, 201, accessory.text)

    def test_password_reset_logout_and_generic_registration(self):
        owner = self.register_login()
        person = self.client.get("/api/customer/auth/me", headers=owner).json()
        email = person["email"]
        duplicate = self.client.post("/api/customer/auth/register", json={
            "email": email, "password": self.password, "displayName": "Synthetic Tester",
        })
        self.assertEqual(duplicate.status_code, 202)
        self.assertEqual(self.client.post("/api/customer/auth/resend", json={"email": email}).status_code, 202)
        self.assertEqual(self.client.post("/api/customer/auth/resend", json={"email": f"unknown-{uuid.uuid4().hex}@example.invalid"}).status_code, 202)
        before = set(self.outbox.glob("reset-*.txt"))
        forgot = self.client.post("/api/customer/auth/forgot", json={"email": email})
        self.assertEqual(forgot.status_code, 202)
        after = set(self.outbox.glob("reset-*.txt")) - before
        self.assertEqual(len(after), 1)
        link = next(iter(after)).read_text(encoding="utf-8").splitlines()[1]
        next(iter(after)).unlink()
        self.assertEqual(urlparse(link).query, "")
        token = parse_qs(urlparse(link).fragment)["token"][0]
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as db, db.cursor() as cur:
            cur.execute("UPDATE customer_auth_tokens SET expires_at=now()-interval '1 second' WHERE token_hash=%s",
                        (hashlib.sha256(token.encode()).hexdigest(),))
        self.assertEqual(self.client.post("/api/customer/auth/reset", json={"token": token, "password": self.password}).status_code, 400)
        before = set(self.outbox.glob("reset-*.txt"))
        self.assertEqual(self.client.post("/api/customer/auth/forgot", json={"email": email}).status_code, 202)
        after = set(self.outbox.glob("reset-*.txt")) - before
        self.assertEqual(len(after), 1)
        link = next(iter(after)).read_text(encoding="utf-8").splitlines()[1]
        next(iter(after)).unlink()
        token = parse_qs(urlparse(link).fragment)["token"][0]
        new_password = secrets.token_urlsafe(24)
        changed = self.client.post("/api/customer/auth/reset", json={"token": token, "password": new_password})
        self.assertEqual(changed.status_code, 200)
        self.assertEqual(self.client.post("/api/customer/auth/reset", json={"token": token, "password": self.password}).status_code, 400)
        self.assertEqual(self.client.get("/api/customer/auth/me", headers=owner).status_code, 401)
        self.assertEqual(self.client.post("/api/customer/auth/login", json={"email": email, "password": self.password}).status_code, 401)
        login = self.client.post("/api/customer/auth/login", json={"email": email, "password": new_password})
        self.assertEqual(login.status_code, 200)
        refreshed = {"Authorization": "Bearer " + login.json()["token"]}
        self.assertEqual(self.client.post("/api/customer/auth/logout", headers=refreshed).status_code, 200)
        self.assertEqual(self.client.get("/api/customer/auth/me", headers=refreshed).status_code, 401)

    def test_google_exchange_account_link_and_safe_failure(self):
        owner = self.register_login()
        person = self.client.get("/api/customer/auth/me", headers=owner).json()
        nonce = "synthetic-nonce-for-local-test"
        payload = {"code": "synthetic-code", "codeVerifier": "x" * 43,
                   "redirectUri": "http://localhost:3000/api/customer/google/callback", "nonce": nonce}

        class Claims(dict):
            def validate(self, leeway=0):
                return None

        claims = Claims(aud="synthetic-client", iss="https://accounts.google.com", nonce=nonce,
                        email_verified=True, sub="synthetic-google-" + uuid.uuid4().hex, email=person["email"])
        with patch.dict(os.environ, {"CUSTOMER_GOOGLE_CLIENT_ID": "synthetic-client",
                                      "CUSTOMER_GOOGLE_CLIENT_SECRET": "synthetic-secret",
                                      "CUSTOMER_GOOGLE_REDIRECT_URI": payload["redirectUri"]}), \
                patch("app.customer_auth.httpx.Client") as client_type, \
                patch("app.customer_auth.jwt.decode", return_value=claims):
            provider = client_type.return_value.__enter__.return_value
            provider.post.return_value.is_success = False
            provider.post.return_value.status_code = 400
            provider.post.return_value.json.return_value = {"error": "invalid_grant"}
            with self.assertLogs("customer.oauth", level="WARNING") as logged:
                denied = self.client.post("/api/customer/auth/google", json=payload)
            self.assertEqual(denied.status_code, 401)
            self.assertEqual(denied.headers["X-Customer-OAuth-Reason"], "invalid_grant")
            self.assertNotIn(payload["code"], " ".join(logged.output))
            provider.post.return_value.is_success = True
            provider.post.return_value.json.return_value = {"id_token": "synthetic-id-token"}
            provider.get.return_value.is_success = True
            provider.get.return_value.json.return_value = {}
            self.assertEqual(self.client.post("/api/customer/auth/google", json=payload).status_code, 409)
            linked = self.client.post("/api/customer/auth/google", headers=owner, json={**payload, "link": True})
            self.assertEqual(linked.status_code, 200, linked.text)
            login = self.client.post("/api/customer/auth/google", json=payload)
            self.assertEqual(login.status_code, 200, login.text)
            google_session = {"Authorization": "Bearer " + login.json()["token"]}
            self.assertEqual(self.client.get("/api/customer/auth/me", headers=google_session).json()["id"], person["id"])
