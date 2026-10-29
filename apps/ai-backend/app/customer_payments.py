"""Private proof storage and audited manual verification."""
import hashlib
import io
import warnings
from uuid import UUID

from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field
from pypdf import PdfReader

from .customer_auth import connection, current_user, one
from .customer_orders import order_view, require_test_commerce, require_tester, expire_unpaid, release_inventory, payment_hours
from .events import admin_key

router = APIRouter(prefix="/api/customer", tags=["customer"])
MAX_PROOF_BYTES = 5_000_000


def validated_mime(data: bytes) -> str:
    if data.startswith(b"%PDF-"):
        try:
            reader = PdfReader(io.BytesIO(data), strict=True)
            if len(reader.pages) < 1:
                raise ValueError("empty PDF")
        except Exception as error:
            raise HTTPException(422, "PDF tidak valid.") from error
        return "application/pdf"
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as image:
                image.verify()
                if image.format not in {"JPEG", "PNG"}:
                    raise ValueError("unsupported image")
                return "image/jpeg" if image.format == "JPEG" else "image/png"
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError, Image.DecompressionBombError, Image.DecompressionBombWarning) as error:
        raise HTTPException(422, "Bukti harus JPG, PNG, atau PDF yang valid.") from error


@router.post("/orders/{order_id}/proof", status_code=201)
async def upload_proof(order_id: UUID, file: UploadFile = File(), authorization: str = Header(default="")):
    require_test_commerce()
    data = await file.read(MAX_PROOF_BYTES + 1)
    if not 0 < len(data) <= MAX_PROOF_BYTES:
        raise HTTPException(413, "Bukti maksimal 5 MB.")
    mime = validated_mime(data)
    with connection() as db, db.cursor() as cur:
        expire_unpaid(cur)
        user = current_user(cur, authorization)
        require_tester(user)
        order = one(cur, "SELECT payment_status FROM customer_orders WHERE id=%s AND user_id=%s FOR UPDATE",
                    (str(order_id), user["id"]))
        if not order:
            raise HTTPException(404, "Pesanan tidak ditemukan.")
        if order["payment_status"] not in {"pending", "rejected"}:
            raise HTTPException(409, "Bukti tidak dapat diunggah pada status ini.")
        cur.execute("INSERT INTO customer_payment_proofs(order_id,user_id,mime_type,content,sha256) VALUES (%s,%s,%s,%s,%s)",
                    (str(order_id), user["id"], mime, data, hashlib.sha256(data).hexdigest()))
        cur.execute("UPDATE customer_orders SET payment_status='awaiting_verification',rejection_reason=NULL,updated_at=now() WHERE id=%s",
                    (str(order_id),))
        cur.execute("UPDATE customer_payments SET status='awaiting_verification',updated_at=now() WHERE order_id=%s",
                    (str(order_id),))
        cur.execute("INSERT INTO customer_order_status_history(order_id,actor_user_id,actor_role,field,old_status,new_status) "
                    "VALUES (%s,%s,'customer','payment',%s,'awaiting_verification')",
                    (str(order_id), user["id"], order["payment_status"]))
    return {"status": "awaiting_verification"}


@router.get("/orders/{order_id}/proof-file")
def own_proof(order_id: UUID, authorization: str = Header(default="")):
    require_test_commerce()
    with connection() as db, db.cursor() as cur:
        user = current_user(cur, authorization)
        require_tester(user)
        row = one(cur, "SELECT p.content,p.mime_type FROM customer_payment_proofs p "
                  "JOIN customer_orders o ON o.id=p.order_id WHERE o.id=%s AND o.user_id=%s "
                  "ORDER BY p.created_at DESC LIMIT 1", (str(order_id), user["id"]))
        if not row:
            raise HTTPException(404, "Bukti tidak ditemukan.")
        return Response(bytes(row["content"]), media_type=row["mime_type"],
                        headers={"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"})


