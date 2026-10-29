"""Restricted database-backed checkout and owner-scoped order reads."""
import hashlib
import hmac
import json
import os
import re
from collections import Counter
from datetime import datetime, timedelta, timezone
from math import ceil, floor
from urllib.parse import urlparse
from uuid import UUID

from fastapi import APIRouter, Header, HTTPException
from psycopg2.extras import Json
from pydantic import BaseModel, Field

from .config import settings
from .customer_auth import connection, current_user, one
from .customer_shipping import packed_items

router = APIRouter(prefix="/api/customer", tags=["customer"])
PAYMENT_METHODS = {"qris_static", "bca_transfer"}
SHIPPING_POLICY = "Ongkir flat untuk simulasi lokal; tidak termasuk tarif kurir nyata atau janji pengiriman"
OPERATIONAL_SHIPPING_POLICY = "Tarif JNE/J&T yang dicatat admin dari kalkulator resmi; diperiksa ulang sebelum kirim"
MANUAL_SHIPPING_POLICY = "Ongkir luar Jawa dikonfirmasi oleh 52 Coffee sebelum pembayaran. Belum ada pesanan atau tagihan."
FREE_JAVA_SHIPPING_POLICY = "Gratis ongkir tujuan Pulau Jawa; biaya kurir ditanggung 52 Coffee"
JAVA_PROVINCES = {
    "banten", "dki jakarta", "daerah khusus ibukota jakarta", "jakarta",
    "jawa barat", "jawa tengah", "daerah istimewa yogyakarta", "di yogyakarta", "d i yogyakarta",
    "yogyakarta", "jawa timur",
}


def operational_mode():
    return (os.getenv("CUSTOMER_COMMERCE_MODE") == "operational"
            or os.getenv("CUSTOMER_OPERATIONAL_TEST_MODE") == "1")


def require_test_commerce():
    address = urlparse(settings.DATABASE_URL)
    local_database = address.hostname in {"localhost", "127.0.0.1"}
    testing = (os.getenv("CUSTOMER_COMMERCE_TEST_MODE") == "1"
               and settings.ENVIRONMENT in {"development", "test"} and local_database)
    production = operational_mode() and settings.ENVIRONMENT == "production" and not local_database
    if not testing and not production:
        raise HTTPException(503, "Checkout manual belum tersedia.")


def require_tester(user):
    if operational_mode():
        return
    allowed = {email.strip().lower() for email in os.getenv("CUSTOMER_TEST_EMAIL_ALLOWLIST", "").split(",") if email.strip()}
    if user["email"].lower() not in allowed:
        raise HTTPException(403, "Akun belum diizinkan untuk checkout testing.")


def payment_hours() -> int:
    try:
        hours = int(os.getenv("CUSTOMER_TEST_PAYMENT_HOURS", "24"))
    except ValueError:
        raise HTTPException(503, "Batas waktu pembayaran tidak valid.")
    if not 1 <= hours <= 168:
        raise HTTPException(503, "Batas waktu pembayaran tidak valid.")
    return hours


def expire_unpaid(cur):
    cur.execute("SELECT id,payment_status FROM customer_orders WHERE payment_status IN ('pending','rejected') "
                "AND expires_at <= now() FOR UPDATE SKIP LOCKED")
    for order in cur.fetchall():
        release_inventory(cur, order["id"])
        cur.execute("UPDATE customer_orders SET payment_status='cancelled',fulfillment_status='cancelled',updated_at=now() WHERE id=%s", (order["id"],))
        cur.execute("UPDATE customer_payments SET status='cancelled',updated_at=now() WHERE order_id=%s", (order["id"],))
        for field, old in (("payment", order["payment_status"]), ("fulfillment", "pending")):
            cur.execute("INSERT INTO customer_order_status_history(order_id,actor_role,field,old_status,new_status,reason) "
                        "VALUES (%s,'system',%s,%s,'cancelled','Batas waktu pembayaran testing berakhir')",
                        (order["id"], field, old))


