"""Test-only effective prices and server-validated demo checkout."""

from __future__ import annotations

import hashlib
import json
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlparse

import psycopg2

from .config import settings
from .publication_service import PUBLICATION_SLUG_GROUPS


class PriceError(Exception):
    def __init__(self, code: str, status: int = 503):
        self.code = code
        self.status = status
        super().__init__(code)


def price_mode_requested() -> bool:
    return os.environ.get("PUBLICATION_PRICE_TEST_MODE") == "1"


def require_price_test_mode() -> None:
    address = urlparse(settings.DATABASE_URL)
    if (
        not price_mode_requested()
        or settings.ENVIRONMENT != "test"
        or address.hostname not in {"127.0.0.1", "localhost"}
        or address.port != 55432
        or address.path != "/coffee_publication_it_3b4"
    ):
        raise PriceError("PRICE_TEST_MODE_UNAVAILABLE")


def _snapshot_hash(prices: dict[str, int]) -> str:
    payload = json.dumps(sorted(prices.items()), separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _load_snapshot(cursor: Any, include_unpublished: bool = False) -> dict[str, Any]:
    cursor.execute("SELECT current_revision FROM catalog_price_state WHERE singleton = TRUE")
    row = cursor.fetchone()
    if not row:
        raise PriceError("PRICE_AUTHORITY_UNAVAILABLE")
    revision = int(row[0])
    cursor.execute("SELECT slug, is_published FROM catalog_publication_overrides")
    overrides = {slug: bool(enabled) for slug, enabled in cursor.fetchall()}
    for group in PUBLICATION_SLUG_GROUPS:
        if any(overrides.get(slug) is False for slug in group):
            overrides.update({slug: False for slug in group})
    cursor.execute("SELECT sku_id, slug, kind, weight_grams, amount_idr FROM catalog_effective_prices ORDER BY sku_id")
    rows = cursor.fetchall()
    if not rows:
        raise PriceError("PRICE_AUTHORITY_UNAVAILABLE")
    all_prices = {sku_id: int(amount) for sku_id, _, _, _, amount in rows}
    cursor.execute("SELECT snapshot_sha256 FROM catalog_price_revisions WHERE revision = %s", (revision,))
    revision_row = cursor.fetchone()
    digest = _snapshot_hash(all_prices)
    if not revision_row or revision_row[0] != digest:
        raise PriceError("PRICE_AUTHORITY_INCONSISTENT")
    public_rows = rows if include_unpublished else [row for row in rows if overrides.get(row[1], True)]
    return {
        "revision": revision,
        "snapshotSha256": digest,
        "effectiveCatalogFingerprint": hashlib.sha256(
            json.dumps({"revision": revision, "prices": digest, "publication": sorted(overrides.items())}, separators=(",", ":")).encode()
        ).hexdigest(),
        "overrides": overrides,
        "prices": {
            sku_id: {"slug": slug, "kind": kind, "weightGrams": weight, "amountIdr": int(amount)}
            for sku_id, slug, kind, weight, amount in public_rows
        },
    }


def get_price_snapshot(include_unpublished: bool = False) -> dict[str, Any]:
    require_price_test_mode()
    try:
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as connection:
            connection.set_session(readonly=True, isolation_level="REPEATABLE READ")
            with connection.cursor() as cursor:
                return _load_snapshot(cursor, include_unpublished)
    except PriceError:
        raise
    except Exception as error:
        raise PriceError("PRICE_AUTHORITY_UNAVAILABLE") from error


def overlay_knowledge_price(product: dict[str, Any], snapshot: dict[str, Any]) -> dict[str, Any]:
    """Copy runtime prices onto retrieved metadata; never mutate the research KB."""
    slug = str(product["slug"])
    active_web_slugs = {entry["slug"] for entry in snapshot["prices"].values()}
    web_slug = slug if slug in active_web_slugs else next(
        (group[0] for group in PUBLICATION_SLUG_GROUPS if group[1] == slug), slug
    )
    prices = {
        sku["weightGrams"]: sku["amountIdr"]
        for sku in snapshot["prices"].values()
        if sku["slug"] == web_slug and sku["kind"] == "beans"
    }
    if not prices:
        raise PriceError("PRICE_AUTHORITY_INCOMPLETE")
    result = dict(product)
    for key in list(result):
        if key.startswith("price_") and key.endswith("g"):
            del result[key]
    for weight, amount in prices.items():
        result[f"price_{weight}g"] = amount
    cup = snapshot["prices"].get(f"{web_slug}:cup:1")
    if cup:
        result["cup_price"] = cup["amountIdr"]
    else:
        result.pop("cup_price", None)
    return result


def update_sku_prices(slug: str, amounts: dict[str, int], expected_revision: int) -> dict[str, Any]:
    require_price_test_mode()
    if not amounts or any(not isinstance(amount, int) or isinstance(amount, bool) or amount <= 0 for amount in amounts.values()):
        raise PriceError("INVALID_SKU_OR_AMOUNT", 422)
    try:
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT current_revision FROM catalog_price_state WHERE singleton = TRUE FOR UPDATE")
                row = cursor.fetchone()
                if not row:
                    raise PriceError("PRICE_AUTHORITY_UNAVAILABLE")
                current_revision = int(row[0])
                if current_revision != expected_revision:
                    raise PriceError("PRICE_CHANGED", 409)
                cursor.execute("SELECT sku_id, amount_idr FROM catalog_effective_prices WHERE slug = %s FOR UPDATE", (slug,))
                current = {sku: int(amount) for sku, amount in cursor.fetchall()}
                if not current or any(sku not in current for sku in amounts):
                    raise PriceError("INVALID_SKU_OR_AMOUNT", 422)
                changed = {sku: amount for sku, amount in amounts.items() if amount != current[sku]}
                if not changed:
                    return {"revision": current_revision, "changed": []}
                cursor.execute("SELECT sku_id, amount_idr FROM catalog_effective_prices")
                all_prices = {sku: int(amount) for sku, amount in cursor.fetchall()}
                all_prices.update(changed)
                next_revision = current_revision + 1
                cursor.execute(
                    "INSERT INTO catalog_price_revisions (revision, source, source_sha256, snapshot_sha256) VALUES (%s,%s,%s,%s)",
                    (next_revision, "admin test edit", _snapshot_hash(changed), _snapshot_hash(all_prices)),
                )
                for sku, amount in changed.items():
                    cursor.execute(
                        "UPDATE catalog_effective_prices SET amount_idr=%s, revision=%s, updated_at=CURRENT_TIMESTAMP WHERE sku_id=%s",
                        (amount, next_revision, sku),
                    )
                    cursor.execute(
                        "INSERT INTO catalog_price_history (revision, sku_id, old_amount_idr, new_amount_idr) VALUES (%s,%s,%s,%s)",
                        (next_revision, sku, current[sku], amount),
                    )
                cursor.execute("UPDATE catalog_price_state SET current_revision=%s WHERE singleton=TRUE", (next_revision,))
        return {"revision": next_revision, "changed": sorted(changed)}
    except PriceError:
        raise
    except Exception as error:
        raise PriceError("PRICE_AUTHORITY_UNAVAILABLE") from error


def _calculate_quote(payload: dict[str, Any], snapshot: dict[str, Any]) -> dict[str, Any]:
    items = payload.get("items")
    if not isinstance(items, list) or not items or len(items) > 30:
        raise PriceError("INVALID_CART", 422)
    lines = []
    for item in items:
        if not isinstance(item, dict) or set(item) != {"skuId", "quantity"}:
            raise PriceError("UNSUPPORTED_CART_ITEM", 422)
        sku_id, quantity = item.get("skuId"), item.get("quantity")
        if not isinstance(sku_id, str) or sku_id not in snapshot["prices"]:
            raise PriceError("PRODUCT_UNPUBLISHED_OR_UNPRICED", 409)
        if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1 or quantity > 99:
            raise PriceError("INVALID_CART", 422)
        price = snapshot["prices"][sku_id]
        lines.append({"skuId": sku_id, "quantity": quantity, "unitPrice": price["amountIdr"], "lineTotal": price["amountIdr"] * quantity})
    subtotal = sum(line["lineTotal"] for line in lines)
    voucher = (payload.get("voucherCode") or "").strip().upper()
    if voucher and voucher not in {"SEDUPRESISI", "52COFFEE"}:
        raise PriceError("INVALID_VOUCHER", 422)
    discount = round(subtotal * 0.1) if voucher else 0
    shipping = payload.get("shippingOption")
    free = subtotal >= 250000
    shipping_prices = {
        "jne-reg": 0 if free else 18000,
        "sicepat-best": 10000 if free else 25000,
        "malang-instant": 0 if free else 15000,
    }
    if shipping not in shipping_prices:
        raise PriceError("INVALID_SHIPPING_OPTION", 422)
    shipping_amount = shipping_prices[shipping]
    return {
        "lines": lines, "subtotal": subtotal, "discount": discount,
        "shipping": shipping_amount, "total": subtotal + shipping_amount - discount,
        "voucherCode": voucher, "shippingOption": shipping,
        "priceRevision": snapshot["revision"],
        "effectiveCatalogFingerprint": snapshot["effectiveCatalogFingerprint"],
    }


def create_quote(payload: dict[str, Any]) -> dict[str, Any]:
    require_price_test_mode()
    if set(payload) != {"items", "shippingOption", "voucherCode"}:
        raise PriceError("INVALID_CART", 422)
    try:
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as connection:
            connection.set_session(isolation_level="REPEATABLE READ")
            with connection.cursor() as cursor:
                snapshot = _load_snapshot(cursor)
                quote = _calculate_quote(payload, snapshot)
                quote_id = str(uuid.uuid4())
                cursor.execute(
                    "INSERT INTO catalog_demo_quotes (id, revision, request_json, quote_json, expires_at) "
                    "VALUES (%s,%s,%s,%s,%s)",
                    (quote_id, snapshot["revision"], json.dumps(payload), json.dumps(quote), datetime.now(timezone.utc) + timedelta(minutes=10)),
                )
                return {"quoteId": quote_id, **quote}
    except PriceError:
        raise
    except Exception as error:
        raise PriceError("PRICE_AUTHORITY_UNAVAILABLE") from error


def confirm_quote(quote_id: str) -> dict[str, Any]:
    require_price_test_mode()
    try:
        parsed_id = uuid.UUID(quote_id)
    except (ValueError, TypeError) as error:
        raise PriceError("INVALID_QUOTE", 422) from error
    try:
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=5) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT current_revision FROM catalog_price_state WHERE singleton=TRUE FOR UPDATE")
                current_row = cursor.fetchone()
                if not current_row:
                    raise PriceError("PRICE_AUTHORITY_UNAVAILABLE")
                cursor.execute(
                    "SELECT revision, request_json, quote_json, expires_at, confirmed_at "
                    "FROM catalog_demo_quotes WHERE id=%s FOR UPDATE", (str(parsed_id),),
                )
                stored = cursor.fetchone()
                if not stored or stored[4] or stored[3] < datetime.now(timezone.utc):
                    raise PriceError("QUOTE_EXPIRED_OR_USED", 409)
                if stored[0] != current_row[0]:
                    raise PriceError("PRICE_CHANGED", 409)
                snapshot = _load_snapshot(cursor)
                request, old_quote = stored[1], stored[2]
                recalculated = _calculate_quote(request, snapshot)
                if recalculated != old_quote:
                    raise PriceError("PRODUCT_UNPUBLISHED_OR_PRICE_CHANGED", 409)
                cursor.execute("UPDATE catalog_demo_quotes SET confirmed_at=CURRENT_TIMESTAMP WHERE id=%s", (str(parsed_id),))
                return {"receiptId": str(parsed_id), "simulation": True, **recalculated}
    except PriceError:
        raise
    except Exception as error:
        raise PriceError("PRICE_AUTHORITY_UNAVAILABLE") from error