@router.get("/payments")
def payment_history(authorization: str = Header(default="")):
    require_test_commerce()
    with connection() as db, db.cursor() as cur:
        expire_unpaid(cur)
        user = current_user(cur, authorization)
        require_tester(user)
        cur.execute("SELECT o.id,o.total,o.payment_method,o.payment_status,o.rejection_reason,o.created_at,"
                    "p.verified_at,(SELECT max(created_at) FROM customer_payment_proofs WHERE order_id=o.id) AS proof_at "
                    "FROM customer_orders o JOIN customer_payments p ON p.order_id=o.id "
                    "WHERE o.user_id=%s ORDER BY o.created_at DESC LIMIT 100", (user["id"],))
        return [{
            "orderId": str(row["id"]), "total": row["total"], "method": row["payment_method"],
            "status": row["payment_status"], "rejectionReason": row["rejection_reason"],
            "createdAt": row["created_at"].isoformat(),
            "proofSubmittedAt": row["proof_at"].isoformat() if row["proof_at"] else None,
            "verifiedAt": row["verified_at"].isoformat() if row["verified_at"] else None,
        } for row in cur.fetchall()]


def require_admin(cur, authorization: str, x_admin_key: str):
    admin_key(x_admin_key)
    if authorization:
        try:
            user = current_user(cur, authorization)
            if user and user.get("role") == "admin" and user.get("email_verified_at"):
                return user
        except HTTPException:
            pass

    return {
        "id": "00000000-0000-0000-0000-000000000000",
        "email": "admin@52coffee.id",
        "role": "admin",
        "email_verified_at": "2026-01-01T00:00:00Z",
    }


def resolve_actor_user_id(cur, user):
    if not user:
        return None
    raw_id = user.get("id") if isinstance(user, dict) else user
    if not raw_id:
        return None
    uid = str(raw_id)
    if uid == "00000000-0000-0000-0000-000000000000":
        return None
    cur.execute("SELECT 1 FROM customer_users WHERE id=%s", (uid,))
    return uid if cur.fetchone() else None


@router.get("/admin/orders")
def admin_orders(authorization: str = Header(default=""), x_admin_key: str = Header(default="")):
    require_test_commerce()
    with connection() as db, db.cursor() as cur:
        require_admin(cur, authorization, x_admin_key)
        expire_unpaid(cur)
        cur.execute("SELECT id FROM customer_orders ORDER BY created_at DESC LIMIT 200")
        return [order_view(cur, row["id"]) for row in cur.fetchall()]


@router.get("/admin/payment-summary")
def admin_payment_summary(authorization: str = Header(default=""), x_admin_key: str = Header(default="")):
    require_test_commerce()
    with connection() as db, db.cursor() as cur:
        require_admin(cur, authorization, x_admin_key)
        row = one(cur, "SELECT count(*) AS count,COALESCE(sum(total),0) AS total "
                  "FROM customer_orders WHERE payment_status='paid'")
        return {"paidCount": row["count"], "paidTotal": row["total"]}


@router.get("/admin/orders/{order_id}/proof-file")
def admin_proof(order_id: UUID, authorization: str = Header(default=""), x_admin_key: str = Header(default="")):
    require_test_commerce()
    with connection() as db, db.cursor() as cur:
        require_admin(cur, authorization, x_admin_key)
        row = one(cur, "SELECT content,mime_type FROM customer_payment_proofs WHERE order_id=%s "
                  "ORDER BY created_at DESC LIMIT 1", (str(order_id),))
        if not row:
            raise HTTPException(404, "Bukti tidak ditemukan.")
        return Response(bytes(row["content"]), media_type=row["mime_type"],
                        headers={"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"})


class Decision(BaseModel):
    action: str
    reason: str = Field(default="", max_length=1000)
    receiptConfirmed: bool = False


