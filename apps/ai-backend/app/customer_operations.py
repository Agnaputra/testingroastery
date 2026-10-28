"""Admin-owned stock and shipping configuration for the local commerce rollout."""
from uuid import uuid4
from urllib.parse import urlparse

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from .customer_auth import connection, one
from .customer_orders import require_test_commerce
from .customer_payments import require_admin

router = APIRouter(prefix="/api/customer/admin", tags=["customer-operations"])


class StockAdjustment(BaseModel):
    resourceId: str = Field(min_length=3, max_length=300)
    availableQuantity: int = Field(ge=0, le=1_000_000)
    reason: str = Field(min_length=3, max_length=500)


class PackConversion(BaseModel):
    skuId: str = Field(min_length=3, max_length=250)
    quantity: int = Field(ge=1, le=10_000)


class ShippingOrigin(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    fullAddress: str = Field(min_length=5, max_length=500)
    city: str = Field(min_length=2, max_length=100)
    province: str = Field(min_length=2, max_length=100)
    postalCode: str = Field(pattern=r"^[0-9]{5}$")


class ShippingRate(BaseModel):
    province: str = Field(min_length=2, max_length=100)
    city: str = Field(min_length=2, max_length=100)
    district: str = Field(min_length=2, max_length=100)
    amountIdr: int = Field(ge=0, le=1_000_000)
    courierCode: str
    serviceName: str = Field(min_length=2, max_length=100)
    maxWeightGrams: int = Field(ge=1, le=100_000)
    sourceUrl: str = Field(min_length=15, max_length=500)


class ShippingWeight(BaseModel):
    skuId: str = Field(min_length=3, max_length=250)
    packedWeightGrams: int = Field(ge=1, le=100_000)


def admin(cur, authorization, x_admin_key):
    require_test_commerce()
    return require_admin(cur, authorization, x_admin_key)


def valid_resource(cur, resource_id):
    if resource_id.startswith("pack:"):
        sku = resource_id.removeprefix("pack:")
        row = one(cur, "SELECT sku_id,category FROM customer_catalog_prices WHERE sku_id=%s", (sku,))
        return bool(row and row["category"] == "beans")
    if resource_id.startswith("bean:"):
        slug = resource_id.removeprefix("bean:")
        return bool(one(cur, "SELECT 1 FROM customer_catalog_prices WHERE slug=%s AND category IN ('beans','cup') "
                        "UNION SELECT 1 FROM customer_blend_prices WHERE slug=%s LIMIT 1", (slug, slug)))
    if resource_id.startswith("accessory:"):
        return bool(one(cur, "SELECT 1 FROM customer_catalog_prices WHERE resource_id=%s AND category='accessory'",
                        (resource_id,)))
    return False


@router.get("/inventory")
def inventory(authorization: str = Header(default=""), x_admin_key: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        admin(cur, authorization, x_admin_key)
        cur.execute("SELECT resource_id,unit,available_quantity,verified_at FROM customer_inventory ORDER BY resource_id")
        balances = [{"resourceId": row["resource_id"], "unit": row["unit"],
                     "availableQuantity": row["available_quantity"], "verified": bool(row["verified_at"])}
                    for row in cur.fetchall()]
        cur.execute("SELECT sku_id,slug,product_name,variant_label,weight_grams FROM customer_catalog_prices "
                    "WHERE category='beans' ORDER BY product_name,weight_grams")
        packages = [{"skuId": row["sku_id"], "slug": row["slug"], "name": row["product_name"],
                     "variant": row["variant_label"], "weightGrams": row["weight_grams"]}
                    for row in cur.fetchall()]
        return {"balances": balances, "packages": packages}


@router.post("/inventory/adjust")
def adjust_stock(payload: StockAdjustment, authorization: str = Header(default=""),
                 x_admin_key: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        user = admin(cur, authorization, x_admin_key)
        if len(payload.reason.strip()) < 3:
            raise HTTPException(422, "Alasan koreksi stok harus jelas.")
        if not valid_resource(cur, payload.resourceId):
            raise HTTPException(422, "Resource stok tidak ada di katalog.")
        unit = "unit" if payload.resourceId.startswith(("pack:", "accessory:")) else "gram"
        row = one(cur, "SELECT unit,available_quantity,verified_at FROM customer_inventory "
                  "WHERE resource_id=%s FOR UPDATE", (payload.resourceId,))
        if row and row["unit"] != unit:
            raise HTTPException(409, "Satuan stok tidak cocok.")
        if row and not row["verified_at"]:
            reserved = one(cur, "SELECT 1 FROM customer_order_inventory WHERE resource_id=%s LIMIT 1",
                           (payload.resourceId,))
            if reserved:
                raise HTTPException(409, "Selesaikan order testing yang memakai stok ini sebelum verifikasi fisik.")
        old = row["available_quantity"] if row and row["verified_at"] else 0
        if row:
            cur.execute("UPDATE customer_inventory SET available_quantity=%s,verified_at=now(),updated_at=now() "
                        "WHERE resource_id=%s", (payload.availableQuantity, payload.resourceId))
        else:
            cur.execute("INSERT INTO customer_inventory(resource_id,unit,available_quantity,verified_at) "
                        "VALUES (%s,%s,%s,now())", (payload.resourceId, unit, payload.availableQuantity))
        delta = payload.availableQuantity - old
        if delta:
            cur.execute("INSERT INTO customer_inventory_movements(resource_id,delta,reason,actor_user_id) "
                        "VALUES (%s,%s,%s,%s)",
                        (payload.resourceId, delta, payload.reason.strip(), user["id"]))
        return {"resourceId": payload.resourceId, "availableQuantity": payload.availableQuantity, "verified": True}


@router.post("/inventory/pack")
def pack_stock(payload: PackConversion, authorization: str = Header(default=""),
               x_admin_key: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        user = admin(cur, authorization, x_admin_key)
        item = one(cur, "SELECT slug,weight_grams FROM customer_catalog_prices "
                   "WHERE sku_id=%s AND category='beans' AND in_stock=TRUE", (payload.skuId,))
        if not item or item["weight_grams"] <= 0:
            raise HTTPException(422, "SKU kemasan tidak tersedia.")
        bulk_id, pack_id = f"bean:{item['slug']}", f"pack:{payload.skuId}"
        required = item["weight_grams"] * payload.quantity
        cur.execute("INSERT INTO customer_inventory(resource_id,unit,available_quantity) "
                    "VALUES (%s,'unit',0) ON CONFLICT(resource_id) DO NOTHING", (pack_id,))
        cur.execute("SELECT resource_id,unit,available_quantity,verified_at FROM customer_inventory "
                    "WHERE resource_id=ANY(%s) ORDER BY resource_id FOR UPDATE", ([bulk_id, pack_id],))
        balances = {row["resource_id"]: row for row in cur.fetchall()}
        bulk, package = balances.get(bulk_id), balances.get(pack_id)
        if not bulk or not bulk["verified_at"] or bulk["unit"] != "gram" or bulk["available_quantity"] < required:
            raise HTTPException(409, "Stok curah terverifikasi tidak mencukupi.")
        if package["unit"] != "unit":
            raise HTTPException(409, "Satuan kemasan tidak cocok.")
        if not package["verified_at"] and package["available_quantity"]:
            raise HTTPException(409, "Saldo kemasan lama harus diverifikasi sebelum konversi.")
        if not package["verified_at"] and one(cur, "SELECT 1 FROM customer_order_inventory "
                                               "WHERE resource_id=%s LIMIT 1", (pack_id,)):
            raise HTTPException(409, "Selesaikan order testing yang memakai kemasan ini terlebih dahulu.")
        cur.execute("UPDATE customer_inventory SET available_quantity=available_quantity-%s,updated_at=now() "
                    "WHERE resource_id=%s", (required, bulk_id))
        cur.execute("UPDATE customer_inventory SET available_quantity=available_quantity+%s,"
                    "verified_at=now(),updated_at=now() WHERE resource_id=%s", (payload.quantity, pack_id))
        operation_id = str(uuid4())
        cur.executemany("INSERT INTO customer_inventory_movements(operation_id,resource_id,delta,reason,actor_user_id) "
                        "VALUES (%s,%s,%s,%s,%s)", [
                            (operation_id, bulk_id, -required, "Dikemas menjadi " + payload.skuId, user["id"]),
                            (operation_id, pack_id, payload.quantity, "Konversi dari " + bulk_id, user["id"]),
                        ])
        return {"bulkResourceId": bulk_id, "packResourceId": pack_id,
                "bulkUsedGrams": required, "packagesCreated": payload.quantity}


@router.get("/inventory/movements")
def movements(authorization: str = Header(default=""), x_admin_key: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        admin(cur, authorization, x_admin_key)
        cur.execute("SELECT resource_id,delta,reason,created_at FROM customer_inventory_movements "
                    "ORDER BY id DESC LIMIT 100")
        return [{"resourceId": row["resource_id"], "delta": row["delta"], "reason": row["reason"],
                 "createdAt": row["created_at"].isoformat()} for row in cur.fetchall()]


@router.get("/shipping")
def shipping(authorization: str = Header(default=""), x_admin_key: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        admin(cur, authorization, x_admin_key)
        origin = one(cur, "SELECT name,full_address,city,province,postal_code FROM customer_shipping_origin WHERE id=TRUE")
        cur.execute("SELECT province,city,district,amount_idr,courier_code,service_name,max_weight_grams,source_url,verified_at "
                    "FROM customer_shipping_rates WHERE courier_code IS NOT NULL "
                    "ORDER BY province,city,district")
        return {"origin": ({"name": origin["name"], "fullAddress": origin["full_address"],
                            "city": origin["city"], "province": origin["province"],
                            "postalCode": origin["postal_code"]} if origin else None),
                "rates": [{"province": row["province"], "city": row["city"],
                           "district": row["district"], "amountIdr": row["amount_idr"],
                           "courierCode": row["courier_code"], "serviceName": row["service_name"],
                           "maxWeightGrams": row["max_weight_grams"], "sourceUrl": row["source_url"],
                           "verifiedAt": row["verified_at"].isoformat()}
                          for row in cur.fetchall()]}


@router.get("/shipping/weights")
def shipping_weights(authorization: str = Header(default=""), x_admin_key: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        admin(cur, authorization, x_admin_key)
        cur.execute("SELECT sku_id,product_name,variant_label FROM customer_catalog_prices "
                    "WHERE category IN ('beans','accessory') AND in_stock=TRUE ORDER BY product_name,variant_label")
        products = [{"skuId": row["sku_id"], "label": f"{row['product_name']} · {row['variant_label']}"}
                    for row in cur.fetchall()]
        cur.execute("SELECT DISTINCT weight_grams FROM customer_blend_prices ORDER BY weight_grams")
        products.extend({"skuId": f"byob:{row['weight_grams']}",
                         "label": f"Build Your Own Blend · {row['weight_grams']}g"} for row in cur.fetchall())
        cur.execute("SELECT sku_id,packed_weight_grams FROM customer_shipping_weights")
        weights = {row["sku_id"]: row["packed_weight_grams"] for row in cur.fetchall()}
        return {"products": products, "weights": weights}


@router.put("/shipping/weights")
def save_shipping_weight(payload: ShippingWeight, authorization: str = Header(default=""),
                         x_admin_key: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        admin(cur, authorization, x_admin_key)
        if payload.skuId.startswith("byob:"):
            try:
                weight = int(payload.skuId.removeprefix("byob:"))
            except ValueError:
                raise HTTPException(422, "Berat racikan tidak valid.") from None
            valid = one(cur, "SELECT weight_grams FROM customer_blend_prices WHERE weight_grams=%s LIMIT 1", (weight,))
        else:
            valid = one(cur, "SELECT weight_grams FROM customer_catalog_prices WHERE sku_id=%s "
                        "AND category IN ('beans','accessory') AND in_stock=TRUE", (payload.skuId,))
        if not valid:
            raise HTTPException(422, "SKU pengiriman tidak ada di katalog.")
        if payload.packedWeightGrams < valid["weight_grams"]:
            raise HTTPException(422, "Berat paket tidak boleh kurang dari berat isi produk.")
        cur.execute("INSERT INTO customer_shipping_weights(sku_id,packed_weight_grams) VALUES (%s,%s) "
                    "ON CONFLICT(sku_id) DO UPDATE SET packed_weight_grams=EXCLUDED.packed_weight_grams,"
                    "verified_at=now(),updated_at=now()", (payload.skuId, payload.packedWeightGrams))
        return {"ok": True}


@router.put("/shipping/origin")
def save_origin(payload: ShippingOrigin, authorization: str = Header(default=""),
                x_admin_key: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        admin(cur, authorization, x_admin_key)
        values = [payload.name.strip(), payload.fullAddress.strip(), payload.city.strip(),
                  payload.province.strip(), payload.postalCode]
        if len(values[0]) < 2 or len(values[1]) < 5 or len(values[2]) < 2 or len(values[3]) < 2:
            raise HTTPException(422, "Alamat asal tidak lengkap.")
        cur.execute("INSERT INTO customer_shipping_origin(id,name,full_address,city,province,postal_code,verified_at) "
                    "VALUES (TRUE,%s,%s,%s,%s,%s,now()) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,"
                    "full_address=EXCLUDED.full_address,city=EXCLUDED.city,province=EXCLUDED.province,"
                    "postal_code=EXCLUDED.postal_code,verified_at=now(),updated_at=now()", values)
        return {"ok": True}


@router.put("/shipping/rate")
def save_rate(payload: ShippingRate, authorization: str = Header(default=""),
              x_admin_key: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        admin(cur, authorization, x_admin_key)
        province, city, district = (payload.province.strip(), payload.city.strip(), payload.district.strip())
        if min(map(len, (province, city, district))) < 2:
            raise HTTPException(422, "Wilayah tujuan tidak lengkap.")
        source = urlparse(payload.sourceUrl)
        allowed = {"jne": {"jne.co.id", "www.jne.co.id", "css.jne.co.id"},
                   "jnt": {"jet.co.id", "www.jet.co.id"}}
        if payload.courierCode not in allowed or source.scheme != "https" \
                or source.hostname not in allowed[payload.courierCode] or source.username or source.password:
            raise HTTPException(422, "Gunakan tautan kalkulator resmi JNE atau J&T sesuai kurir.")
        cur.execute("INSERT INTO customer_shipping_rates(province,city,district,amount_idr,verified_at,"
                    "courier_code,service_name,max_weight_grams,source_url) "
                    "VALUES (%s,%s,%s,%s,now(),%s,%s,%s,%s) "
                    "ON CONFLICT(lower(province),lower(city),lower(district),courier_code,lower(service_name),max_weight_grams) "
                    "WHERE courier_code IS NOT NULL DO UPDATE SET amount_idr=EXCLUDED.amount_idr,"
                    "source_url=EXCLUDED.source_url,verified_at=now(),updated_at=now()",
                    (province, city, district, payload.amountIdr, payload.courierCode,
                     payload.serviceName.strip(), payload.maxWeightGrams, payload.sourceUrl))
        return {"ok": True}
