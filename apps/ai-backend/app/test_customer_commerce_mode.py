import os
import unittest
from unittest.mock import MagicMock, patch
from uuid import uuid4

from fastapi import HTTPException

from app.config import settings
from app.customer_orders import require_test_commerce, require_tester
from app.customer_operations import RoleUpdate, update_role


class CustomerCommerceModeTest(unittest.TestCase):
    def test_last_admin_cannot_be_demoted(self):
        cursor = MagicMock()
        cursor.fetchone.side_effect = [{"total": 1}, {"role": "admin"}]
        connection = MagicMock()
        connection.return_value.__enter__.return_value.cursor.return_value.__enter__.return_value = cursor
        with patch("app.customer_operations.connection", connection), \
                patch("app.customer_operations.admin", return_value={"id": "synthetic-admin"}):
            with self.assertRaises(HTTPException) as raised:
                update_role(uuid4(), RoleUpdate(role="customer"), x_admin_key="synthetic-key")
        self.assertEqual(raised.exception.status_code, 400)
        self.assertFalse(any("UPDATE customer_users" in call.args[0] for call in cursor.execute.call_args_list))

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
