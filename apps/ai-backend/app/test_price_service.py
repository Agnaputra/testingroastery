"""Offline integration checks, guarded to the isolated price test database."""

import os
import json
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from .config import settings
from .main import app
from .rag_service import PUBLISHED_COFFEE_KNOWLEDGE_BASE, rag_service
from .price_service import get_price_snapshot
from .publication_service import set_publication


@unittest.skipUnless(os.environ.get("PUBLICATION_PRICE_IT_3B4") == "1", "isolated price integration only")
class PriceIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if settings.ENVIRONMENT != "test" or os.environ.get("PUBLICATION_PRICE_TEST_MODE") != "1":
            raise RuntimeError("Price tests require isolated test mode")
        # The service validates the exact host, port and database before every read/write.
        get_price_snapshot()
        settings.ADMIN_API_KEY = "synthetic-price-admin"

    def setUp(self):
        set_publication(["sumbing-supernova-celestia"], True)
        self.sku = "sumbing-supernova-celestia:beans:100"
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()

    def quote_payload(self, **overrides):
        return {
            "items": [{"skuId": self.sku, "quantity": 2}],
            "shippingOption": "jne-reg",
            "voucherCode": "",
            **overrides,
        }

    def test_baseline_authority_and_admin_revision(self):
        authority = self.client.get("/api/catalog/authority")
        self.assertEqual(authority.status_code, 200)
        data = authority.json()
        self.assertEqual(len(data["prices"]), 116)
        self.assertEqual(data["prices"][self.sku]["amountIdr"], 139000)
        self.assertEqual(self.client.get("/api/catalog/prices").status_code, 401)
        updated = self.client.patch(
            "/api/catalog/prices", headers={"X-Admin-Key": settings.ADMIN_API_KEY},
            json={"slug": "sumbing-supernova-celestia", "amounts": {self.sku: 140000}, "expectedRevision": data["revision"]},
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["revision"], data["revision"] + 1)
        after = self.client.get("/api/catalog/authority").json()
        self.assertEqual(after["prices"][self.sku]["amountIdr"], 140000)
        self.assertNotEqual(after["snapshotSha256"], data["snapshotSha256"])
        stale = self.client.patch(
            "/api/catalog/prices", headers={"X-Admin-Key": settings.ADMIN_API_KEY},
            json={"slug": "sumbing-supernova-celestia", "amounts": {self.sku: 141000}, "expectedRevision": data["revision"]},
        )
        self.assertEqual(stale.status_code, 409)
        current = after["revision"]
        self.assertEqual(self.client.patch(
            "/api/catalog/prices", headers={"X-Admin-Key": settings.ADMIN_API_KEY},
            json={"slug": "sumbing-supernova-celestia", "amounts": {self.sku: 139000}, "expectedRevision": current},
        ).status_code, 200)

    def test_quote_confirm_and_client_price_tampering(self):
        malformed = self.client.post("/api/checkout/quote", json={
            **self.quote_payload(), "subtotal": 1,
        })
        self.assertEqual(malformed.status_code, 422)
        quote_response = self.client.post("/api/checkout/quote", json=self.quote_payload())
        self.assertEqual(quote_response.status_code, 200)
        quote = quote_response.json()
        self.assertEqual(quote["subtotal"], 278000)
        self.assertEqual(quote["shipping"], 0)
        confirmed = self.client.post("/api/checkout/confirm", json={"quoteId": quote["quoteId"]})
        self.assertEqual(confirmed.status_code, 200)
        self.assertTrue(confirmed.json()["simulation"])
        self.assertEqual(confirmed.json()["total"], 278000)
        self.assertEqual(self.client.post("/api/checkout/confirm", json={"quoteId": quote["quoteId"]}).status_code, 409)

    def test_price_change_after_quote_rejects_confirm(self):
        before = self.client.get("/api/catalog/authority").json()
        quote = self.client.post("/api/checkout/quote", json=self.quote_payload()).json()
        self.assertEqual(self.client.patch(
            "/api/catalog/prices", headers={"X-Admin-Key": settings.ADMIN_API_KEY},
            json={"slug": "sumbing-supernova-celestia", "amounts": {self.sku: 141000}, "expectedRevision": before["revision"]},
        ).status_code, 200)
        self.assertEqual(self.client.post("/api/checkout/confirm", json={"quoteId": quote["quoteId"]}).status_code, 409)
        current = self.client.get("/api/catalog/authority").json()["revision"]
        self.assertEqual(self.client.patch(
            "/api/catalog/prices", headers={"X-Admin-Key": settings.ADMIN_API_KEY},
            json={"slug": "sumbing-supernova-celestia", "amounts": {self.sku: 139000}, "expectedRevision": current},
        ).status_code, 200)

    def test_unpublish_after_quote_and_unsupported_items(self):
        quote = self.client.post("/api/checkout/quote", json=self.quote_payload()).json()
        set_publication(["sumbing-supernova-celestia"], False)
        self.assertEqual(self.client.post("/api/checkout/confirm", json={"quoteId": quote["quoteId"]}).status_code, 409)
        self.assertEqual(self.client.post("/api/checkout/quote", json=self.quote_payload()).status_code, 409)
        set_publication(["sumbing-supernova-celestia"], True)
        self.assertEqual(self.client.post("/api/checkout/quote", json=self.quote_payload(
            items=[{"skuId": "byob-custom", "quantity": 1}]
        )).status_code, 409)

    def test_voucher_shipping_and_outage(self):
        quote = self.client.post("/api/checkout/quote", json=self.quote_payload(voucherCode="52COFFEE", shippingOption="sicepat-best")).json()
        self.assertEqual(quote["discount"], 27800)
        self.assertEqual(quote["shipping"], 10000)
        self.assertEqual(quote["total"], 260200)
        with patch("app.price_service.psycopg2.connect", side_effect=OSError("offline")):
            # Unexpected network failures must still return a controlled 503.
            self.assertEqual(self.client.get("/api/catalog/authority").status_code, 503)

    def test_chat_generation_payload_uses_effective_price(self):
        stale = dict(next(product for product in PUBLISHED_COFFEE_KNOWLEDGE_BASE if product["slug"] == "sumbing-supernova-celestia"))
        stale["price_100g"] = 1
        captured = {}

        def fake_post(url, **kwargs):
            captured["payload"] = kwargs["json"]
            class Response:
                def raise_for_status(self):
                    return None
                def json(self):
                    reply = {
                        "intent": "catalog_question", "reply": "Sumbing Supernova 100g Rp139.000.",
                        "recommendedProductSlugs": ["sumbing-supernova-celestia"],
                        "needsClarification": False, "clarifyingQuestion": None,
                        "safetyNote": None, "followUpSuggestions": [],
                    }
                    return {"output": [{"content": [{"type": "output_text", "text": json.dumps(reply)}]}]}
            return Response()

        with patch.object(rag_service, "_search_pgvector", return_value=[(stale, 0.95)]), patch.object(rag_service, "openai_api_key", "synthetic-test-only"), patch("app.rag_service.httpx.post", side_effect=fake_post):
            result = rag_service.generate_barista_response("Berapa harga Sumbing Supernova 100g?")
        self.assertIn("payload", captured)
        content = captured["payload"]["input"][-1]["content"]
        self.assertIn("100g - Rp 139.000", content)
        self.assertNotIn("100g Rp 1,", content)
        self.assertEqual(result["responseSource"], "openai")
        authority = self.client.get("/api/catalog/authority").json()
        self.assertEqual(result["priceRevision"], authority["revision"])
        self.assertEqual(result["effectiveCatalogFingerprint"], authority["effectiveCatalogFingerprint"])


if __name__ == "__main__":
    unittest.main()
