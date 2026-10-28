"""Customer identity. Sessions and one-use email tokens are stored only as hashes."""
import hashlib
import logging
import os
import re
import secrets
import smtplib
import ssl
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from pathlib import Path

import httpx
import psycopg2
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
from authlib.jose import jwt
from fastapi import APIRouter, Header, HTTPException, Request
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, Field

from .config import settings

router = APIRouter(prefix="/api/customer", tags=["customer"])
oauth_logger = logging.getLogger("customer.oauth")
password_hasher = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=2)
DUMMY_HASH = password_hasher.hash("dummy-password-never-used")
EMAIL = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
PHONE = r"^[1-9][0-9]{7,14}$"
SESSION_DAYS = 7


@contextmanager
def connection():
    try:
        db = psycopg2.connect(settings.DATABASE_URL, connect_timeout=5, cursor_factory=RealDictCursor)
    except psycopg2.Error as error:
        raise HTTPException(503, "Database pelanggan tidak tersedia.") from error
    try:
        with db:
            yield db
    finally:
        db.close()


def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def one(cur, query, args=()):
    cur.execute(query, args)
    return cur.fetchone()


def email_address(value: str) -> str:
    result = value.strip().lower()
    if len(result) > 254 or not re.fullmatch(EMAIL, result):
        raise HTTPException(422, "Email tidak valid.")
    return result


def rate_limit(cur, key: str, limit: int = 5, minutes: int = 15):
    hashed = digest(key)
    row = one(cur, "SELECT attempts,window_started_at FROM customer_auth_attempts WHERE key_hash=%s FOR UPDATE", (hashed,))
    now = datetime.now(timezone.utc)
    if row and row["window_started_at"] > now - timedelta(minutes=minutes) and row["attempts"] >= limit:
        raise HTTPException(429, "Terlalu banyak percobaan. Coba lagi nanti.")
    cur.execute(
        "INSERT INTO customer_auth_attempts(key_hash,attempts,window_started_at) VALUES (%s,1,now()) "
        "ON CONFLICT(key_hash) DO UPDATE SET attempts=CASE WHEN customer_auth_attempts.window_started_at<now()-(%s * interval '1 minute') "
        "THEN 1 ELSE customer_auth_attempts.attempts+1 END,window_started_at=CASE WHEN customer_auth_attempts.window_started_at<now()-(%s * interval '1 minute') "
        "THEN now() ELSE customer_auth_attempts.window_started_at END",
        (hashed, minutes, minutes),
    )


def session(cur, user_id: str) -> str:
    token = secrets.token_hex(32)
    cur.execute(
        "INSERT INTO customer_sessions(token_hash,user_id,expires_at) VALUES (%s,%s,now()+interval '7 days')",
        (digest(token), user_id),
    )
    return token


def current_user(cur, authorization: str):
    token = authorization.removeprefix("Bearer ") if authorization.startswith("Bearer ") else ""
    if not re.fullmatch(r"[0-9a-f]{64}", token):
        raise HTTPException(401, "Silakan masuk terlebih dahulu.")
    user = one(cur, "SELECT u.id,u.email,u.role,u.email_verified_at,u.google_sub,u.created_at,p.display_name,p.whatsapp "
               "FROM customer_sessions s JOIN customer_users u ON u.id=s.user_id "
               "LEFT JOIN customer_profiles p ON p.user_id=u.id "
               "WHERE s.token_hash=%s AND s.expires_at>now() AND u.disabled_at IS NULL", (digest(token),))
    if not user:
        raise HTTPException(401, "Sesi tidak valid.")
    return user


def public_user(user):
    return {
        "id": str(user["id"]), "email": user["email"],
        "role": user["role"],
        "emailVerified": bool(user["email_verified_at"]),
        "googleLinked": bool(user["google_sub"]),
        "createdAt": user["created_at"].isoformat(),
        "displayName": user["display_name"] or "",
        "whatsapp": user["whatsapp"] or "",
    }


