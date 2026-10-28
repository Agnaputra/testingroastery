"""Admin-managed catalog overlays and durable product images."""
import io
import re
import secrets
from typing import Literal
from urllib.parse import quote

from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image, UnidentifiedImageError
from psycopg2.extras import Json
from pydantic import BaseModel, Field, ConfigDict, model_validator

from .config import settings
from .customer_auth import connection, one

router = APIRouter(prefix="/api/catalog/managed", tags=["catalog-management"])
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")


class Variant(BaseModel):
    model_config = ConfigDict(extra="forbid")
    weightGrams: int = Field(ge=1, le=100_000)
    weightLabel: str = Field(min_length=1, max_length=40)
    price: int = Field(ge=1, le=100_000_000)
    inStock: bool
    stockUnits: int | None = Field(default=None, ge=0, le=1_000_000)


class Recipe(BaseModel):
    model_config = ConfigDict(extra="forbid")
    method: str = Field(max_length=100)
    dose: str = Field(max_length=100)
    water: str = Field(max_length=100)
    ratio: str = Field(max_length=100)
    temp: str = Field(max_length=100)
    time: str = Field(max_length=100)
    steps: list[str] = Field(max_length=20)


class Product(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(min_length=2, max_length=150)
    slug: str = Field(min_length=2, max_length=150)
    name: str = Field(min_length=2, max_length=200)
    slowbarAlias: str | None = Field(default=None, max_length=100)
    category: Literal["filter", "espresso", "reserve", "glassware", "machine"]
    categoryLabel: str = Field(min_length=2, max_length=100)
    series: str = Field(min_length=2, max_length=100)
    publicationStatus: Literal["published", "draft", "needs_owner_review"] | None = None
    masterRow: int | None = Field(default=None, ge=1)
    origin: str = Field(min_length=2, max_length=200)
    region: str = Field(max_length=200)
    altitude: str = Field(max_length=100)
    varietal: str = Field(max_length=200)
    process: str = Field(max_length=200)
    roastLevel: Literal["Light", "Light-Medium", "Medium-Light", "Medium", "Medium-Dark"]
    tastingNotes: list[str] = Field(max_length=12)
    flavorCategory: list[Literal["Fruity", "Floral", "Chocolaty", "Nutty", "Sweet", "Spicy"]] = Field(max_length=6)
    description: str = Field(min_length=10, max_length=3000)
    story: str = Field(max_length=5000)
    variants: list[Variant] = Field(min_length=1, max_length=12)
    basePrice: int = Field(ge=1, le=100_000_000)
    cupPrice: int | None = Field(default=None, ge=1, le=100_000_000)
    defaultWeight: str = Field(min_length=1, max_length=40)
    imageUrl: str = Field(max_length=500)
    badge: str | None = Field(default=None, max_length=100)
    acidity: float = Field(ge=0, le=5)
    sweetness: float = Field(ge=0, le=5)
    body: float = Field(ge=0, le=5)
    brewingRecipe: Recipe
    isFreshCrop: bool | None = None
    isFeatured: bool | None = None
    isSoldOut: bool | None = None

    @model_validator(mode="after")
    def consistent(self):
        if not SLUG.fullmatch(self.slug) or not SLUG.fullmatch(self.id):
            raise ValueError("Slug atau ID produk tidak valid")
        if len({(v.weightGrams, v.weightLabel) for v in self.variants}) != len(self.variants):
            raise ValueError("Varian harus unik")
        if self.basePrice not in {v.price for v in self.variants}:
            raise ValueError("Harga dasar harus sesuai salah satu varian")
        if self.cupPrice and self.category in {"glassware", "machine"}:
            raise ValueError("Harga per cup hanya untuk produk kopi")
        if any(len(note) > 100 for note in self.tastingNotes) or any(len(step) > 500 for step in self.brewingRecipe.steps):
            raise ValueError("Catatan terlalu panjang")
        if self.imageUrl and not (self.imageUrl.startswith("/") or self.imageUrl.startswith("https://")):
            raise ValueError("URL gambar tidak aman")
        return self


class Publication(BaseModel):
    isPublished: bool


def require_admin(key: str):
    if not settings.ADMIN_API_KEY or not secrets.compare_digest(key, settings.ADMIN_API_KEY):
        raise HTTPException(401, "Akses admin tidak valid.")


def public_overlay():
    with connection() as db, db.cursor() as cur:
        cur.execute("SELECT slug,product,is_published,deleted_at FROM catalog_managed_products")
        rows = cur.fetchall()
    return {"managedProducts": [row["product"] for row in rows if row["is_published"] and not row["deleted_at"]],
            "unpublishedSlugs": [row["slug"] for row in rows if not row["is_published"] or row["deleted_at"]]}


@router.get("")
def list_managed(x_admin_key: str = Header(default="")):
    require_admin(x_admin_key)
    with connection() as db, db.cursor() as cur:
        cur.execute("SELECT slug,product,is_published,deleted_at,image_data IS NOT NULL AS has_image "
                    "FROM catalog_managed_products ORDER BY updated_at DESC")
        return [{"slug": row["slug"], "product": row["product"], "isPublished": row["is_published"],
                 "isDeleted": bool(row["deleted_at"]), "hasImage": row["has_image"]} for row in cur.fetchall()]


@router.get("/stocks")
def list_product_stocks(x_admin_key: str = Header(default="")):
    require_admin(x_admin_key)
    with connection() as db, db.cursor() as cur:
        cur.execute("SELECT resource_id,available_quantity FROM customer_inventory "
                    "WHERE (resource_id LIKE 'pack:%' OR resource_id LIKE 'accessory:%') AND verified_at IS NOT NULL")
        return {row["resource_id"].split(':', 1)[1]: row["available_quantity"] for row in cur.fetchall()}


def sync_prices(cur, product: Product):
    category = "accessory" if product.category in {"glassware", "machine"} else "beans"
    cur.execute("UPDATE customer_catalog_prices SET in_stock=FALSE,updated_at=now() WHERE slug=%s", (product.slug,))
    for variant in product.variants:
        sku = f"{product.slug}:beans:{variant.weightGrams}:{quote(variant.weightLabel, safe='')}"
        resource = f"accessory:{sku}" if category == "accessory" else f"bean:{product.slug}"
        cur.execute("INSERT INTO customer_catalog_prices(sku_id,slug,product_name,variant_label,amount_idr,"
                    "in_stock,category,weight_grams,resource_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) "
                    "ON CONFLICT(sku_id) DO UPDATE SET product_name=EXCLUDED.product_name,"
                    "variant_label=EXCLUDED.variant_label,amount_idr=EXCLUDED.amount_idr,"
                    "in_stock=EXCLUDED.in_stock,category=EXCLUDED.category,"
                    "weight_grams=EXCLUDED.weight_grams,resource_id=EXCLUDED.resource_id,"
                    "updated_at=now()",
                    (sku, product.slug, product.name, variant.weightLabel, variant.price,
                     variant.inStock, category, variant.weightGrams, resource))
        if variant.stockUnits is not None:
            stock_resource = f"pack:{sku}" if category == "beans" else resource
            old = one(cur, "SELECT available_quantity FROM customer_inventory WHERE resource_id=%s FOR UPDATE", (stock_resource,))
            cur.execute("INSERT INTO customer_inventory(resource_id,unit,available_quantity,verified_at) "
                        "VALUES (%s,'unit',%s,now()) ON CONFLICT(resource_id) DO UPDATE SET "
                        "available_quantity=EXCLUDED.available_quantity,verified_at=now(),updated_at=now()",
                        (stock_resource, variant.stockUnits))
            delta = variant.stockUnits - (old["available_quantity"] if old else 0)
            if delta:
                cur.execute("INSERT INTO customer_inventory_movements(resource_id,delta,reason) "
                            "VALUES (%s,%s,'Saldo kemasan dari editor produk')", (stock_resource, delta))
    if product.cupPrice:
        cur.execute("INSERT INTO customer_catalog_prices(sku_id,slug,product_name,variant_label,amount_idr,"
                    "in_stock,category,weight_grams,resource_id) "
                    "VALUES (%s,%s,%s,'1 sajian',%s,TRUE,'cup',1,%s) "
                    "ON CONFLICT(sku_id) DO UPDATE SET product_name=EXCLUDED.product_name,"
                    "amount_idr=EXCLUDED.amount_idr,in_stock=TRUE,updated_at=now()",
                    (f"{product.slug}:cup:1:1%20sajian", product.slug, product.name,
                     product.cupPrice, f"bean:{product.slug}"))


def stored_product(product: Product, published: bool):
    value = product.model_dump()
    value["publicationStatus"] = "published" if published else "draft"
    for variant in value["variants"]:
        variant.pop("stockUnits", None)
    return value


@router.post("", status_code=201)
def create_product(product: Product, x_admin_key: str = Header(default="")):
    require_admin(x_admin_key)
    with connection() as db, db.cursor() as cur:
        if one(cur, "SELECT 1 FROM customer_catalog_prices WHERE slug=%s LIMIT 1", (product.slug,)):
            raise HTTPException(409, "Slug produk sudah ada.")
        if one(cur, "SELECT 1 FROM catalog_managed_products WHERE slug=%s", (product.slug,)):
            raise HTTPException(409, "Slug produk sudah ada.")
        value = stored_product(product, False)
        cur.execute("INSERT INTO catalog_managed_products(slug,product,is_published) VALUES (%s,%s,FALSE)",
                    (product.slug, Json(value)))
        cur.execute("INSERT INTO catalog_publication_overrides(slug,is_published) VALUES (%s,FALSE) "
                    "ON CONFLICT(slug) DO UPDATE SET is_published=FALSE,updated_at=now()", (product.slug,))
        sync_prices(cur, product)
    return {"slug": product.slug, "isPublished": False}


@router.put("/{slug}")
def update_product(slug: str, product: Product, x_admin_key: str = Header(default="")):
    require_admin(x_admin_key)
    if product.slug != slug or not SLUG.fullmatch(slug):
        raise HTTPException(422, "Slug tidak boleh diubah setelah dibuat.")
    with connection() as db, db.cursor() as cur:
        current = one(cur, "SELECT product,is_published FROM catalog_managed_products WHERE slug=%s FOR UPDATE", (slug,))
        override = one(cur, "SELECT is_published FROM catalog_publication_overrides WHERE slug=%s", (slug,))
        published = current["is_published"] if current else override is None or override["is_published"]
        value = stored_product(product, published)
        if current and current["product"].get("imageUrl", "").startswith("/api/catalog/managed/"):
            value["imageUrl"] = current["product"]["imageUrl"]
        cur.execute("INSERT INTO catalog_managed_products(slug,product,is_published) VALUES (%s,%s,%s) "
                    "ON CONFLICT(slug) DO UPDATE SET product=EXCLUDED.product,deleted_at=NULL,updated_at=now()",
                    (slug, Json(value), published))
        sync_prices(cur, product)
    return {"slug": slug, "isPublished": published}


@router.patch("/{slug}/publication")
def set_managed_publication(slug: str, value: Publication, x_admin_key: str = Header(default="")):
    require_admin(x_admin_key)
    with connection() as db, db.cursor() as cur:
        row = one(cur, "SELECT product FROM catalog_managed_products WHERE slug=%s AND deleted_at IS NULL FOR UPDATE", (slug,))
        if not row:
            raise HTTPException(404, "Produk tidak ditemukan.")
        product = row["product"]
        product["publicationStatus"] = "published" if value.isPublished else "draft"
        cur.execute("UPDATE catalog_managed_products SET product=%s,is_published=%s,updated_at=now() WHERE slug=%s",
                    (Json(product), value.isPublished, slug))
        cur.execute("INSERT INTO catalog_publication_overrides(slug,is_published) VALUES (%s,%s) "
                    "ON CONFLICT(slug) DO UPDATE SET is_published=EXCLUDED.is_published,updated_at=now()",
                    (slug, value.isPublished))
    return {"slug": slug, "isPublished": value.isPublished}


@router.delete("/{slug}")
def delete_product(slug: str, x_admin_key: str = Header(default="")):
    require_admin(x_admin_key)
    with connection() as db, db.cursor() as cur:
        row = one(cur, "UPDATE catalog_managed_products SET is_published=FALSE,deleted_at=now(),updated_at=now() "
                  "WHERE slug=%s AND deleted_at IS NULL RETURNING slug", (slug,))
        if not row:
            raise HTTPException(404, "Produk tidak ditemukan.")
        cur.execute("UPDATE customer_catalog_prices SET in_stock=FALSE,updated_at=now() WHERE slug=%s", (slug,))
        cur.execute("INSERT INTO catalog_publication_overrides(slug,is_published) VALUES (%s,FALSE) "
                    "ON CONFLICT(slug) DO UPDATE SET is_published=FALSE,updated_at=now()", (slug,))
    return {"deleted": slug}


@router.patch("/{slug}/restore")
def restore_product(slug: str, x_admin_key: str = Header(default="")):
    require_admin(x_admin_key)
    with connection() as db, db.cursor() as cur:
        row = one(cur, "UPDATE catalog_managed_products SET deleted_at=NULL,is_published=FALSE,updated_at=now() "
                  "WHERE slug=%s AND deleted_at IS NOT NULL RETURNING slug", (slug,))
        if not row:
            raise HTTPException(404, "Produk arsip tidak ditemukan.")
    return {"restored": slug, "isPublished": False}


@router.post("/{slug}/image")
async def upload_image(slug: str, file: UploadFile = File(), x_admin_key: str = Header(default="")):
    require_admin(x_admin_key)
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(422, "Gunakan JPG, PNG, atau WebP.")
    data = await file.read(4_000_001)
    if len(data) > 4_000_000:
        raise HTTPException(413, "Gambar maksimal 4 MB.")
    try:
        with Image.open(io.BytesIO(data)) as image:
            if image.width * image.height > 20_000_000:
                raise HTTPException(422, "Resolusi gambar terlalu besar.")
            image.load()
            image.thumbnail((1600, 1600))
            output = io.BytesIO()
            image.convert("RGB").save(output, format="WEBP", quality=85)
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(422, "Berkas bukan gambar yang valid.") from None
    path = f"/api/catalog/managed/{slug}/image"
    with connection() as db, db.cursor() as cur:
        row = one(cur, "SELECT product FROM catalog_managed_products WHERE slug=%s AND deleted_at IS NULL FOR UPDATE", (slug,))
        if not row:
            raise HTTPException(404, "Produk tidak ditemukan.")
        product = row["product"]
        product["imageUrl"] = path
        cur.execute("UPDATE catalog_managed_products SET image_data=%s,image_mime='image/webp',product=%s,"
                    "updated_at=now() WHERE slug=%s", (output.getvalue(), Json(product), slug))
    return {"imageUrl": path}


@router.get("/{slug}/image")
def get_image(slug: str, x_admin_key: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        row = one(cur, "SELECT image_data FROM catalog_managed_products "
                  "WHERE slug=%s AND (is_published=TRUE OR %s=TRUE) AND deleted_at IS NULL",
                  (slug, bool(settings.ADMIN_API_KEY) and secrets.compare_digest(x_admin_key, settings.ADMIN_API_KEY)))
    if not row or not row["image_data"]:
        raise HTTPException(404, "Gambar tidak ditemukan.")
    return Response(bytes(row["image_data"]), media_type="image/webp", headers={"Cache-Control": "private, no-store"})
