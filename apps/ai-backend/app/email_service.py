"""Transactional email service for 52 Coffee & Roastery.

Supports:
1. Resend REST API (via RESEND_API_KEY)
2. Standard SMTP (via CUSTOMER_SMTP_HOST / smtp.resend.com)
3. Local/Preview outbox fallback (.private/customer-auth-outbox)
"""
import logging
import os
import secrets
import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path
from typing import Optional

import httpx
from fastapi import HTTPException

from .config import settings

logger = logging.getLogger("email_service")


def format_rupiah(amount: int) -> str:
    """Format an integer amount to Indonesian Rupiah currency string."""
    try:
        formatted = f"{int(amount):,}".replace(",", ".")
        return f"Rp {formatted}"
    except (ValueError, TypeError):
        return f"Rp {amount}"


def get_auth_base_url() -> str:
    base = os.getenv("CUSTOMER_AUTH_URL", "").rstrip("/")
    if not base.startswith(("http://127.0.0.1:", "http://localhost:", "https://")):
        # Fallback to standard preview domain if not explicitly set
        return "https://52coffee-roastery-git-feature-custom-89ceb8-agnaputras-projects.vercel.app"
    return base


def get_sender() -> str:
    return os.getenv("RESEND_FROM") or os.getenv("CUSTOMER_SMTP_FROM") or "52 Coffee & Roastery <onboarding@resend.dev>"


def send_transactional_email(to: str, subject: str, html: str, text: str = "") -> dict:
    """Send transactional email via Resend API, SMTP relay, or dev outbox."""
    resend_key = os.getenv("RESEND_API_KEY", "").strip()
    smtp_host = os.getenv("CUSTOMER_SMTP_HOST", "").strip()
    sender = get_sender()

    # 1. Resend REST API (Recommended)
    if resend_key:
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {resend_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "from": sender,
                        "to": [to],
                        "subject": subject,
                        "html": html,
                        "text": text or html,
                    },
                )
                if not res.is_success:
                    logger.error("resend_api_failure status=%s body=%s", res.status_code, res.text)
                    error_detail = res.text
                    try:
                        err_json = res.json()
                        raw_msg = err_json.get("message", "")
                        if "only send testing emails to your own email address" in raw_msg:
                            error_detail = (
                                "Mode uji coba Resend (domain pengirim belum diverifikasi): "
                                "email saat ini hanya dapat dikirim ke email pemilik akun Resend. "
                                "Untuk mengirim ke semua pelanggan, verifikasi domain Anda di resend.com/domains."
                            )
                        elif raw_msg:
                            error_detail = raw_msg
                    except Exception:
                        pass
                    raise HTTPException(502, f"Gagal mengirim email via Resend: {error_detail}")
                data = res.json()
                logger.info("resend_email_sent id=%s recipient=%s", data.get("id"), to)
                return {"provider": "resend", "id": data.get("id")}
        except httpx.RequestError as error:
            logger.error("resend_network_error: %s", error)
            raise HTTPException(503, "Layanan Resend tidak dapat dijangkau.") from error

    # 2. Standard SMTP (Supports Resend SMTP relay or custom SMTP)
    if smtp_host:
        username = os.getenv("CUSTOMER_SMTP_USER", "").strip()
        password = os.getenv("CUSTOMER_SMTP_PASSWORD", "").strip()
        try:
            port = int(os.getenv("CUSTOMER_SMTP_PORT", "587"))
        except ValueError:
            raise HTTPException(503, "Port SMTP tidak valid.")

        if not username or not password:
            raise HTTPException(503, "Kredensial SMTP tidak lengkap.")

        msg = EmailMessage()
        msg["From"] = sender
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(text or "Silakan gunakan klien email yang mendukung HTML.")
        msg.add_alternative(html, subtype="html")

        try:
            with smtplib.SMTP(smtp_host, port, timeout=10) as server:
                server.starttls(context=ssl.create_default_context())
                server.login(username, password)
                server.send_message(msg)
            logger.info("smtp_email_sent recipient=%s host=%s", to, smtp_host)
            return {"provider": "smtp"}
        except (OSError, smtplib.SMTPException) as error:
            logger.error("smtp_delivery_failed: %s", error)
            raise HTTPException(503, "Email belum dapat dikirim via SMTP.") from error

    # 3. Fallback for Development & Preview Testing
    if settings.ENVIRONMENT in {"development", "test", "preview"} or os.getenv("CUSTOMER_COMMERCE_TEST_MODE") == "1":
        outbox = Path(os.getenv("CUSTOMER_DEV_OUTBOX", ".private/customer-auth-outbox"))
        outbox.mkdir(parents=True, exist_ok=True)
        filename = f"email-{secrets.token_hex(6)}.html"
        (outbox / filename).write_text(f"To: {to}\nSubject: {subject}\n\n{html}", encoding="utf-8")
        logger.info("dev_email_outbox_written file=%s recipient=%s", filename, to)
        return {"provider": "outbox", "file": filename}

    raise HTTPException(503, "Pengiriman email belum dikonfigurasi. Masukkan RESEND_API_KEY di Vercel.")