def send_email(recipient: str, purpose: str, token: str):
    base = os.getenv("CUSTOMER_AUTH_URL", "").rstrip("/")
    if not base.startswith(("http://127.0.0.1:", "http://localhost:", "https://")):
        raise HTTPException(503, "URL autentikasi belum dikonfigurasi.")
    path = "verify-email" if purpose == "verify" else "reset-password"
    link = f"{base}/{path}#token={token}"
    smtp_host = os.getenv("CUSTOMER_SMTP_HOST", "")
    if not smtp_host and settings.ENVIRONMENT in {"development", "test"}:
        outbox = Path(os.getenv("CUSTOMER_DEV_OUTBOX", ".private/customer-auth-outbox"))
        outbox.mkdir(parents=True, exist_ok=True)
        (outbox / f"{purpose}-{secrets.token_hex(8)}.txt").write_text(f"{recipient}\n{link}\n", encoding="utf-8")
        return
    if not smtp_host:
        raise HTTPException(503, "Pengiriman email belum dikonfigurasi.")
    sender = os.getenv("CUSTOMER_SMTP_FROM", "")
    username = os.getenv("CUSTOMER_SMTP_USER", "")
    password = os.getenv("CUSTOMER_SMTP_PASSWORD", "")
    try:
        port = int(os.getenv("CUSTOMER_SMTP_PORT", "587"))
    except ValueError:
        raise HTTPException(503, "Konfigurasi email tidak valid.")
    if not sender or not username or not password or not 1 <= port <= 65535:
        raise HTTPException(503, "Konfigurasi email tidak lengkap.")
    message = EmailMessage()
    message["From"] = sender
    message["To"] = recipient
    message["Subject"] = "Verifikasi email | 52 Coffee & Roastery" if purpose == "verify" else "Atur ulang password | 52 Coffee & Roastery"
    action = "verifikasi alamat email" if purpose == "verify" else "atur ulang password"
    message.set_content(f"Halo,\n\nGunakan tautan ini untuk {action} akun 52 Coffee & Roastery:\n{link}\n\nTautan berlaku 30 menit dan hanya dapat digunakan sekali. Jika Anda tidak meminta ini, abaikan email ini.\n\n52 Coffee & Roastery")
    try:
        with smtplib.SMTP(smtp_host, port, timeout=10) as server:
            server.starttls(context=ssl.create_default_context())
            server.login(username, password)
            server.send_message(message)
    except (OSError, smtplib.SMTPException) as error:
        raise HTTPException(503, "Email belum dapat dikirim.") from error


def issue_email_token(cur, user_id: str, email: str, purpose: str):
    token = secrets.token_urlsafe(32)
    cur.execute("INSERT INTO customer_auth_tokens(token_hash,user_id,purpose,expires_at) VALUES (%s,%s,%s,now()+interval '30 minutes')",
                (digest(token), user_id, purpose))
    send_email(email, purpose, token)


class Register(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=12, max_length=128)
    displayName: str = Field(min_length=2, max_length=100)


class Credentials(BaseModel):
    email: str
    password: str


class EmailInput(BaseModel):
    email: str


class TokenInput(BaseModel):
    token: str = Field(min_length=32, max_length=200)


class ResetInput(TokenInput):
    password: str = Field(min_length=12, max_length=128)


@router.post("/auth/register", status_code=202)
def register(payload: Register, request: Request):
    email = email_address(payload.email)
    with connection() as db, db.cursor() as cur:
        host = request.client.host if request.client else "unknown"
        rate_limit(cur, "register-ip:" + host, 30, 60)
        rate_limit(cur, "register-email:" + email + ":" + host, 3, 60)
        db.commit()
        row = one(cur, "SELECT id FROM customer_users WHERE email=%s", (email,))
        if not row:
            row = one(cur, "INSERT INTO customer_users(email,password_hash) VALUES (%s,%s) ON CONFLICT(email) DO NOTHING RETURNING id",
                      (email, password_hasher.hash(payload.password)))
            if row:
                cur.execute("INSERT INTO customer_profiles(user_id,display_name) VALUES (%s,%s)",
                            (row["id"], payload.displayName.strip()))
                issue_email_token(cur, str(row["id"]), email, "verify")
    return {"message": "Jika email dapat digunakan, tautan verifikasi telah dikirim."}


@router.post("/auth/verify")
def verify_email(payload: TokenInput):
    with connection() as db, db.cursor() as cur:
        row = one(cur, "SELECT user_id FROM customer_auth_tokens WHERE token_hash=%s AND purpose='verify' "
                  "AND used_at IS NULL AND expires_at>now() FOR UPDATE", (digest(payload.token),))
        if not row:
            raise HTTPException(400, "Tautan tidak valid atau kedaluwarsa.")
        cur.execute("UPDATE customer_users SET email_verified_at=now() WHERE id=%s", (row["user_id"],))
        cur.execute("UPDATE customer_auth_tokens SET used_at=now() WHERE token_hash=%s", (digest(payload.token),))
    return {"ok": True}


