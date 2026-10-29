import os
import unittest
from unittest.mock import patch

from fastapi import HTTPException

from app.config import settings
from app.customer_orders import require_test_commerce, require_tester


class CustomerCommerceModeTest(unittest.TestCase):
    def test_production_operational_mode_uses_nonlocal_database(self):
        old_environment, old_database = settings.ENVIRONMENT, settings.DATABASE_URL
        try:
            settings.ENVIRONMENT = "production"
            settings.DATABASE_URL = "postgresql://example.invalid/coffee"
            with patch.dict(os.environ, {"CUSTOMER_COMMERCE_MODE": "operational"}, clear=False):
                require_test_commerce()
                require_tester({"email": "customer@example.com"})
        finally:
            settings.ENVIRONMENT, settings.DATABASE_URL = old_environment, old_database

    def test_production_without_operational_mode_is_rejected(self):
        old_environment, old_database = settings.ENVIRONMENT, settings.DATABASE_URL
        try:
            settings.ENVIRONMENT = "production"
            settings.DATABASE_URL = "postgresql://example.invalid/coffee"
            with patch.dict(os.environ, {
                "CUSTOMER_COMMERCE_MODE": "disabled",
                "CUSTOMER_OPERATIONAL_TEST_MODE": "0",
                "CUSTOMER_COMMERCE_TEST_MODE": "0",
            }, clear=False):
                with self.assertRaises(HTTPException) as raised:
                    require_test_commerce()
                self.assertEqual(raised.exception.status_code, 503)
        finally:
            settings.ENVIRONMENT, settings.DATABASE_URL = old_environment, old_database

    def test_verified_local_customer_does_not_need_allowlist(self):
        with patch.dict(os.environ, {
            "CUSTOMER_COMMERCE_MODE": "disabled",
            "CUSTOMER_OPERATIONAL_TEST_MODE": "0",
            "CUSTOMER_TEST_EMAIL_ALLOWLIST": "",
        }, clear=False):
            require_tester({"email": "verified@example.com", "email_verified_at": "verified"})


if __name__ == "__main__":
    unittest.main()
