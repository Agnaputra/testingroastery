import unittest
from unittest.mock import patch

from fastapi import HTTPException
from app.api.routers import public_api
from app.main import app


class PublicApiTest(unittest.TestCase):
    def test_openapi_keeps_baseline_schema_names_and_references(self):
        schema = app.openapi()
        definitions = schema["components"]["schemas"]
        for name in ["app__customer_auth__Credentials", "app__customer_account__ProfileInput", "app__events__Credentials", "app__events__ProfileInput"]:
            self.assertIn(name, definitions)
        for path, method, name in [
            ("/api/customer/auth/login", "post", "app__customer_auth__Credentials"),
            ("/api/customer/profile", "put", "app__customer_account__ProfileInput"),
            ("/api/events/auth/login", "post", "app__events__Credentials"),
            ("/api/events/profile/me", "put", "app__events__ProfileInput"),
        ]:
            self.assertEqual(schema["paths"][path][method]["requestBody"]["content"]["application/json"]["schema"]["$ref"], f"#/components/schemas/{name}")
        self.assertFalse(any(name.startswith("app__api__routers__") for name in definitions))

    def test_openapi_retains_fastapi_cache(self):
        self.assertIs(app.openapi(), app.openapi())

    def test_authority_combines_price_and_public_catalog(self):
        with (
            patch.object(public_api, "get_price_snapshot", return_value={"revision": 7}),
            patch.object(public_api, "public_overlay", return_value={"managedProducts": []}),
        ):
            self.assertEqual(public_api.get_catalog_authority(), {"revision": 7, "managedProducts": []})

    def test_price_admin_rejects_missing_credentials_before_reading_prices(self):
        with (
            patch.object(public_api.settings, "ADMIN_API_KEY", "fixture-key"),
            patch.object(public_api, "get_price_snapshot") as snapshot,
        ):
            with self.assertRaises(HTTPException) as error:
                public_api.get_catalog_prices_admin("")
            self.assertEqual(error.exception.status_code, 401)
            snapshot.assert_not_called()

    def test_checkout_confirmation_validates_payload_before_service_call(self):
        with patch.object(public_api, "confirm_quote") as confirm:
            with self.assertRaises(HTTPException) as error:
                public_api.confirm_demo_checkout({"quoteId": "fixture", "total": 1})
            self.assertEqual(error.exception.status_code, 422)
            confirm.assert_not_called()
