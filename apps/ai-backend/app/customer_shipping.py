"""Measured package weights used with admin-verified official courier rates."""
from fastapi import HTTPException


def packed_items(cur, requested, priced):
    keys = [f"byob:{item.weightGrams}" if item.skuId.startswith("byob:") else item.skuId
            for item in requested]
    cur.execute("SELECT sku_id,packed_weight_grams FROM customer_shipping_weights WHERE sku_id=ANY(%s)", (keys,))
    weights = {row["sku_id"]: row["packed_weight_grams"] for row in cur.fetchall()}
    if any(key not in weights for key in keys):
        raise HTTPException(409, "Berat paket belum diverifikasi admin untuk semua produk di keranjang.")
    return [{"name": line["product_name"], "value": line["amount_idr"],
             "weight": weights[key], "quantity": line["quantity"]}
            for key, line in zip(keys, priced)]
