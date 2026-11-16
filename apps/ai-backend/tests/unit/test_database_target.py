import unittest
from unittest.mock import patch

from app.core.config import settings
from tests.integration.database_target import isolated_database_enabled


class DatabaseTargetTest(unittest.TestCase):
    def test_exact_isolated_target_needs_test_environment_and_opt_in(self):
        with patch.object(settings, "DATABASE_URL", "postgresql://qa:qa@127.0.0.1:55433/coffee_backend_refactor_it"):
            for environment, flag, expected in [("test", "1", True), ("test", "0", False), ("production", "1", False)]:
                with self.subTest(environment=environment, flag=flag), patch.object(settings, "ENVIRONMENT", environment), patch.dict("os.environ", {"BACKEND_DATABASE_IT": flag}):
                    self.assertEqual(isolated_database_enabled(), expected)

    def test_research_and_remote_targets_are_rejected(self):
        with patch.object(settings, "ENVIRONMENT", "test"), patch.dict("os.environ", {"BACKEND_DATABASE_IT": "1"}):
            for url in [
                "postgresql://qa:qa@127.0.0.1:5432/testingroastery",
                "postgresql://qa:qa@127.0.0.1:55433/testingroastery",
                "postgresql://qa:qa@127.0.0.1:5432/coffee_backend_refactor_it",
                "postgresql://qa:qa@remote.invalid:55433/coffee_backend_refactor_it",
            ]:
                with self.subTest(url=url), patch.object(settings, "DATABASE_URL", url):
                    self.assertFalse(isolated_database_enabled())

    def test_malformed_port_is_rejected(self):
        with patch.object(settings, "ENVIRONMENT", "test"), patch.dict("os.environ", {"BACKEND_DATABASE_IT": "1"}), patch.object(settings, "DATABASE_URL", "postgresql://localhost:invalid/coffee_backend_refactor_it"):
            self.assertFalse(isolated_database_enabled())
