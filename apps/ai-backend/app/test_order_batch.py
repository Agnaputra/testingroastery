import unittest
from datetime import datetime, timezone
from unittest.mock import MagicMock
from uuid import uuid4

from fastapi import HTTPException
from app.customer_orders import order_view, order_views


class OrderBatchTest(unittest.TestCase):
    def test_two_queries_for_200_orders_preserve_items_and_customer_scope(self):
        user_id = uuid4()
        orders = [{
            'id': uuid4(), 'created_at': datetime.now(timezone.utc), 'display_name': 'Test',
            'email': 'test@example.invalid', 'shipping_snapshot': {'checkoutMode': 'testing'},
            'subtotal': 100, 'discount': 0, 'shipping_cost': 0, 'total': 100,
            'payment_method': 'bca_transfer', 'payment_status': 'pending',
            'fulfillment_status': 'pending', 'tracking_number': None,
            'rejection_reason': None, 'expires_at': None,
        } for _ in range(200)]
        item = {'order_id': orders[0]['id'], 'sku_id': 'test:100', 'product_name': 'Test beans',
                'variant_label': '100g', 'grind_label': 'Whole', 'quantity': 1,
                'unit_price': 100, 'line_total': 100}
        cur = MagicMock()
        cur.fetchall.side_effect = [orders, [item]]
        result = order_views(cur, user_id=user_id, limit=200)
        self.assertEqual(cur.execute.call_count, 2)
        self.assertIn('o.user_id=%s', cur.execute.call_args_list[0].args[0])
        self.assertEqual(cur.execute.call_args_list[0].args[1], (str(user_id), 200))
        self.assertEqual(len(result), 200)
        self.assertEqual(result[0]['items'][0]['skuId'], 'test:100')
        self.assertEqual(result[-1]['items'], [])
        self.assertEqual(result[0]['paymentStatus'], 'pending')

    def test_single_order_not_found_still_scopes_by_owner_and_returns_404(self):
        cur = MagicMock()
        cur.fetchall.return_value = []
        user_id, order_id = uuid4(), uuid4()
        with self.assertRaises(HTTPException) as error:
            order_view(cur, order_id, user_id)
        self.assertEqual(error.exception.status_code, 404)
        self.assertEqual(cur.execute.call_count, 1)
        self.assertIn('o.user_id=%s', cur.execute.call_args.args[0])
        self.assertEqual(cur.execute.call_args.args[1], (str(user_id), [str(order_id)], 1))


if __name__ == '__main__':
    unittest.main()