@router.post("/auth/resend", status_code=202)
def resend_verification(payload: EmailInput, request: Request):
    email = email_address(payload.email)
    with connection() as db, db.cursor() as cur:
        rate_limit(cur, "resend:" + email + ":" + (request.client.host if request.client else "unknown"), 3, 60)
        db.commit()
        user = one(cur, "SELECT id FROM customer_users WHERE email=%s AND email_verified_at IS NULL "
                   "AND disabled_at IS NULL", (email,))
        if user:
            issue_email_token(cur, str(user["id"]), email, "verify")
    return {"message": "Jika akun belum terverifikasi, tautan baru telah dikirim."}


@router.post("/auth/login")
def login(payload: Credentials, request: Request):
    email = email_address(payload.email)
    attempt_key = "login:" + email + ":" + (request.client.host if request.client else "unknown")
    with connection() as db, db.cursor() as cur:
        rate_limit(cur, attempt_key)
        db.commit()
        user = one(cur, "SELECT id,password_hash,email_verified_at,disabled_at FROM customer_users WHERE email=%s", (email,))
        try:
            stored = user["password_hash"] if user and user["password_hash"] else DUMMY_HASH
            matches = password_hasher.verify(stored, payload.password)
            valid = bool(user and user["password_hash"] and matches)
        except (VerifyMismatchError, VerificationError):
            valid = False
        if not valid or user["disabled_at"]:
            raise HTTPException(401, "Email atau password tidak sesuai.")
        if not user["email_verified_at"]:
            raise HTTPException(403, "Verifikasi email sebelum masuk.")
        cur.execute("DELETE FROM customer_auth_attempts WHERE key_hash=%s", (digest(attempt_key),))
        token = session(cur, str(user["id"]))
        return {"token": token}


@router.post("/auth/forgot", status_code=202)
def forgot(payload: EmailInput, request: Request):
    email = email_address(payload.email)
    with connection() as db, db.cursor() as cur:
        rate_limit(cur, "forgot:" + email + ":" + (request.client.host if request.client else "unknown"), 3, 60)
        db.commit()
        user = one(cur, "SELECT id FROM customer_users WHERE email=%s AND password_hash IS NOT NULL AND disabled_at IS NULL", (email,))
        if user:
            issue_email_token(cur, str(user["id"]), email, "reset")
    return {"message": "Jika akun ditemukan, tautan reset telah dikirim."}


@router.post("/auth/reset")
def reset_password(payload: ResetInput):
    with connection() as db, db.cursor() as cur:
        row = one(cur, "SELECT user_id FROM customer_auth_tokens WHERE token_hash=%s AND purpose='reset' "
                  "AND used_at IS NULL AND expires_at>now() FOR UPDATE", (digest(payload.token),))
        if not row:
            raise HTTPException(400, "Tautan tidak valid atau kedaluwarsa.")
        cur.execute("UPDATE customer_users SET password_hash=%s WHERE id=%s",
                    (password_hasher.hash(payload.password), row["user_id"]))
        cur.execute("DELETE FROM customer_sessions WHERE user_id=%s", (row["user_id"],))
        cur.execute("UPDATE customer_auth_tokens SET used_at=now() WHERE user_id=%s AND purpose='reset' AND used_at IS NULL",
                    (row["user_id"],))
    return {"ok": True}


@router.get("/auth/me")
def me(authorization: str = Header(default="")):
    with connection() as db, db.cursor() as cur:
        return public_user(current_user(cur, authorization))


@router.post("/auth/logout")
def logout(authorization: str = Header(default="")):
    token = authorization.removeprefix("Bearer ")
    with connection() as db, db.cursor() as cur:
        cur.execute("DELETE FROM customer_sessions WHERE token_hash=%s", (digest(token),))
    return {"ok": True}


class GoogleCode(BaseModel):
    code: str = Field(min_length=8, max_length=4096)
    codeVerifier: str = Field(min_length=43, max_length=128)
    redirectUri: str = Field(min_length=10, max_length=500)
    nonce: str = Field(min_length=16, max_length=128)
    link: bool = False