def release_inventory(cur, order_id):
    cur.execute("SELECT r.resource_id,r.quantity,i.verified_at FROM customer_order_inventory r "
                "JOIN customer_inventory i ON i.resource_id=r.resource_id "
                "WHERE r.order_id=%s ORDER BY r.resource_id", (str(order_id),))
    for row in cur.fetchall():
        cur.execute("UPDATE customer_inventory SET available_quantity=available_quantity+%s,updated_at=now() "
                    "WHERE resource_id=%s", (row["quantity"], row["resource_id"]))
        if row["verified_at"]:
            cur.execute("INSERT INTO customer_inventory_movements(resource_id,delta,reason,order_id) "
                        "VALUES (%s,%s,'Reservasi order dilepas',%s)",
                        (row["resource_id"], row["quantity"], str(order_id)))
    cur.execute("DELETE FROM customer_order_inventory WHERE order_id=%s", (str(order_id),))


def shipping_cost() -> int:
    try:
        amount = int(os.getenv("CUSTOMER_TEST_SHIPPING_IDR", ""))
    except ValueError:
        raise HTTPException(503, "Ongkir testing belum dikonfigurasi.")
    if not 0 <= amount <= 1_000_000:
        raise HTTPException(503, "Ongkir testing tidak valid.")
    return amount


def shipping_quote(cur, address):
    if is_java_destination(address):
        if operational_mode() and not one(cur, "SELECT 1 FROM customer_shipping_origin WHERE id=TRUE"):
            raise HTTPException(409, "Alamat asal pengiriman belum diverifikasi admin.")
        return 0, FREE_JAVA_SHIPPING_POLICY
    raise HTTPException(409, "Ongkir luar Jawa perlu dikonfirmasi sebelum pembayaran.")


def is_java_destination(address):
    return re.sub(r"[^a-z]+", " ", address["province"].casefold()).strip() in JAVA_PROVINCES


def shipping_options(cur, address, requested, priced):
    if not is_java_destination(address):
        return [{"id": "manual-confirmation", "courier": "JNE/J&T", "service": "Konfirmasi ongkir dahulu",
                 "duration": "", "price": 0}], MANUAL_SHIPPING_POLICY
    amount, policy = shipping_quote(cur, address)
    return [{"id": "free-java" if policy == FREE_JAVA_SHIPPING_POLICY else "manual",
             "courier": "Pengiriman 52 Coffee" if amount == 0 else "Tarif wilayah",
             "service": "Gratis ongkir Pulau Jawa" if policy == FREE_JAVA_SHIPPING_POLICY else "Pengiriman standar",
             "duration": "", "price": amount}], policy


def cup_grams() -> int:
    try:
        grams = int(os.getenv("CUSTOMER_TEST_CUP_GRAMS", ""))
    except ValueError:
        raise HTTPException(503, "Konsumsi kopi per sajian belum dikonfigurasi.")
    if not 5 <= grams <= 50:
        raise HTTPException(503, "Konsumsi kopi per sajian tidak valid.")
    return grams


class BlendComponent(BaseModel):
    slug: str = Field(min_length=2, max_length=120)
    ratio: int = Field(ge=1, le=99)


class LineInput(BaseModel):
    skuId: str = Field(min_length=3, max_length=250)
    quantity: int = Field(ge=1, le=99)
    unitPrice: int = Field(gt=0)
    grindLabel: str = Field(min_length=1, max_length=80)
    weightGrams: int | None = None
    blendComponents: list[BlendComponent] | None = None


