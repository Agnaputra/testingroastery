import os
import unittest
from unittest.mock import patch

from .config import Settings, _cors_origins


class CorsConfigurationTest(unittest.TestCase):
    def test_default_origins_are_explicit_and_never_wildcard(self) -> None:
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("CORS_ORIGINS", None)
            origins = _cors_origins()

        self.assertIn("https://52coffee-roastery.vercel.app", origins)
        self.assertNotIn("*", origins)

    def test_configured_origins_are_trimmed(self) -> None:
        with patch.dict(os.environ, {"CORS_ORIGINS": "https://52coffee.id/, https://example.test "}):
            self.assertEqual(
                _cors_origins(),
                ["https://52coffee.id", "https://example.test"],
            )

    def test_settings_accepts_comma_separated_cors_environment_value(self) -> None:
        with patch.dict(os.environ, {"CORS_ORIGINS": "https://52coffee.id,https://example.test"}):
            self.assertEqual(
                Settings().CORS_ORIGINS,
                ["https://52coffee.id", "https://example.test"],
            )


if __name__ == "__main__":
    unittest.main()