@router.post("/auth/google")
def google_exchange(payload: GoogleCode, authorization: str = Header(default="")):
    client_id = os.getenv("CUSTOMER_GOOGLE_CLIENT_ID", "")
    client_secret = os.getenv("CUSTOMER_GOOGLE_CLIENT_SECRET", "")
    expected_redirect = os.getenv("CUSTOMER_GOOGLE_REDIRECT_URI", "")
    if not client_id or not client_secret or not expected_redirect:
        oauth_logger.warning("google_oauth_failure stage=configuration reason=missing")
        raise HTTPException(503, "Google OAuth belum dikonfigurasi.", headers={"X-Customer-OAuth-Reason": "configuration_missing"})
    if payload.redirectUri != expected_redirect:
        oauth_logger.warning("google_oauth_failure stage=configuration reason=redirect_mismatch")
        raise HTTPException(503, "Google OAuth belum dikonfigurasi.", headers={"X-Customer-OAuth-Reason": "redirect_mismatch"})
    try:
        with httpx.Client(timeout=10) as client:
            response = client.post("https://oauth2.googleapis.com/token", data={
                "code": payload.code, "client_id": client_id, "client_secret": client_secret,
                "redirect_uri": expected_redirect, "grant_type": "authorization_code",
                "code_verifier": payload.codeVerifier,
            })
            if not response.is_success:
                try:
                    provider_reason = response.json().get("error", "")
                except (ValueError, AttributeError):
                    provider_reason = ""
                reason = provider_reason if provider_reason in {"invalid_client", "invalid_grant", "unauthorized_client", "invalid_request"} else "provider_error"
                oauth_logger.warning("google_oauth_failure stage=token_exchange reason=%s status=%s", reason, response.status_code)
                raise HTTPException(401, "Pertukaran kode Google gagal.", headers={"X-Customer-OAuth-Reason": reason})
            id_token = response.json()["id_token"]
            keys = client.get("https://www.googleapis.com/oauth2/v3/certs")
            if not keys.is_success:
                oauth_logger.warning("google_oauth_failure stage=jwks reason=provider_error status=%s", keys.status_code)
                raise HTTPException(503, "Kunci verifikasi Google tidak tersedia.", headers={"X-Customer-OAuth-Reason": "jwks_unavailable"})
        claims = jwt.decode(id_token, keys.json())
        claims.validate(leeway=30)
        if claims.get("aud") != client_id or claims.get("iss") not in {"https://accounts.google.com", "accounts.google.com"} \
                or claims.get("nonce") != payload.nonce or claims.get("email_verified") is not True or not claims.get("sub"):
            raise ValueError("invalid Google claims")
        email = email_address(claims["email"])
        sub = str(claims["sub"])
    except HTTPException:
        raise
    except httpx.RequestError as error:
        oauth_logger.warning("google_oauth_failure stage=provider_request reason=network_error")
        raise HTTPException(503, "Layanan Google tidak tersedia.", headers={"X-Customer-OAuth-Reason": "provider_unavailable"}) from error
    except Exception as error:
        oauth_logger.warning("google_oauth_failure stage=id_token reason=invalid_response")
        raise HTTPException(401, "Login Google tidak valid.", headers={"X-Customer-OAuth-Reason": "invalid_id_token"}) from error
    with connection() as db, db.cursor() as cur:
        if payload.link:
            user = current_user(cur, authorization)
            if not user["email_verified_at"] or user["email"] != email:
                oauth_logger.warning("google_oauth_failure stage=account_link reason=email_mismatch")
                raise HTTPException(409, "Email Google harus sama dengan email akun terverifikasi.")
            try:
                cur.execute("UPDATE customer_users SET google_sub=%s WHERE id=%s AND (google_sub IS NULL OR google_sub=%s)",
                            (sub, user["id"], sub))
            except psycopg2.errors.UniqueViolation as error:
                oauth_logger.warning("google_oauth_failure stage=account_link reason=already_linked")
                raise HTTPException(409, "Google sudah terhubung ke akun lain.") from error
            if cur.rowcount != 1:
                oauth_logger.warning("google_oauth_failure stage=account_link reason=different_google_identity")
                raise HTTPException(409, "Google lain sudah terhubung.")
            return {"linked": True}
        user = one(cur, "SELECT id,disabled_at FROM customer_users WHERE google_sub=%s", (sub,))
        if user and user["disabled_at"]:
            raise HTTPException(403, "Akun tidak aktif.")
        if not user:
            existing = one(cur, "SELECT id FROM customer_users WHERE email=%s", (email,))
            if existing:
                oauth_logger.warning("google_oauth_failure stage=account_login reason=link_required")
                raise HTTPException(409, "Masuk dengan password dahulu, lalu hubungkan Google dari akun.",
                                    headers={"X-Customer-OAuth-Reason": "account_link_required"})
            user = one(cur, "INSERT INTO customer_users(email,google_sub,email_verified_at) VALUES (%s,%s,now()) RETURNING id",
                       (email, sub))
            cur.execute("INSERT INTO customer_profiles(user_id,display_name) VALUES (%s,%s)",
                        (user["id"], str(claims.get("name") or email.split("@")[0])[:100]))
        return {"token": session(cur, str(user["id"]))}