def priced_lines(cur, items: list[LineInput]):
    ids = [item.skuId for item in items if not item.skuId.startswith("byob:")]
    cur.execute("SELECT * FROM customer_catalog_prices WHERE sku_id=ANY(%s) FOR SHARE", (ids,))
    prices = {row["sku_id"]: row for row in cur.fetchall()}
    cur.execute("SELECT slug,is_published FROM catalog_publication_overrides")
    overrides = {row["slug"]: row["is_published"] for row in cur.fetchall()}
    cur.execute("SELECT slug FROM catalog_managed_products WHERE deleted_at IS NULL")
    managed_slugs = {row["slug"] for row in cur.fetchall()}
    lines = []
    resources = Counter()
    for item in items:
        if item.skuId.startswith("byob:"):
            components = item.blendComponents or []
            if (not re.fullmatch(r"byob:byob-[0-9]+", item.skuId) or item.weightGrams not in {250, 500, 1000}
                    or not 2 <= len(components) <= 3 or sum(c.ratio for c in components) != 100):
                raise HTTPException(422, "Komposisi racikan tidak valid.")
            slugs = [component.slug for component in components]
            cur.execute("SELECT slug,product_name,amount_idr FROM customer_blend_prices "
                        "WHERE weight_grams=%s AND slug=ANY(%s)", (item.weightGrams, slugs))
            beans = {row["slug"]: row for row in cur.fetchall()}
            if len(beans) != len(set(slugs)) or any(overrides.get(slug) is False for slug in slugs):
                raise HTTPException(409, "Bahan racikan tidak tersedia.")
            amount = floor(sum(beans[c.slug]["amount_idr"] * c.ratio for c in components) / 100000 + 0.5) * 1000
            for component in components:
                resources[f"bean:{component.slug}"] += ceil(item.weightGrams * item.quantity * component.ratio / 100)
            name = "BYOB: " + " + ".join(f"{c.ratio}% {beans[c.slug]['product_name']}" for c in components)
            lines.append({"sku_id": item.skuId, "product_name": name[:250],
                          "variant_label": f"{item.weightGrams}g", "amount_idr": amount,
                          "grind_label": "Biji utuh (Dark Espresso Roast)", "quantity": item.quantity})
        else:
            price = prices.get(item.skuId)
            if not price or not price["in_stock"] or (price["category"] != "accessory" and overrides.get(price["slug"]) is False):
                raise HTTPException(409, "Produk atau varian berubah. Periksa keranjang.")
            if item.blendComponents or item.weightGrams is not None:
                raise HTTPException(422, "Data produk tidak valid.")
            units = item.quantity if price["category"] == "accessory" else item.quantity * (
                cup_grams() if price["category"] == "cup" else price["weight_grams"])
            packaged = price["category"] == "beans" and (operational_mode() or price["slug"] in managed_slugs)
            resource_id = f"pack:{price['sku_id']}" if packaged else price["resource_id"]
            resources[resource_id] += item.quantity if packaged else units
            lines.append({"sku_id": price["sku_id"], "product_name": price["product_name"],
                          "variant_label": price["variant_label"], "amount_idr": price["amount_idr"],
                          "grind_label": item.grindLabel, "quantity": item.quantity})
        if item.unitPrice != lines[-1]["amount_idr"]:
            raise HTTPException(409, "Harga berubah. Muat ulang katalog sebelum checkout.")
    return lines, resources


class CreateOrder(BaseModel):
    idempotencyKey: UUID
    addressId: UUID
    items: list[LineInput] = Field(min_length=1, max_length=30)
    paymentMethod: str
    voucherCode: str = Field(default="", max_length=32)
    shippingOptionId: str | None = Field(default=None, max_length=100)
    shippingQuotedPrice: int | None = Field(default=None, ge=0, le=1_000_000)


class CheckoutQuote(BaseModel):
    addressId: UUID
    items: list[LineInput] = Field(min_length=1, max_length=30)


@router.post("/checkout-policy")
def checkout_quote(payload: CheckoutQuote, authorization: str = Header(default="")):
    require_test_commerce()
    with connection() as db, db.cursor() as cur:
        user = current_user(cur, authorization)
        require_tester(user)
        address = one(cur, "SELECT * FROM customer_addresses WHERE id=%s AND user_id=%s",
                      (str(payload.addressId), user["id"]))
        if not address:
            raise HTTPException(422, "Pilih alamat pengiriman untuk melihat ongkir.")
        lines, _ = priced_lines(cur, payload.items)
        options, policy = shipping_options(cur, address, payload.items, lines)
    return {"shippingCost": options[0]["price"], "shippingPolicy": policy,
            "shippingOptions": options, "paymentHours": payment_hours(),
            "mode": "operational" if operational_mode() else "testing"}


@router.get("/checkout-policy")
def checkout_policy(addressId: UUID | None = None, authorization: str = Header(default="")):
    require_test_commerce()
    with connection() as db, db.cursor() as cur:
        user = current_user(cur, authorization)
        require_tester(user)
        if operational_mode():
            address = one(cur, "SELECT province,city,district FROM customer_addresses WHERE id=%s AND user_id=%s",
                          (str(addressId) if addressId else None, user["id"]))
            if not address:
                raise HTTPException(422, "Pilih alamat pengiriman untuk melihat ongkir.")
            shipping, policy = shipping_quote(cur, address)
        else:
            shipping, policy = shipping_cost(), SHIPPING_POLICY
    return {"shippingCost": shipping, "shippingPolicy": policy,
            "paymentHours": payment_hours(), "mode": "operational" if operational_mode() else "testing"}