# ---------------------------------------------------------------------------
# Specific Transactional Templates
# ---------------------------------------------------------------------------

def send_verification_email(recipient: str, token: str) -> dict:
    base = get_auth_base_url()
    link = f"{base}/verify-email#token={token}"
    subject = "Verifikasi Alamat Email | 52 Coffee & Roastery"
    
    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #2C3136; }}
    .card {{ max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #DCE6EB; padding: 36px 32px; }}
    .header {{ text-align: center; border-bottom: 1px solid #EEF2F6; padding-bottom: 24px; margin-bottom: 24px; }}
    .brand {{ font-size: 18px; font-weight: 700; letter-spacing: 0.05em; color: #465C70; text-transform: uppercase; }}
    .subbrand {{ font-size: 11px; color: #8FB9BC; letter-spacing: 0.15em; font-weight: 600; margin-top: 4px; }}
    .title {{ font-size: 20px; font-weight: 700; color: #2C3136; margin-top: 0; margin-bottom: 12px; }}
    .content {{ font-size: 14px; line-height: 1.6; color: #4B5563; margin-bottom: 28px; }}
    .btn {{ display: inline-block; background-color: #465C70; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; }}
    .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #EEF2F6; font-size: 12px; color: #9CA3AF; line-height: 1.5; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">52 Coffee & Roastery</div>
      <div class="subbrand">Specialty Coffee • Malang</div>
    </div>
    <h1 class="title">Verifikasi Akun Pelanggan</h1>
    <div class="content">
      Halo,<br><br>
      Terima kasih telah mendaftar di <strong>52 Coffee & Roastery</strong>. Klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun:
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{link}" class="btn">Verifikasi Email Saya</a>
    </div>
    <div class="content" style="font-size: 12px; color: #6B7280;">
      Jika tombol di atas tidak berfungsi, salin dan buka tautan ini di browser Anda:<br>
      <a href="{link}" style="color: #465C70; word-break: break-all;">{link}</a>
    </div>
    <div class="footer">
      Tautan ini berlaku selama 30 menit. Jika Anda tidak merasa membuat akun ini, silakan abaikan email ini.<br><br>
      &copy; 52 Coffee & Roastery. Jl. Hayam Wuruk, Malang, Jawa Timur.
    </div>
  </div>
</body>
</html>
"""
    text = f"Halo,\n\nGunakan tautan ini untuk verifikasi alamat email akun 52 Coffee & Roastery:\n{link}\n\nTautan berlaku 30 menit. Jika Anda tidak mendaftar, abaikan pesan ini.\n\n52 Coffee & Roastery"
    return send_transactional_email(recipient, subject, html, text)


def send_password_reset_email(recipient: str, token: str) -> dict:
    base = get_auth_base_url()
    link = f"{base}/reset-password#token={token}"
    subject = "Atur Ulang Password | 52 Coffee & Roastery"
    
    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #2C3136; }}
    .card {{ max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #DCE6EB; padding: 36px 32px; }}
    .header {{ text-align: center; border-bottom: 1px solid #EEF2F6; padding-bottom: 24px; margin-bottom: 24px; }}
    .brand {{ font-size: 18px; font-weight: 700; letter-spacing: 0.05em; color: #465C70; text-transform: uppercase; }}
    .title {{ font-size: 20px; font-weight: 700; color: #2C3136; margin-top: 0; margin-bottom: 12px; }}
    .content {{ font-size: 14px; line-height: 1.6; color: #4B5563; margin-bottom: 28px; }}
    .btn {{ display: inline-block; background-color: #465C70; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; }}
    .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #EEF2F6; font-size: 12px; color: #9CA3AF; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">52 Coffee & Roastery</div>
    </div>
    <h1 class="title">Permintaan Reset Password</h1>
    <div class="content">
      Halo,<br><br>
      Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Klik tombol di bawah ini untuk melanjutkan:
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{link}" class="btn">Atur Ulang Password</a>
    </div>
    <div class="content" style="font-size: 12px; color: #6B7280;">
      Tautan langsung: <a href="{link}" style="color: #465C70; word-break: break-all;">{link}</a>
    </div>
    <div class="footer">
      Tautan berlaku 30 menit. Jika Anda tidak meminta ini, abaikan pesan ini.
    </div>
  </div>
</body>
</html>
"""
    text = f"Halo,\n\nGunakan tautan ini untuk atur ulang kata sandi akun 52 Coffee & Roastery:\n{link}\n\nTautan berlaku 30 menit.\n\n52 Coffee & Roastery"
    return send_transactional_email(recipient, subject, html, text)


def send_order_receipt_email(order: dict) -> Optional[dict]:
    """Send an official payment receipt / struk to the customer once payment is approved."""
    recipient = order.get("customerEmail")
    if not recipient:
        return None

    order_id = str(order.get("id", ""))
    order_id_short = order_id[:8]
    created_at = order.get("createdAt", "")[:10]
    total = format_rupiah(order.get("total", 0))
    subtotal = format_rupiah(order.get("subtotal", 0))
    shipping_cost = format_rupiah(order.get("shippingCost", 0))
    discount = format_rupiah(order.get("discount", 0))
    method = "QRIS (Verifikasi Otomatis/Manual)" if "qris" in order.get("paymentMethod", "").lower() else "Transfer Bank BCA"

    shipping_snapshot = order.get("shipping", {}) or {}
    dest_name = shipping_snapshot.get("recipientName") or order.get("customerName") or "Pelanggan"
    dest_city = shipping_snapshot.get("city") or ""
    dest_address = shipping_snapshot.get("fullAddress") or ""
    courier = shipping_snapshot.get("courier") or "Pengiriman 52 Coffee"

    items_html = ""
    for item in order.get("items", []):
        p_name = item.get("productName", "Kopi Specialty")
        variant = item.get("variantLabel", "")
        grind = item.get("grindLabel", "")
        qty = item.get("quantity", 1)
        line_total = format_rupiah(item.get("lineTotal", 0))
        details = " • ".join(filter(None, [variant, grind]))
        
        items_html += f"""
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #EEF2F6;">
            <div style="font-weight: 600; color: #2C3136;">{p_name}</div>
            <div style="font-size: 12px; color: #64748B;">{details} &times; {qty}</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #EEF2F6; text-align: right; font-weight: 600; color: #2C3136;">
            {line_total}
          </td>
        </tr>
        """

    subject = f"Struk Pembayaran Sah #{order_id_short} - LUNAS | 52 Coffee & Roastery"

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #2C3136; }}
    .card {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #DCE6EB; padding: 36px 32px; }}
    .header {{ display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #465C70; padding-bottom: 20px; margin-bottom: 24px; }}
    .brand {{ font-size: 18px; font-weight: 700; letter-spacing: 0.05em; color: #465C70; text-transform: uppercase; }}
    .badge {{ display: inline-block; background-color: #DEF7EC; color: #03543F; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; }}
    .meta-box {{ background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.6; }}
    .items-table {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }}
    .summary-row {{ display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #64748B; }}
    .total-row {{ display: flex; justify-content: space-between; padding: 12px 0 0 0; border-top: 2px solid #465C70; font-size: 16px; font-weight: 700; color: #2C3136; margin-top: 8px; }}
    .footer {{ margin-top: 36px; padding-top: 20px; border-top: 1px solid #EEF2F6; font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5; }}
  </style>
</head>
<body>
  <div class="card">
    <div style="text-align: center; margin-bottom: 20px;">
      <div class="brand">52 COFFEE & ROASTERY</div>
      <div style="font-size: 11px; color: #8FB9BC; letter-spacing: 0.15em; font-weight: 600; margin-top: 4px;">BUKTI PEMBAYARAN RESMI / RECEIPT</div>
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge">PEMBAYARAN LUNAS</span>
    </div>

    <div class="meta-box">
      <table style="width: 100%; font-size: 13px; color: #475569;">
        <tr>
          <td><strong>No. Pesanan:</strong> {order_id}</td>
          <td style="text-align: right;"><strong>Tanggal:</strong> {created_at}</td>
        </tr>
        <tr>
          <td><strong>Pelanggan:</strong> {dest_name}</td>
          <td style="text-align: right;"><strong>Metode:</strong> {method}</td>
        </tr>
      </table>
    </div>

    <table class="items-table">
      <thead>
        <tr style="border-bottom: 1px solid #CBD5E1; color: #64748B; font-size: 12px; text-transform: uppercase;">
          <th style="text-align: left; padding-bottom: 8px;">Item Kopi</th>
          <th style="text-align: right; padding-bottom: 8px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {items_html}
      </tbody>
    </table>

    <div style="border-top: 1px solid #E2E8F0; padding-top: 12px; margin-bottom: 24px;">
      <table style="width: 100%; font-size: 13px; color: #475569;">
        <tr>
          <td style="padding: 4px 0;">Subtotal Produk</td>
          <td style="text-align: right; padding: 4px 0;">{subtotal}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">Diskon Voucher</td>
          <td style="text-align: right; padding: 4px 0; color: #059669;">-{discount}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">Ongkos Kirim ({courier})</td>
          <td style="text-align: right; padding: 4px 0;">{shipping_cost}</td>
        </tr>
        <tr style="border-top: 2px solid #465C70; font-size: 16px; font-weight: 700; color: #2C3136;">
          <td style="padding-top: 12px;">Total Pembayaran</td>
          <td style="text-align: right; padding-top: 12px; color: #465C70;">{total}</td>
        </tr>
      </table>
    </div>

    <div class="meta-box" style="margin-bottom: 0;">
      <div style="font-weight: 600; margin-bottom: 4px; color: #334155;">Alamat Pengiriman:</div>
      <div style="color: #64748B;">
        {dest_name}<br>
        {dest_address}, {dest_city}
      </div>
    </div>

    <div class="footer">
      Kopi Anda saat ini sedang masuk ke dalam jadwal sangrai segar di roastery kami.<br>
      Terima kasih telah mempercayakan seduhan Anda kepada 52 Coffee & Roastery.<br><br>
      &copy; 52 Coffee & Roastery • Malang, Jawa Timur
    </div>
  </div>
</body>
</html>
"""
    text = f"52 COFFEE & ROASTERY - STRUK PEMBAYARAN #{order_id_short}\nStatus: LUNAS\nTotal: {total}\nMetode: {method}\n\nTerima kasih atas pesanan Anda."
    return send_transactional_email(recipient, subject, html, text)


def send_order_shipped_email(order: dict, tracking_number: str) -> Optional[dict]:
    """Send shipping notification email with tracking number to customer."""
    recipient = order.get("customerEmail")
    if not recipient:
        return None

    order_id_short = str(order.get("id", ""))[:8]
    shipping = order.get("shipping", {}) or {}
    courier = shipping.get("courier") or "JNE / J&T"
    subject = f"Pesanan #{order_id_short} Telah Dikirim! | 52 Coffee & Roastery"

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #2C3136; }}
    .card {{ max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #DCE6EB; padding: 36px 32px; }}
    .brand {{ font-size: 18px; font-weight: 700; letter-spacing: 0.05em; color: #465C70; text-transform: uppercase; text-align: center; }}
    .box {{ background: #F8FAFC; border: 1px dashed #465C70; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }}
    .resi {{ font-size: 22px; font-weight: 700; color: #465C70; letter-spacing: 0.1em; margin-top: 8px; }}
    .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #EEF2F6; font-size: 12px; color: #9CA3AF; text-align: center; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">52 Coffee & Roastery</div>
    <h2 style="text-align: center; color: #2C3136; margin-top: 20px;">Kopi Anda Sedang Menuju ke Lokasi!</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
      Pesanan nomor <strong>#{order_id_short}</strong> telah selesai disangrai, dikemas dengan valve kedap udara, dan diserahkan ke kurir ekspedisi.
    </p>

    <div class="box">
      <div style="font-size: 12px; text-transform: uppercase; color: #64748B; font-weight: 600;">Ekspedisi: {courier}</div>
      <div class="resi">{tracking_number}</div>
      <div style="font-size: 11px; color: #94A3B8; margin-top: 6px;">Nomor Resi / Waybill</div>
    </div>

    <div class="footer">
      Pantau status pengiriman melalui website ekspedisi terkait.<br>
      Selamat menikmati seduhan kopi segar dari 52 Coffee!
    </div>
  </div>
</body>
</html>
"""
    text = f"Pesanan #{order_id_short} telah dikirim via {courier} dengan nomor resi: {tracking_number}."
    return send_transactional_email(recipient, subject, html, text)

