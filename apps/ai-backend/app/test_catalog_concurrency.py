import unittest
from concurrent.futures import ThreadPoolExecutor
from threading import Event
from unittest.mock import patch

from fastapi.testclient import TestClient
from app.main import app


class CatalogConcurrencyTest(unittest.TestCase):
    def test_slow_catalog_does_not_block_unrelated_requests(self):
        entered, release = Event(), Event()

        def slow_catalog():
            entered.set()
            release.wait(timeout=5)
            return {'overrides': {}, 'managedProducts': [], 'unpublishedSlugs': []}

        with patch('app.main.ensure_publication_schema'), \
                patch('app.main.public_catalog_snapshot', side_effect=slow_catalog), \
                TestClient(app) as client, ThreadPoolExecutor(max_workers=2) as executor:
            catalog = executor.submit(client.get, '/api/catalog/publication')
            try:
                self.assertTrue(entered.wait(timeout=2))
                ping = executor.submit(client.get, '/')
                self.assertEqual(ping.result(timeout=2).status_code, 200)
            finally:
                release.set()
            self.assertEqual(catalog.result(timeout=2).status_code, 200)


if __name__ == '__main__':
    unittest.main()
