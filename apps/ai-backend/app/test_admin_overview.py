"""Overview aggregation against temporary tables; never modifies application rows."""
import unittest
from contextlib import nullcontext
from unittest.mock import patch
from urllib.parse import urlparse

import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import HTTPException

from app.config import settings
from app.customer_payments import admin_overview


class AdminOverviewTest(unittest.TestCase):
    def test_totals_use_all_rows_and_exclude_test_unpaid_and_cancelled_revenue(self):
        if urlparse(settings.DATABASE_URL).hostname not in {'localhost', '127.0.0.1'}:
            self.skipTest('Temporary-table test requires localhost')
        with psycopg2.connect(settings.DATABASE_URL, cursor_factory=RealDictCursor) as db:
            with db.cursor() as cur:
                cur.execute("CREATE TEMP TABLE customer_orders (id text,created_at timestamptz DEFAULT now(),payment_status text,fulfillment_status text,expires_at timestamptz DEFAULT now()+interval '1 day',shipping_snapshot jsonb,total integer,subtotal integer,discount integer) ON COMMIT DROP")
                cur.execute("CREATE TEMP TABLE customer_order_items (order_id text,sku_id text,product_name text,variant_label text,quantity integer,line_total integer) ON COMMIT DROP")
                for status in ['pending', 'roasting', 'shipped', 'completed']:
                    cur.execute("INSERT INTO customer_orders(id,payment_status,fulfillment_status,shipping_snapshot,total,subtotal,discount) VALUES (%s,'paid',%s,'{\"checkoutMode\":\"operational\"}',200,190,10)", (status, status))
                    cur.execute("INSERT INTO customer_order_items VALUES (%s,'beans:100','Beans','100g',2,190)", (status,))
                cur.execute("INSERT INTO customer_orders(id,payment_status,fulfillment_status,shipping_snapshot,total,subtotal,discount) VALUES ('cancelled','paid','cancelled','{\"checkoutMode\":\"operational\"}',999,999,0),('unpaid','pending','pending','{\"checkoutMode\":\"operational\"}',999,999,0),('test','paid','completed','{\"checkoutMode\":\"testing\"}',999,999,0),('unknown','paid','completed','{}',999,999,0)")
                cur.execute("INSERT INTO customer_orders(id,payment_status,fulfillment_status,shipping_snapshot,total,subtotal,discount) SELECT 'old-'||n,'cancelled','cancelled','{}',0,0,0 FROM generate_series(1,205) n")
                cur.execute("INSERT INTO customer_order_items VALUES ('cancelled','excluded','Excluded','100g',900,999),('test','test','Test','100g',900,999)")
            with patch('app.customer_payments.connection', return_value=nullcontext(db)), \
                    patch('app.customer_payments.require_test_commerce'), \
                    patch('app.customer_payments.require_admin'), \
                    patch('app.customer_payments.order_views', return_value=[{'id': str(i)} for i in range(5)]):
                result = admin_overview('', '')
            metrics = result['metrics']
            self.assertEqual(metrics['totalOrdersCount'], 213)
            self.assertEqual(metrics['totalGrossRevenue'], 800)
            self.assertEqual(metrics['productRevenue'], 720)
            self.assertEqual(metrics['paidCount'], 4)
            self.assertEqual(metrics['pendingOrdersCount'], 2)
            self.assertEqual(metrics['roastingCount'], 1)
            self.assertEqual(metrics['waitingPaymentCount'], 1)
            self.assertEqual(metrics['nonOperationalCount'], 207)
            self.assertEqual(len(result['recentOrders']), 5)
            self.assertEqual(len(result['topProducts']), 1)
            self.assertEqual(result['topProducts'][0]['quantity'], 8)
            self.assertEqual(result['topProducts'][0]['grossTotal'], 760)

    def test_admin_authorization_is_required(self):
        with patch('app.customer_payments.require_test_commerce'), \
                patch('app.customer_payments.connection') as connection, \
                patch('app.customer_payments.require_admin', side_effect=HTTPException(403, 'Admin required')):
            with self.assertRaises(HTTPException) as error:
                admin_overview('', '')
            self.assertEqual(error.exception.status_code, 403)
            connection.return_value.__enter__.return_value.cursor.return_value.__enter__.return_value.execute.assert_not_called()


if __name__ == '__main__':
    unittest.main()
