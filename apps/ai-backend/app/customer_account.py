"""Authenticated customer profile and address operations."""
from uuid import UUID

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from .customer_auth import PHONE, connection, current_user, one, public_user

router = APIRouter(prefix="/api/customer", tags=["customer"])


class ProfileInput(BaseModel):
    displayName: str = Field(min_length=2, max_length=100)
    whatsapp: str | None = Field(default=None, pattern=PHONE)


class AddressInput(BaseModel):
    recipientName: str = Field(min_length=2, max_length=100)
    whatsapp: str = Field(pattern=PHONE)
    province: str = Field(min_length=2, max_length=100)
    city: str = Field(min_length=2, max_length=100)
    district: str = Field(min_length=2, max_length=100)
    postalCode: str = Field(pattern=r"^[0-9]{5}$")
    fullAddress: str = Field(min_length=5, max_length=500)
    notes: str = Field(default="", max_length=500)
    isDefault: bool = False


def address(row):
    return {
        "id": str(row["id"]), "recipientName": row["recipient_name"],
        "whatsapp": row["whatsapp"], "province": row["province"],
        "city": row["city"], "district": row["district"],
        "postalCode": row["postal_code"], "fullAddress": row["full_address"],
        "notes": row["notes"], "isDefault": row["is_default"],
    }


@router.get("/profile")
def profile(authorization: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        return public_user(current_user(cur, authorization))


@router.put("/profile")
def update_profile(payload: ProfileInput, authorization: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        user = current_user(cur, authorization)
        cur.execute("UPDATE customer_profiles SET display_name=%s,whatsapp=%s,updated_at=now() WHERE user_id=%s",
                    (payload.displayName.strip(), payload.whatsapp, user["id"]))
    return {"ok": True}


@router.get("/addresses")
def list_addresses(authorization: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        user = current_user(cur, authorization)
        cur.execute("SELECT * FROM customer_addresses WHERE user_id=%s ORDER BY is_default DESC,created_at", (user["id"],))
        return [address(row) for row in cur.fetchall()]


@router.post("/addresses", status_code=201)
def add_address(payload: AddressInput, authorization: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        user = current_user(cur, authorization)
        cur.execute("SELECT id FROM customer_users WHERE id=%s FOR UPDATE", (user["id"],))
        cur.execute("SELECT id FROM customer_addresses WHERE user_id=%s FOR UPDATE", (user["id"],))
        existing = cur.fetchall()
        default = payload.isDefault or not existing
        if default:
            cur.execute("UPDATE customer_addresses SET is_default=false WHERE user_id=%s", (user["id"],))
        row = one(cur, "INSERT INTO customer_addresses(user_id,recipient_name,whatsapp,province,city,district,postal_code,full_address,notes,is_default) "
                  "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *",
                  (user["id"], payload.recipientName.strip(), payload.whatsapp, payload.province.strip(),
                   payload.city.strip(), payload.district.strip(), payload.postalCode, payload.fullAddress.strip(),
                   payload.notes.strip(), default))
        return address(row)


@router.put("/addresses/{address_id}")
def edit_address(address_id: UUID, payload: AddressInput, authorization: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        user = current_user(cur, authorization)
        existing = one(cur, "SELECT id,is_default FROM customer_addresses WHERE id=%s AND user_id=%s FOR UPDATE",
                       (str(address_id), user["id"]))
        if not existing:
            raise HTTPException(404, "Alamat tidak ditemukan.")
        if payload.isDefault:
            cur.execute("UPDATE customer_addresses SET is_default=false WHERE user_id=%s", (user["id"],))
        row = one(cur, "UPDATE customer_addresses SET recipient_name=%s,whatsapp=%s,province=%s,city=%s,district=%s,"
                  "postal_code=%s,full_address=%s,notes=%s,is_default=%s WHERE id=%s AND user_id=%s RETURNING *",
                  (payload.recipientName.strip(), payload.whatsapp, payload.province.strip(), payload.city.strip(),
                   payload.district.strip(), payload.postalCode, payload.fullAddress.strip(), payload.notes.strip(),
                   payload.isDefault or existing["is_default"], str(address_id), user["id"]))
        return address(row)


@router.delete("/addresses/{address_id}")
def delete_address(address_id: UUID, authorization: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        user = current_user(cur, authorization)
        row = one(cur, "DELETE FROM customer_addresses WHERE id=%s AND user_id=%s RETURNING is_default",
                  (str(address_id), user["id"]))
        if not row:
            raise HTTPException(404, "Alamat tidak ditemukan.")
        if row["is_default"]:
            cur.execute("UPDATE customer_addresses SET is_default=true WHERE id=("
                        "SELECT id FROM customer_addresses WHERE user_id=%s ORDER BY created_at LIMIT 1)", (user["id"],))
    return {"ok": True}
