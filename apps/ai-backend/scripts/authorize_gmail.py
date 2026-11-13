"""One-time Gmail sender consent. Credentials stay in the ignored .private directory."""
import json
import os
import secrets
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import httpx
from authlib.oauth2.client import OAuth2Client
from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[3]
REDIRECT_URI = "http://127.0.0.1:8765/gmail/callback"
GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.send"


def authorize():
    env = {**dotenv_values(ROOT / "apps/ai-backend/.env"), **os.environ}
    client_id = env.get("CUSTOMER_GMAIL_CLIENT_ID") or env.get("CUSTOMER_GOOGLE_CLIENT_ID")
    client_secret = env.get("CUSTOMER_GMAIL_CLIENT_SECRET") or env.get("CUSTOMER_GOOGLE_CLIENT_SECRET")
    sender = env.get("CUSTOMER_SMTP_USER", "").strip().lower()
    if not client_id or not client_secret or not sender:
        raise SystemExit("Missing local OAuth client or SMTP sender address.")
    verifier = secrets.token_urlsafe(48)
    state = secrets.token_urlsafe(32)
    result = {}

    oauth = OAuth2Client(None, client_id, scope=f"openid email {GMAIL_SCOPE}",
                         redirect_uri=REDIRECT_URI, code_challenge_method="S256")
    with httpx.Client(timeout=20) as client:
        class Callback(BaseHTTPRequestHandler):
            def log_message(self, *_args):
                pass  # Authorization codes must never enter access logs.

            def do_GET(self):
                parsed = urlparse(self.path)
                if parsed.path == "/":
                    self.send_response(302)
                    self.send_header("Location", url)
                    self.send_header("Cache-Control", "no-store")
                    self.end_headers()
                    return
                params = parse_qs(parsed.query)
                if parsed.path != "/gmail/callback" or not secrets.compare_digest(params.get("state", [""])[0], state):
                    self.send_error(400, "Invalid OAuth state or path")
                    return
                try:
                    if "error" in params or not params.get("code"):
                        raise ValueError("Consent not granted")
                    response = client.post("https://oauth2.googleapis.com/token", data={
                        "client_id": client_id, "client_secret": client_secret,
                        "redirect_uri": REDIRECT_URI, "grant_type": "authorization_code",
                        "code": params["code"][0], "code_verifier": verifier,
                    })
                    response.raise_for_status()
                    token = response.json()
                    if GMAIL_SCOPE not in token.get("scope", "").split() or not token.get("refresh_token"):
                        raise ValueError("Missing Gmail scope or refresh token")
                    profile = client.get("https://openidconnect.googleapis.com/v1/userinfo",
                                         headers={"Authorization": f"Bearer {token['access_token']}"})
                    profile.raise_for_status()
                    account = profile.json()
                    if account.get("email", "").lower() != sender or account.get("email_verified") is not True:
                        raise ValueError("Wrong or unverified sender account")
                    private = ROOT / ".private"
                    private.mkdir(exist_ok=True)
                    credentials = {
                        "CUSTOMER_GMAIL_CLIENT_ID": client_id,
                        "CUSTOMER_GMAIL_CLIENT_SECRET": client_secret,
                        "CUSTOMER_GMAIL_REFRESH_TOKEN": token["refresh_token"],
                        "CUSTOMER_GMAIL_FROM": f"52 Coffee & Roastery <{sender}>",
                    }
                    (private / "gmail-oauth.json").write_text(json.dumps(credentials), encoding="utf-8")
                    result["ok"] = True
                    message = "Gmail berhasil diotorisasi. Token disimpan lokal; kembali ke Codex untuk aktivasi Railway."
                except (httpx.HTTPError, ValueError, KeyError) as error:
                    result["ok"] = False
                    print(f"Authorization failed: {type(error).__name__}", flush=True)
                    message = "Otorisasi gagal. Pastikan akun, Gmail API, dan izin gmail.send sudah benar."
                self.send_response(200 if result["ok"] else 400)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(message.encode("utf-8"))

        with HTTPServer(("127.0.0.1", 8765), Callback) as server:
            server.timeout = 1
            url, _ = oauth.create_authorization_url(
                "https://accounts.google.com/o/oauth2/v2/auth", state=state,
                code_verifier=verifier, access_type="offline", prompt="consent", login_hint=sender,
            )
            private = ROOT / ".private"
            private.mkdir(exist_ok=True)
            (private / "gmail-authorization-url.txt").write_text(url, encoding="utf-8")
            print(f"Register this Google OAuth redirect URI: {REDIRECT_URI}", flush=True)
            print("Authorization URL saved to .private/gmail-authorization-url.txt", flush=True)
            print("Waiting for sender consent (10 minutes). Tokens will not be printed.", flush=True)
            deadline = time.monotonic() + 600
            while not result and time.monotonic() < deadline:
                server.handle_request()
            if not result.get("ok"):
                raise SystemExit("Gmail authorization incomplete; rerun this helper to retry.")
            print("Sender authorized. Credentials saved to .private/gmail-oauth.json", flush=True)


if __name__ == "__main__":
    authorize()