@router.post("/admin/orders/{order_id}/payment")
def decide_payment(order_id: UUID, payload: Decision, authorization: str = Header(default=""),
                   x_admin_key: str = Header(default="")):
    require_test_commerce()
    if payload.action not in {"approve", "reject"} or (payload.action == "approve" and not payload.receiptConfirmed) \
            or (payload.action == "reject" and not payload.reason.strip()):
        raise HTTPException(422, "Keputusan atau alasan tidak valid.")
    with connection() as db, db.cursor() as cur:
        admin = require_admin(cur, authorization, x_admin_key)
        order = one(cur, "SELECT payment_status FROM customer_orders WHERE id=%s FOR UPDATE", (str(order_id),))
        if not order:
            raise HTTPException(404, "Pesanan tidak ditemukan.")
        if order["payment_status"] != "awaiting_verification":
            raise HTTPException(409, "Status pembayaran sudah berubah.")
        status = "paid" if payload.action == "approve" else "rejected"
        cur.execute("UPDATE customer_orders SET payment_status=%s,rejection_reason=%s,"
                    "expires_at=CASE WHEN %s='rejected' THEN now()+(%s * interval '1 hour') ELSE expires_at END,"
                    "updated_at=now() WHERE id=%s",
                    (status, payload.reason.strip() if status == "rejected" else None,
                     status, payment_hours(), str(order_id)))
        actor_id = resolve_actor_user_id(cur, admin)
        verifier = admin.get("email") or str(admin.get("id")) or "admin@52coffee.id"
        cur.execute("UPDATE customer_payments SET status=%s,verified_by=%s,verified_at=now(),updated_at=now() WHERE order_id=%s",
                    (status, verifier, str(order_id)))
        cur.execute("INSERT INTO customer_order_status_history(order_id,actor_user_id,actor_role,field,old_status,new_status,reason) "
                    "VALUES (%s,%s,'admin','payment','awaiting_verification',%s,%s)",
                    (str(order_id), actor_id, status, payload.reason.strip() if status == "rejected" else None))
        return order_view(cur, order_id)


class Fulfillment(BaseModel):
    status: str
    trackingNumber: str = Field(default="", max_length=100)


@router.post("/admin/orders/{order_id}/fulfillment")
def update_fulfillment(order_id: UUID, payload: Fulfillment, authorization: str = Header(default=""),
                       x_admin_key: str = Header(default="")):
    require_test_commerce()
    allowed = {
        "pending": {"processing", "cancelled"},
        "processing": {"roasting", "cancelled"},
        "roasting": {"shipped", "cancelled"},
        "shipped": {"completed"},
        "completed": set(),
        "cancelled": set(),
    }
    with connection() as db, db.cursor() as cur:
        admin = require_admin(cur, authorization, x_admin_key)
        order = one(cur, "SELECT fulfillment_status,payment_status FROM customer_orders WHERE id=%s FOR UPDATE",
                    (str(order_id),))
        if not order:
            raise HTTPException(404, "Pesanan tidak ditemukan.")
        if payload.status not in allowed[order["fulfillment_status"]] \
                or (payload.status != "cancelled" and order["payment_status"] != "paid") \
                or (payload.status == "cancelled" and order["payment_status"] == "paid") \
                or (payload.status == "shipped" and not payload.trackingNumber.strip()):
            raise HTTPException(409, "Perubahan status tidak diizinkan.")
        actor_id = resolve_actor_user_id(cur, admin)
        cur.execute("UPDATE customer_orders SET fulfillment_status=%s,tracking_number=COALESCE(NULLIF(%s,''),tracking_number),"
                    "updated_at=now() WHERE id=%s", (payload.status, payload.trackingNumber.strip(), str(order_id)))
        cur.execute("INSERT INTO customer_order_status_history(order_id,actor_user_id,actor_role,field,old_status,new_status) "
                    "VALUES (%s,%s,'admin','fulfillment',%s,%s)",
                    (str(order_id), actor_id, order["fulfillment_status"], payload.status))
        if payload.status == "cancelled":
            release_inventory(cur, order_id)
            cur.execute("UPDATE customer_orders SET payment_status='cancelled' WHERE id=%s", (str(order_id),))
            cur.execute("UPDATE customer_payments SET status='cancelled',updated_at=now() WHERE order_id=%s", (str(order_id),))
            cur.execute("INSERT INTO customer_order_status_history(order_id,actor_user_id,actor_role,field,old_status,new_status) "
                        "VALUES (%s,%s,'admin','payment',%s,'cancelled')",
                        (str(order_id), actor_id, order["payment_status"]))
        return order_view(cur, order_id)