def order_view(cur, order_id, user_id=None):
    where = "o.id=%s" + (" AND o.user_id=%s" if user_id else "")
    params = (str(order_id), str(user_id)) if user_id else (str(order_id),)
    order = one(cur, "SELECT o.*,u.email,p.display_name FROM customer_orders o "
                "JOIN customer_users u ON u.id=o.user_id LEFT JOIN customer_profiles p ON p.user_id=u.id "
                f"WHERE {where}", params)
    if not order:
        raise HTTPException(404, "Pesanan tidak ditemukan.")
    cur.execute("SELECT sku_id,product_name,variant_label,grind_label,quantity,unit_price,line_total "
                "FROM customer_order_items WHERE order_id=%s ORDER BY id", (str(order_id),))
    lines = [{
        "skuId": row["sku_id"], "productName": row["product_name"],
        "variantLabel": row["variant_label"], "grindLabel": row["grind_label"],
        "quantity": row["quantity"], "unitPrice": row["unit_price"], "lineTotal": row["line_total"],
    } for row in cur.fetchall()]
    return {
        "id": str(order["id"]), "createdAt": order["created_at"].isoformat(),
        "customerName": order["display_name"] or "", "customerEmail": order["email"],
        "shipping": order["shipping_snapshot"], "items": lines,
        "checkoutMode": order["shipping_snapshot"].get("checkoutMode", "testing" if order["shipping_snapshot"].get("shippingPolicy") == SHIPPING_POLICY else "operational"),
        "subtotal": order["subtotal"], "discount": order["discount"],
        "shippingCost": order["shipping_cost"], "total": order["total"],
        "paymentMethod": order["payment_method"], "paymentStatus": order["payment_status"],
        "fulfillmentStatus": order["fulfillment_status"],
        "trackingNumber": order["tracking_number"], "rejectionReason": order["rejection_reason"],
        "expiresAt": order["expires_at"].isoformat() if order["expires_at"] else None,
    }


