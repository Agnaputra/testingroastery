"""Event accounts, publishing, moderation, and WhatsApp handoff."""
import base64
import hashlib
import hmac
import json
import re
import secrets
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from urllib.parse import quote
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import psycopg2
from psycopg2.extras import RealDictCursor, Json
from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field

from .config import settings

router = APIRouter(prefix="/api/events", tags=["events"])
PHONE = re.compile(r"^[1-9][0-9]{7,14}$")
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
IMAGE_TYPES = {"image/jpeg": b"\xff\xd8\xff", "image/png": b"\x89PNG\r\n\x1a\n", "image/webp": b"RIFF"}
EVENT_FIELDS = "e.id, e.slug, e.title, e.description, e.starts_at, e.ends_at, e.timezone, e.location_type, e.venue_name, e.address, e.meeting_link, e.capacity, e.confirmed_count, e.is_paid, e.price, e.whatsapp, e.instructions, e.registration_status, e.status, e.moderation_status, e.created_at, e.updated_at, e.published_at, e.cover_mime, e.cover_data IS NOT NULL AS has_cover, c.slug AS category_slug, c.name AS category_name, p.slug AS organizer_slug, p.name AS organizer_name, p.bio AS organizer_bio, p.whatsapp AS organizer_whatsapp, p.avatar_data IS NOT NULL AS has_avatar, p.suspended_at IS NOT NULL AS organizer_suspended"
EVENT_FROM = " FROM events e JOIN event_categories c ON c.id=e.category_id JOIN organizer_profiles p ON p.user_id=e.organizer_id"


@contextmanager
def connection():
    try:
        conn = psycopg2.connect(settings.DATABASE_URL, connect_timeout=5, cursor_factory=RealDictCursor)
    except psycopg2.Error:
        raise HTTPException(503, "Event database tidak tersedia.")
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def query_one(cursor, sql, params=()):
    cursor.execute(sql, params)
    return cursor.fetchone()


def serialize(row):
    if row is None:
        return None
    result = dict(row)
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result


def public_event(row):
    result = serialize(row)
    result.pop("meeting_link", None)
    result.pop("organizer_suspended", None)
    return result


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=16384, r=8, p=1)
    return f"scrypt$16384${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, n, salt, digest = stored.split("$")
        actual = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=int(n), r=8, p=1)
        return hmac.compare_digest(actual, bytes.fromhex(digest))
    except (ValueError, TypeError):
        return False


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    return forwarded if re.fullmatch(r"[0-9a-fA-F:.]{3,45}", forwarded) else (request.client.host if request.client else "unknown")


def current_user(cursor, authorization: str, required=True):
    token = authorization.removeprefix("Bearer ") if authorization.startswith("Bearer ") else ""
    if not re.fullmatch(r"[a-f0-9]{64}", token):
        if required:
            raise HTTPException(401, "Silakan masuk terlebih dahulu.")
        return None
    row = query_one(cursor, "SELECT u.id, u.email, u.suspended_at, p.slug AS organizer_slug, p.suspended_at AS organizer_suspended_at FROM event_sessions s JOIN event_users u ON u.id=s.user_id LEFT JOIN organizer_profiles p ON p.user_id=u.id WHERE s.token_hash=%s AND s.expires_at>now()", (token_hash(token),))
    if not row or row["suspended_at"]:
        if required:
            raise HTTPException(401, "Sesi tidak valid atau akun ditangguhkan.")
        return None
    return row


def admin_key(value: str):
    if not settings.ADMIN_API_KEY or not hmac.compare_digest(value, settings.ADMIN_API_KEY):
        raise HTTPException(403, "Akses admin diperlukan.")


def slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:70].strip("-")
    return slug or "event"


