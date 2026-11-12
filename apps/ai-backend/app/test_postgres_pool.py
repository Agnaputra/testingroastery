import unittest
from contextlib import ExitStack
from unittest.mock import patch
from urllib.parse import urlparse

from fastapi import HTTPException
from sqlalchemy import create_pool_from_url
from sqlalchemy.engine import make_url

from app.config import settings
from app import postgres_pool
from app.catalog_management import public_catalog_snapshot


class PostgresPoolTest(unittest.TestCase):
    def setUp(self):
        if urlparse(settings.DATABASE_URL).hostname not in {'localhost', '127.0.0.1'}:
            self.skipTest('Pool integration tests require localhost')
        self.pool = create_pool_from_url(make_url(settings.DATABASE_URL).set(drivername='postgresql+psycopg2'), pool_size=2, max_overflow=0, pool_timeout=0.1, pool_pre_ping=True)
        self.patch = patch.object(postgres_pool, 'pool', self.pool)
        self.patch.start()

    def tearDown(self):
        if hasattr(self, 'pool'):
            self.patch.stop()
            self.pool.dispose()

    def test_reuses_connection_and_resets_cursor_and_session(self):
        with postgres_pool.connection() as db, db.cursor() as cur:
            first_pid = db.get_backend_pid()
            cur.execute('SELECT 7 AS value')
            self.assertEqual(cur.fetchone()['value'], 7)
            db.commit()
            db.set_session(readonly=True, isolation_level='REPEATABLE READ')
        with postgres_pool.connection(cursor_factory=None) as db, db.cursor() as cur:
            self.assertEqual(db.get_backend_pid(), first_pid)
            self.assertFalse(db.readonly)
            cur.execute('SELECT 8')
            self.assertEqual(cur.fetchone()[0], 8)
        self.assertEqual(self.pool.checkedout(), 0)

    def test_rolls_back_failed_transaction_without_losing_connection(self):
        with postgres_pool.connection() as db, db.cursor() as cur:
            cur.execute('CREATE TEMP TABLE pool_rollback_test (value integer)')
        with self.assertRaisesRegex(ValueError, 'stop'):
            with postgres_pool.connection() as db, db.cursor() as cur:
                cur.execute('INSERT INTO pool_rollback_test VALUES (1)')
                raise ValueError('stop')
        with postgres_pool.connection() as db, db.cursor() as cur:
            cur.execute('SELECT count(*) AS count FROM pool_rollback_test')
            self.assertEqual(cur.fetchone()['count'], 0)
            cur.execute('DROP TABLE pool_rollback_test')
        self.assertEqual(self.pool.checkedout(), 0)

    def test_closed_connection_is_replaced(self):
        with postgres_pool.connection() as db:
            old_pid = db.get_backend_pid()
        db.close()
        with postgres_pool.connection() as db:
            self.assertNotEqual(db.get_backend_pid(), old_pid)

    def test_pool_capacity_is_bounded_and_exhaustion_returns_503(self):
        with ExitStack() as stack:
            for _ in range(2):
                stack.enter_context(postgres_pool.connection())
            with self.assertRaises(HTTPException) as error:
                with postgres_pool.connection():
                    self.fail('Pool must not exceed its configured limit')
            self.assertEqual(error.exception.status_code, 503)
            self.assertEqual(self.pool.checkedout(), 2)
        self.assertEqual(self.pool.checkedout(), 0)

    def test_catalog_uses_one_connection_and_remains_fresh(self):
        with patch.object(self.pool, 'connect', wraps=self.pool.connect) as checkout:
            first = public_catalog_snapshot()
            self.assertEqual(checkout.call_count, 1)
            self.assertIn('overrides', first)
            self.assertIn('managedProducts', first)
        with patch('app.catalog_management.get_publication_overrides', return_value={'fresh-value': False}):
            self.assertFalse(public_catalog_snapshot()['overrides']['fresh-value'])
        self.assertEqual(self.pool.checkedout(), 0)


if __name__ == '__main__':
    unittest.main()
