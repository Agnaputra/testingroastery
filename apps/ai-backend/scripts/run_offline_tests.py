"""Run fixture-only regression tests without database or external network access."""
import os
import socket
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import psycopg2

BACKEND = Path(__file__).resolve().parents[1]


def block_database(*args, **kwargs):
    raise psycopg2.OperationalError("Database access blocked by offline test runner")


original_connect = socket.socket.connect


def loopback_only(sock, address):
    # Windows asyncio uses a loopback socket pair internally.
    if isinstance(address, tuple) and address[0] not in {"localhost", "127.0.0.1", "::1"}:
        raise OSError("External network blocked by offline test runner")
    return original_connect(sock, address)


if __name__ == "__main__":
    os.chdir(BACKEND)
    sys.path.insert(0, str(BACKEND))
    os.environ.update(
        DATABASE_URL="postgresql://qa:qa@127.0.0.1:9/offline",
        ENVIRONMENT="test",
        OPENAI_API_KEY="offline-fixture-not-a-key",
        ENABLE_GUARDRAILS="false",
        EVALUATION_TRACE_ENABLED="false",
        BACKEND_DATABASE_IT="0",
        PUBLICATION_PRICE_TEST_MODE="0",
        CUSTOMER_COMMERCE_IT="0",
        PUBLICATION_IT_3B4="0",
        PUBLICATION_PRICE_IT_3B4="0",
    )
    with (
        patch.object(psycopg2, "connect", block_database),
        patch.object(socket.socket, "connect", loopback_only),
        patch("app.services.rag.rag_service.get_publication_overrides", return_value={}),
    ):
        loader = unittest.TestLoader()
        suite = unittest.TestSuite([
            loader.discover(str(BACKEND / "tests/unit"), top_level_dir=str(BACKEND)),
            loader.discover(str(BACKEND / "tests/regression"), top_level_dir=str(BACKEND)),
            loader.loadTestsFromNames([
                "tests.integration.test_catalog_concurrency",
                "scripts.test_authorize_gmail",
                "scripts.test_pre_evaluation",
            ]),
        ])
        result = unittest.TextTestRunner(verbosity=2).run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