def decode_image(value: str | None, limit=2_000_000):
    if value is None:
        return None, None
    match = re.fullmatch(r"data:(image/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)", value)
    if not match or len(match.group(2)) > limit * 4 // 3 + 8:
        raise HTTPException(422, "Gambar harus JPEG, PNG, atau WebP maksimal 2 MB.")
    try:
        data = base64.b64decode(match.group(2), validate=True)
    except ValueError:
        raise HTTPException(422, "Data gambar tidak valid.")
    mime = match.group(1)
    if len(data) > limit or not data.startswith(IMAGE_TYPES[mime]) or (mime == "image/webp" and data[8:12] != b"WEBP"):
        raise HTTPException(422, "Berkas gambar tidak valid.")
    return data, mime


class Credentials(BaseModel):
    email: str = Field(min_length=5, max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str = Field(min_length=10, max_length=128)


class ProfileInput(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    bio: str = Field(default="", max_length=1000)
    whatsapp: str = Field(pattern=r"^[1-9][0-9]{7,14}$")
    avatar: str | None = None


class EventInput(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=20, max_length=10000)
    category: str
    startsAt: datetime
    endsAt: datetime
    timezone: str
    locationType: str
    venueName: str = Field(default="", max_length=150)
    address: str = Field(default="", max_length=300)
    meetingLink: str = ""
    capacity: int = Field(gt=0, le=100000)
    confirmedCount: int = Field(default=0, ge=0)
    isPaid: bool = False
    price: int = Field(default=0, ge=0)
    whatsapp: str = Field(pattern=r"^[1-9][0-9]{7,14}$")
    instructions: str = Field(default="", max_length=2000)
    registrationStatus: str = "open"
    cover: str | None = None


def validate_event(payload: EventInput, cursor):
    if payload.startsAt.tzinfo is None or payload.endsAt.tzinfo is None or payload.endsAt <= payload.startsAt:
        raise HTTPException(422, "Waktu event tidak valid.")
    try:
        ZoneInfo(payload.timezone)
    except ZoneInfoNotFoundError:
        raise HTTPException(422, "Timezone tidak valid.")
    if payload.locationType not in ("offline", "online"):
        raise HTTPException(422, "Jenis lokasi tidak valid.")
    if payload.locationType == "offline" and (not payload.venueName.strip() or not payload.address.strip()):
        raise HTTPException(422, "Nama tempat dan alamat wajib diisi.")
    if payload.locationType == "online" and not re.fullmatch(r"https://[^\s]+", payload.meetingLink):
        raise HTTPException(422, "Meeting link harus HTTPS.")
    if payload.isPaid != (payload.price > 0) or payload.confirmedCount > payload.capacity:
        raise HTTPException(422, "Harga atau kapasitas tidak valid.")
    if payload.registrationStatus not in ("open", "full", "closed"):
        raise HTTPException(422, "Status pendaftaran tidak valid.")
    category = query_one(cursor, "SELECT id FROM event_categories WHERE slug=%s AND active", (payload.category,))
    if not category:
        raise HTTPException(422, "Kategori tidak tersedia.")
    return category["id"]


def audit(cursor, event_id, actor_id, role, action, details=None):
    cursor.execute("INSERT INTO event_audit_logs(event_id,actor_id,actor_role,action,details) VALUES (%s,%s,%s,%s,%s)", (event_id, actor_id, role, action, Json(details or {})))


def own_event(cursor, event_id, user):
    row = query_one(cursor, "SELECT * FROM events WHERE id=%s AND organizer_id=%s FOR UPDATE", (event_id, user["id"]))
    if not row:
        raise HTTPException(404, "Event tidak ditemukan.")
    if user["organizer_suspended_at"]:
        raise HTTPException(403, "Organizer ditangguhkan.")
    return row


def event_row(cursor, condition, params):
    return query_one(cursor, "SELECT " + EVENT_FIELDS + EVENT_FROM + " WHERE " + condition, params)


@router.post("/auth/register")
def register(payload: Credentials, request: Request):
    email = payload.email.lower().strip()
    register_key = token_hash("register:" + client_ip(request))
    with connection() as conn, conn.cursor() as cur:
        attempt = query_one(cur, "SELECT attempts,window_started_at FROM event_login_attempts WHERE key_hash=%s FOR UPDATE", (register_key,))
        if attempt and attempt["attempts"] >= 5 and attempt["window_started_at"] > datetime.now(timezone.utc)-timedelta(hours=1):
            raise HTTPException(429, "Batas pembuatan akun tercapai. Coba lagi nanti.")
        cur.execute("INSERT INTO event_login_attempts(key_hash,attempts,window_started_at) VALUES (%s,1,now()) ON CONFLICT(key_hash) DO UPDATE SET attempts=CASE WHEN event_login_attempts.window_started_at<now()-interval '1 hour' THEN 1 ELSE event_login_attempts.attempts+1 END,window_started_at=CASE WHEN event_login_attempts.window_started_at<now()-interval '1 hour' THEN now() ELSE event_login_attempts.window_started_at END", (register_key,))
    with connection() as conn, conn.cursor() as cur:
        try:
            row = query_one(cur, "INSERT INTO event_users(email,password_hash) VALUES (%s,%s) RETURNING id,email", (email, hash_password(payload.password)))
        except psycopg2.errors.UniqueViolation:
            raise HTTPException(409, "Email sudah digunakan.")
        token = secrets.token_hex(32)
        cur.execute("INSERT INTO event_sessions(token_hash,user_id,expires_at) VALUES (%s,%s,now()+interval '7 days')", (token_hash(token), row["id"]))
        return {"token": token, "user": serialize(row)}


@router.post("/auth/login")
def login(payload: Credentials, request: Request):
    email = payload.email.lower().strip()
    key = token_hash(client_ip(request) + ":" + email)
    with connection() as conn, conn.cursor() as cur:
        attempts = query_one(cur, "SELECT attempts, window_started_at FROM event_login_attempts WHERE key_hash=%s FOR UPDATE", (key,))
        if attempts and attempts["attempts"] >= 5 and attempts["window_started_at"] > datetime.now(timezone.utc)-timedelta(minutes=15):
            raise HTTPException(429, "Terlalu banyak percobaan. Coba lagi nanti.")
        user = query_one(cur, "SELECT id,email,password_hash,suspended_at FROM event_users WHERE email=%s", (email,))
        if not user or not verify_password(payload.password, user["password_hash"]) or user["suspended_at"]:
            cur.execute("INSERT INTO event_login_attempts(key_hash,attempts,window_started_at) VALUES (%s,1,now()) ON CONFLICT(key_hash) DO UPDATE SET attempts=CASE WHEN event_login_attempts.window_started_at<now()-interval '15 minutes' THEN 1 ELSE event_login_attempts.attempts+1 END, window_started_at=CASE WHEN event_login_attempts.window_started_at<now()-interval '15 minutes' THEN now() ELSE event_login_attempts.window_started_at END", (key,))
            conn.commit()
            raise HTTPException(401, "Email atau password tidak sesuai.")
        cur.execute("DELETE FROM event_login_attempts WHERE key_hash=%s", (key,))
        token = secrets.token_hex(32)
        cur.execute("INSERT INTO event_sessions(token_hash,user_id,expires_at) VALUES (%s,%s,now()+interval '7 days')", (token_hash(token), user["id"]))
        return {"token": token, "user": {"id": str(user["id"]), "email": user["email"]}}


@router.get("/auth/me")
def me(authorization: str = Header(default="")):
    with connection() as conn, conn.cursor() as cur:
        user = current_user(cur, authorization)
        return serialize(user)


@router.post("/auth/logout")
def logout(authorization: str = Header(default="")):
    token = authorization.removeprefix("Bearer ")
    with connection() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM event_sessions WHERE token_hash=%s", (token_hash(token),))
    return {"ok": True}


@router.get("/categories")
def categories():
    with connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT slug,name FROM event_categories WHERE active ORDER BY name")
        return [dict(row) for row in cur.fetchall()]


@router.get("/profile/me")
def my_profile(authorization: str = Header(default="")):
    with connection() as conn, conn.cursor() as cur:
        user = current_user(cur, authorization)
        row = query_one(cur, "SELECT slug,name,bio,whatsapp,avatar_data IS NOT NULL AS has_avatar,suspended_at FROM organizer_profiles WHERE user_id=%s", (user["id"],))
        return serialize(row)


@router.put("/profile/me")
def update_profile(payload: ProfileInput, authorization: str = Header(default="")):
    image, mime = decode_image(payload.avatar)
    with connection() as conn, conn.cursor() as cur:
        user = current_user(cur, authorization)
        if user["organizer_suspended_at"]:
            raise HTTPException(403, "Organizer ditangguhkan.")
        slug = user["organizer_slug"] or f"{slugify(payload.name)}-{str(user['id'])[:8]}"
        row = query_one(cur, "INSERT INTO organizer_profiles(user_id,slug,name,bio,whatsapp,avatar_data,avatar_mime) VALUES (%s,%s,%s,%s,%s,%s,%s) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,bio=excluded.bio,whatsapp=excluded.whatsapp,avatar_data=COALESCE(excluded.avatar_data,organizer_profiles.avatar_data),avatar_mime=COALESCE(excluded.avatar_mime,organizer_profiles.avatar_mime),updated_at=now() RETURNING slug,name,bio,whatsapp,avatar_data IS NOT NULL AS has_avatar", (user["id"], slug, payload.name.strip(), payload.bio.strip(), payload.whatsapp, image, mime))
        return serialize(row)


@router.get("/organizers/{slug}")
def public_organizer(slug: str):
    with connection() as conn, conn.cursor() as cur:
        profile = query_one(cur, "SELECT slug,name,bio,avatar_data IS NOT NULL AS has_avatar FROM organizer_profiles WHERE slug=%s AND suspended_at IS NULL", (slug,))
        if not profile:
            raise HTTPException(404, "Organizer tidak ditemukan.")
        cur.execute("SELECT " + EVENT_FIELDS + EVENT_FROM + " WHERE p.slug=%s AND e.status='published' AND e.moderation_status='visible' ORDER BY e.starts_at DESC LIMIT 50", (slug,))
        return {"profile": serialize(profile), "events": [public_event(row) for row in cur.fetchall()]}


@router.get("/images/{kind}/{identifier}")
def image(kind: str, identifier: str):
    if kind not in ("event", "organizer"):
        raise HTTPException(404)
    with connection() as conn, conn.cursor() as cur:
        if kind == "event":
            row = query_one(cur, "SELECT e.cover_data AS data,e.cover_mime AS mime FROM events e JOIN organizer_profiles p ON p.user_id=e.organizer_id WHERE e.id=%s AND e.status IN ('published','cancelled','completed') AND e.moderation_status='visible' AND p.suspended_at IS NULL", (identifier,))
        else:
            row = query_one(cur, "SELECT avatar_data AS data,avatar_mime AS mime FROM organizer_profiles WHERE slug=%s AND suspended_at IS NULL", (identifier,))
        if not row or not row["data"]:
            raise HTTPException(404)
        return Response(bytes(row["data"]), media_type=row["mime"], headers={"Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff"})


@router.get("")
@router.get("/list")
def list_events(q: str = "", category: str = "", location: str = "", price: str = "", date_from: str = "", date_to: str = "", period: str = "upcoming", page: int = 1):
    if len(q) > 100 or len(location) > 100 or page < 1 or page > 1000 or price not in ("", "free", "paid") or period not in ("upcoming", "past"):
        raise HTTPException(422, "Filter tidak valid.")
    conditions = ["e.status='published'" if period == "upcoming" else "e.status IN ('published','cancelled','completed')", "e.moderation_status='visible'", "p.suspended_at IS NULL", "e.starts_at >= now()" if period == "upcoming" else "e.starts_at < now()"]
    params = []
    if q:
        conditions.append("(e.title ILIKE %s OR e.description ILIKE %s)")
        params.extend([f"%{q}%", f"%{q}%"])
    if category:
        conditions.append("c.slug=%s")
        params.append(category)
    if location:
        conditions.append("(e.venue_name ILIKE %s OR e.address ILIKE %s)")
        params.extend([f"%{location}%", f"%{location}%"])
    if price:
        conditions.append("e.is_paid=%s")
        params.append(price == "paid")
    for value, operator in ((date_from, ">="), (date_to, "<=")):
        if value:
            try:
                datetime.strptime(value, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(422, "Tanggal filter tidak valid.")
            conditions.append(f"e.starts_at::date {operator} %s")
            params.append(value)
    where = " AND ".join(conditions)
    with connection() as conn, conn.cursor() as cur:
        total = query_one(cur, "SELECT count(*) AS count" + EVENT_FROM + " WHERE " + where, params)["count"]
        cur.execute("SELECT " + EVENT_FIELDS + EVENT_FROM + " WHERE " + where + (" ORDER BY e.starts_at ASC" if period == "upcoming" else " ORDER BY e.starts_at DESC") + " LIMIT 12 OFFSET %s", [*params, (page-1)*12])
        return {"items": [public_event(row) for row in cur.fetchall()], "total": total, "page": page}


@router.get("/my")
def my_events(authorization: str = Header(default="")):
    with connection() as conn, conn.cursor() as cur:
        user = current_user(cur, authorization)
        cur.execute("SELECT " + EVENT_FIELDS + EVENT_FROM + " WHERE e.organizer_id=%s ORDER BY e.created_at DESC", (user["id"],))
        return [serialize(row) for row in cur.fetchall()]


@router.get("/detail/{slug}")
def detail(slug: str, authorization: str = Header(default="")):
    with connection() as conn, conn.cursor() as cur:
        user = current_user(cur, authorization, required=False)
        row = event_row(cur, "e.slug=%s", (slug,))
        public_status = row and row["status"] in ("published", "cancelled", "completed")
        if not row or (not public_status and (not user or str(user["id"]) != str(query_one(cur, "SELECT organizer_id FROM events WHERE slug=%s", (slug,))["organizer_id"]))):
            raise HTTPException(404, "Event tidak ditemukan.")
        if row["moderation_status"] != "visible" or row["organizer_suspended"]:
            raise HTTPException(404, "Event tidak tersedia.")
        cur.execute("SELECT " + EVENT_FIELDS + EVENT_FROM + " WHERE e.id<>%s AND e.category_id=(SELECT category_id FROM events WHERE slug=%s) AND e.status='published' AND e.moderation_status='visible' AND p.suspended_at IS NULL AND e.starts_at>now() ORDER BY e.starts_at LIMIT 3", (row["id"], slug))
        return {"event": public_event(row), "related": [public_event(item) for item in cur.fetchall()]}


@router.post("")
@router.post("/list")
def create_event(payload: EventInput, authorization: str = Header(default="")):
    image, mime = decode_image(payload.cover)
    with connection() as conn, conn.cursor() as cur:
        user = current_user(cur, authorization)
        if not user["organizer_slug"] or user["organizer_suspended_at"]:
            raise HTTPException(403, "Lengkapi profil organizer yang aktif terlebih dahulu.")
        category_id = validate_event(payload, cur)
        slug = f"{slugify(payload.title)}-{secrets.token_hex(4)}"
        row = query_one(cur, "INSERT INTO events(organizer_id,category_id,slug,title,description,cover_data,cover_mime,starts_at,ends_at,timezone,location_type,venue_name,address,meeting_link,capacity,confirmed_count,is_paid,price,whatsapp,instructions,registration_status) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id,slug,status", (user["id"], category_id, slug, payload.title.strip(), payload.description.strip(), image, mime, payload.startsAt, payload.endsAt, payload.timezone, payload.locationType, payload.venueName.strip(), payload.address.strip(), payload.meetingLink.strip(), payload.capacity, payload.confirmedCount, payload.isPaid, payload.price, payload.whatsapp, payload.instructions.strip(), payload.registrationStatus))
        audit(cur, row["id"], user["id"], "organizer", "create")
        return serialize(row)


@router.patch("/{event_id}")
def edit_event(event_id: str, payload: EventInput, authorization: str = Header(default="")):
    image, mime = decode_image(payload.cover)
    with connection() as conn, conn.cursor() as cur:
        user = current_user(cur, authorization)
        original = own_event(cur, event_id, user)
        if original["status"] in ("cancelled", "completed") or original["moderation_status"] != "visible":
            raise HTTPException(409, "Event ini tidak dapat diedit.")
        category_id = validate_event(payload, cur)
        cur.execute("UPDATE events SET category_id=%s,title=%s,description=%s,cover_data=COALESCE(%s,cover_data),cover_mime=COALESCE(%s,cover_mime),starts_at=%s,ends_at=%s,timezone=%s,location_type=%s,venue_name=%s,address=%s,meeting_link=%s,capacity=%s,confirmed_count=%s,is_paid=%s,price=%s,whatsapp=%s,instructions=%s,registration_status=%s,updated_at=now() WHERE id=%s", (category_id, payload.title.strip(), payload.description.strip(), image, mime, payload.startsAt, payload.endsAt, payload.timezone, payload.locationType, payload.venueName.strip(), payload.address.strip(), payload.meetingLink.strip(), payload.capacity, payload.confirmedCount, payload.isPaid, payload.price, payload.whatsapp, payload.instructions.strip(), payload.registrationStatus, event_id))
        audit(cur, event_id, user["id"], "organizer", "edit")
        return {"ok": True}


@router.post("/{event_id}/status/{action}")
def change_status(event_id: str, action: str, authorization: str = Header(default="")):
    if action not in ("publish", "unpublish", "cancel", "complete"):
        raise HTTPException(422, "Aksi tidak valid.")
    with connection() as conn, conn.cursor() as cur:
        user = current_user(cur, authorization)
        event = own_event(cur, event_id, user)
        if event["moderation_status"] != "visible":
            raise HTTPException(409, "Moderasi admin mencegah perubahan status.")
        allowed = {"publish": ("draft",), "unpublish": ("published",), "cancel": ("published",), "complete": ("published",)}
        if event["status"] not in allowed[action] or (action == "publish" and event["ends_at"] <= datetime.now(timezone.utc)):
            raise HTTPException(409, "Transisi status tidak valid.")
        next_status = {"publish": "published", "unpublish": "draft", "cancel": "cancelled", "complete": "completed"}[action]
        cur.execute("UPDATE events SET status=%s, updated_at=now(), published_at=CASE WHEN %s='published' THEN now() ELSE published_at END WHERE id=%s", (next_status, next_status, event_id))
        audit(cur, event_id, user["id"], "organizer", action)
        return {"status": next_status}


@router.delete("/{event_id}")
def delete_draft(event_id: str, authorization: str = Header(default="")):
    with connection() as conn, conn.cursor() as cur:
        user = current_user(cur, authorization)
        event = own_event(cur, event_id, user)
        if event["status"] != "draft" or event["published_at"]:
            raise HTTPException(409, "Hanya draft yang belum pernah terbit dapat dihapus.")
        audit(cur, event_id, user["id"], "organizer", "delete_draft", {"slug": event["slug"]})
        cur.execute("DELETE FROM events WHERE id=%s", (event_id,))
        return {"ok": True}


def whatsapp_url(event):
    local = event["starts_at"].astimezone(ZoneInfo(event["timezone"]))
    location = event["venue_name"] + ", " + event["address"] if event["location_type"] == "offline" else "Online"
    message = f"Halo, saya ingin mendaftar event berikut:\n\nEvent: {event['title']}\nTanggal: {local:%d-%m-%Y}\nWaktu: {local:%H:%M} ({event['timezone']})\nLokasi: {location}\nOrganizer: {event['organizer_name']}\n\nNama:\nJumlah Peserta:\n\nMohon informasi ketersediaan slot dan konfirmasi pendaftaran. Terima kasih."
    return f"https://wa.me/{event['whatsapp']}?text={quote(message, safe='')}"


@router.post("/{event_id}/whatsapp")
def whatsapp_handoff(event_id: str):
    with connection() as conn, conn.cursor() as cur:
        event = event_row(cur, "e.id=%s AND e.status='published' AND e.moderation_status='visible' AND p.suspended_at IS NULL", (event_id,))
        if not event:
            raise HTTPException(404, "Event tidak tersedia.")
        if event["registration_status"] != "open" or event["confirmed_count"] >= event["capacity"] or event["ends_at"] <= datetime.now(timezone.utc):
            raise HTTPException(409, "Pendaftaran tidak tersedia.")
        cur.execute("INSERT INTO event_whatsapp_clicks(event_id) VALUES (%s)", (event_id,))
        return {"url": whatsapp_url(event)}


@router.post("/{event_id}/report")
def report_event(event_id: str, payload: dict, request: Request):
    reason = str(payload.get("reason", "")).strip()
    if len(reason) < 10 or len(reason) > 1000:
        raise HTTPException(422, "Alasan laporan harus 10–1000 karakter.")
    reporter_hash = token_hash(client_ip(request) + ":" + event_id)
    with connection() as conn, conn.cursor() as cur:
        event = query_one(cur, "SELECT id FROM events WHERE id=%s AND status='published' AND moderation_status='visible'", (event_id,))
        if not event:
            raise HTTPException(404, "Event tidak ditemukan.")
        recent = query_one(cur, "SELECT count(*) AS count FROM event_reports WHERE reporter_hash=%s AND created_at>now()-interval '1 day'", (reporter_hash,))
        if recent["count"] >= 3:
            raise HTTPException(429, "Batas laporan tercapai.")
        cur.execute("INSERT INTO event_reports(event_id,reason,reporter_hash) VALUES (%s,%s,%s)", (event_id, reason, reporter_hash))
        return {"ok": True}


@router.get("/manage/{event_id}/stats")
def stats(event_id: str, authorization: str = Header(default="")):
    with connection() as conn, conn.cursor() as cur:
        user = current_user(cur, authorization)
        event = own_event(cur, event_id, user)
        count = query_one(cur, "SELECT count(*) AS whatsapp_clicks FROM event_whatsapp_clicks WHERE event_id=%s", (event_id,))
        return {"whatsappClicks": count["whatsapp_clicks"], "confirmedCount": event["confirmed_count"], "capacity": event["capacity"]}


@router.get("/admin/all")
def admin_events(x_admin_key: str = Header(default="")):
    admin_key(x_admin_key)
    with connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT " + EVENT_FIELDS + EVENT_FROM + " ORDER BY e.created_at DESC LIMIT 200")
        return [serialize(row) for row in cur.fetchall()]


@router.get("/admin/reports")
def admin_reports(x_admin_key: str = Header(default="")):
    admin_key(x_admin_key)
    with connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT r.id,r.event_id,r.reason,r.status,r.created_at,e.title,e.slug FROM event_reports r JOIN events e ON e.id=r.event_id ORDER BY r.created_at DESC LIMIT 200")
        return [serialize(row) for row in cur.fetchall()]


@router.get("/admin/audit")
def admin_audit(x_admin_key: str = Header(default="")):
    admin_key(x_admin_key)
    with connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT id,event_id,actor_role,action,details,created_at FROM event_audit_logs ORDER BY id DESC LIMIT 200")
        return [serialize(row) for row in cur.fetchall()]


@router.get("/admin/categories")
def admin_categories(x_admin_key: str = Header(default="")):
    admin_key(x_admin_key)
    with connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT slug,name,active FROM event_categories ORDER BY name")
        return [dict(row) for row in cur.fetchall()]


@router.patch("/admin/reports/{report_id}")
def review_report(report_id: str, payload: dict, x_admin_key: str = Header(default="")):
    admin_key(x_admin_key)
    status = payload.get("status")
    if status not in ("reviewed", "dismissed"):
        raise HTTPException(422, "Status laporan tidak valid.")
    with connection() as conn, conn.cursor() as cur:
        row = query_one(cur, "UPDATE event_reports SET status=%s,reviewed_at=now() WHERE id=%s RETURNING event_id", (status, report_id))
        if not row:
            raise HTTPException(404, "Laporan tidak ditemukan.")
        audit(cur, row["event_id"], None, "admin", "review_report", {"status": status})
        return {"status": status}


@router.patch("/admin/events/{event_id}")
def moderate_event(event_id: str, payload: dict, x_admin_key: str = Header(default="")):
    admin_key(x_admin_key)
    status = payload.get("moderationStatus")
    if status not in ("visible", "hidden", "suspended"):
        raise HTTPException(422, "Status moderasi tidak valid.")
    with connection() as conn, conn.cursor() as cur:
        row = query_one(cur, "UPDATE events SET moderation_status=%s,updated_at=now() WHERE id=%s RETURNING id", (status, event_id))
        if not row:
            raise HTTPException(404, "Event tidak ditemukan.")
        audit(cur, event_id, None, "admin", "moderate", {"status": status})
        return {"moderationStatus": status}


@router.patch("/admin/organizers/{slug}")
def suspend_organizer(slug: str, payload: dict, x_admin_key: str = Header(default="")):
    admin_key(x_admin_key)
    if type(payload.get("suspended")) is not bool:
        raise HTTPException(422, "Status organizer tidak valid.")
    with connection() as conn, conn.cursor() as cur:
        row = query_one(cur, "UPDATE organizer_profiles SET suspended_at=CASE WHEN %s THEN now() ELSE NULL END,updated_at=now() WHERE slug=%s RETURNING user_id", (payload["suspended"], slug))
        if not row:
            raise HTTPException(404, "Organizer tidak ditemukan.")
        audit(cur, None, row["user_id"], "admin", "suspend_organizer" if payload["suspended"] else "restore_organizer", {"slug": slug})
        return {"suspended": payload["suspended"]}


@router.post("/admin/categories")
def admin_category(payload: dict, x_admin_key: str = Header(default="")):
    admin_key(x_admin_key)
    name = str(payload.get("name", "")).strip()
    slug = slugify(name)
    if len(name) < 2 or len(name) > 80 or not SLUG.fullmatch(slug):
        raise HTTPException(422, "Kategori tidak valid.")
    with connection() as conn, conn.cursor() as cur:
        try:
            row = query_one(cur, "INSERT INTO event_categories(name,slug) VALUES (%s,%s) RETURNING id,slug,name", (name, slug))
        except psycopg2.errors.UniqueViolation:
            raise HTTPException(409, "Kategori sudah ada.")
        audit(cur, None, None, "admin", "create_category", {"slug": slug})
        return serialize(row)


@router.patch("/admin/categories/{slug}")
def update_category(slug: str, payload: dict, x_admin_key: str = Header(default="")):
    admin_key(x_admin_key)
    if type(payload.get("active")) is not bool:
        raise HTTPException(422, "Status kategori tidak valid.")
    with connection() as conn, conn.cursor() as cur:
        row = query_one(cur, "UPDATE event_categories SET active=%s WHERE slug=%s RETURNING slug,name,active", (payload["active"], slug))
        if not row:
            raise HTTPException(404, "Kategori tidak ditemukan.")
        audit(cur, None, None, "admin", "update_category", {"slug": slug, "active": payload["active"]})
        return serialize(row)