@router.post("/orders", status_code=201)
def create_order(payload: CreateOrder, authorization: str = Header(default="")):
    require_test_commerce()
    if payload.paymentMethod not in PAYMENT_METHODS:
        raise HTTPException(422, "Metode pembayaran tidak tersedia.")
    voucher = payload.voucherCode.strip().upper()
    if voucher and voucher not in {"SEDUPRESISI", "52COFFEE"}:
        raise HTTPException(422, "Voucher tidak valid.")
    request_hash = hashlib.sha256(json.dumps(payload.model_dump(mode="json"), sort_keys=True).encode()).hexdigest()
    with connection() as db, db.cursor() as cur:
        expire_unpaid(cur)
        user = current_user(cur, authorization)
        require_tester(user)
        if not user["email_verified_at"]:
            raise HTTPException(403, "Verifikasi email sebelum checkout.")
        previous = one(cur, "SELECT id,request_hash FROM customer_orders WHERE user_id=%s AND idempotency_key=%s",
                       (user["id"], str(payload.idempotencyKey)))
        if previous:
            if not hmac.compare_digest(previous["request_hash"], request_hash):
                raise HTTPException(409, "Kunci checkout sudah digunakan untuk keranjang lain.")
            return order_view(cur, previous["id"], user["id"])
        address = one(cur, "SELECT * FROM customer_addresses WHERE id=%s AND user_id=%s FOR SHARE",
                      (str(payload.addressId), user["id"]))
        if not address:
            raise HTTPException(422, "Alamat pengiriman tidak tersedia.")
        lines, resources = priced_lines(cur, payload.items)
        subtotal = sum(line["amount_idr"] * line["quantity"] for line in lines)
        discount = round(subtotal * 0.1) if voucher else 0
        options, policy = shipping_options(cur, address, payload.items, lines)
        if policy == MANUAL_SHIPPING_POLICY:
            raise HTTPException(409, "Minta konfirmasi ongkir luar Jawa sebelum membuat pesanan dan membayar.")
        selected = next((option for option in options if option["id"] == payload.shippingOptionId), None)
        if selected is None:
            if len(options) != 1 or payload.shippingOptionId is not None:
                raise HTTPException(409, "Pilih layanan pengiriman yang tersedia.")
            selected = options[0]
        shipping = selected["price"]
        if payload.shippingQuotedPrice is not None and payload.shippingQuotedPrice != shipping:
            raise HTTPException(409, "Tarif kurir berubah. Periksa ulang pilihan pengiriman.")
        if policy == OPERATIONAL_SHIPPING_POLICY and payload.shippingQuotedPrice is None:
            raise HTTPException(422, "Tarif kurir belum dipilih.")
        snapshot = {
            "recipientName": address["recipient_name"], "whatsapp": address["whatsapp"],
            "province": address["province"], "city": address["city"],
            "district": address["district"], "postalCode": address["postal_code"],
            "fullAddress": address["full_address"], "notes": address["notes"],
            "shippingPolicy": policy,
            "checkoutMode": "operational" if operational_mode() else "testing",
            "courierName": selected["courier"], "courierService": selected["service"],
            "shippingOptionId": selected["id"], "courierDuration": selected["duration"],
        }
        created = one(cur, "INSERT INTO customer_orders(user_id,idempotency_key,request_hash,shipping_snapshot,"
                      "subtotal,discount,shipping_cost,total,payment_method,expires_at) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "
                      "ON CONFLICT(user_id,idempotency_key) DO NOTHING RETURNING id",
                      (user["id"], str(payload.idempotencyKey), request_hash, Json(snapshot),
                       subtotal, discount, shipping, subtotal - discount + shipping, payload.paymentMethod,
                       datetime.now(timezone.utc) + timedelta(hours=payment_hours())))
        if not created:
            existing = one(cur, "SELECT id,request_hash FROM customer_orders WHERE user_id=%s AND idempotency_key=%s",
                           (user["id"], str(payload.idempotencyKey)))
            if not existing or not hmac.compare_digest(existing["request_hash"], request_hash):
                raise HTTPException(409, "Checkout ganda dengan data berbeda.")
            return order_view(cur, existing["id"], user["id"])
        order_id = created["id"]
        cur.execute("SELECT resource_id,available_quantity,verified_at FROM customer_inventory WHERE resource_id=ANY(%s) "
                    "ORDER BY resource_id FOR UPDATE", (list(resources),))
        inventory = {row["resource_id"]: row for row in cur.fetchall()}
        if any(resource not in inventory or inventory[resource]["available_quantity"] < required
               or ((operational_mode() or resource.startswith("pack:")) and not inventory[resource]["verified_at"])
               for resource, required in resources.items()):
            raise HTTPException(409, "Stok terverifikasi tidak mencukupi. Periksa keranjang.")
        for resource, required in sorted(resources.items()):
            cur.execute("UPDATE customer_inventory SET available_quantity=available_quantity-%s,updated_at=now() "
                        "WHERE resource_id=%s", (required, resource))
            cur.execute("INSERT INTO customer_order_inventory(order_id,resource_id,quantity) VALUES (%s,%s,%s)",
                        (order_id, resource, required))
            if operational_mode():
                cur.execute("INSERT INTO customer_inventory_movements(resource_id,delta,reason,order_id) "
                            "VALUES (%s,%s,'Reservasi checkout',%s)", (resource, -required, order_id))
        for line in lines:
            cur.execute("INSERT INTO customer_order_items(order_id,sku_id,product_name,variant_label,grind_label,"
                        "quantity,unit_price,line_total) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                        (order_id, line["sku_id"], line["product_name"], line["variant_label"],
                         line["grind_label"], line["quantity"], line["amount_idr"], line["amount_idr"] * line["quantity"]))
        cur.execute("INSERT INTO customer_payments(order_id,method) VALUES (%s,%s)", (order_id, payload.paymentMethod))
        cur.execute("INSERT INTO customer_order_status_history(order_id,actor_user_id,actor_role,field,old_status,new_status) "
                    "VALUES (%s,%s,'customer','payment',NULL,'pending')", (order_id, user["id"]))
        return order_view(cur, order_id, user["id"])


@router.get("/orders")
def list_orders(authorization: str = Header(default="")):
    require_test_commerce()
    with connection() as db, db.cursor() as cur:
        expire_unpaid(cur)
        user = current_user(cur, authorization)
        require_tester(user)
        cur.execute("SELECT id FROM customer_orders WHERE user_id=%s ORDER BY created_at DESC LIMIT 100", (user["id"],))
        return [order_view(cur, row["id"], user["id"]) for row in cur.fetchall()]


@router.get("/orders/{order_id}")
def get_order(order_id: UUID, authorization: str = Header(default="")):
    require_test_commerce()
    with connection() as db, db.cursor() as cur:
        expire_unpaid(cur)
        user = current_user(cur, authorization)
        require_tester(user)
        return order_view(cur, order_id, user["id"])
