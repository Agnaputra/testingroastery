import json
import tempfile
import threading
import time
import unittest
from http.server import HTTPServer
from pathlib import Path
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

import httpx

from scripts import authorize_gmail as helper


class GmailConsentTest(unittest.TestCase):
    def run_consent(self, account="owner@example.com", scope=helper.GMAIL_SCOPE):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            servers, errors = [], []
            real_client = httpx.Client
            requests = []

            def server(_address, handler):
                instance = HTTPServer(("127.0.0.1", 0), handler)
                servers.append(instance)
                return instance

            def transport(request):
                requests.append(request)
                if request.url.host == "oauth2.googleapis.com":
                    return httpx.Response(200, json={"access_token": "access", "refresh_token": "refresh", "scope": scope})
                return httpx.Response(200, json={"email": account, "email_verified": True})

            def authorize():
                try:
                    helper.authorize()
                except BaseException as error:
                    errors.append(error)

            env = {"CUSTOMER_GOOGLE_CLIENT_ID": "client", "CUSTOMER_GOOGLE_CLIENT_SECRET": "secret",
                   "CUSTOMER_SMTP_USER": "owner@example.com"}
            with patch.object(helper, "ROOT", root), patch.object(helper, "HTTPServer", side_effect=server), \
                    patch.object(helper, "dotenv_values", return_value=env), \
                    patch.dict(helper.os.environ, {}, clear=True), \
                    patch.object(helper.httpx, "Client", side_effect=lambda **kw: real_client(
                        **kw, transport=httpx.MockTransport(transport))):
                worker = threading.Thread(target=authorize, daemon=True)
                worker.start()
                link = root / ".private/gmail-authorization-url.txt"
                deadline = time.monotonic() + 3
                while not link.exists() and time.monotonic() < deadline:
                    time.sleep(0.01)
                self.assertTrue(link.exists())
                params = parse_qs(urlparse(link.read_text()).query)
                self.assertEqual(params["code_challenge_method"], ["S256"])
                self.assertTrue(params["code_challenge"][0])
                self.assertEqual(params["access_type"], ["offline"])
                endpoint = f"http://127.0.0.1:{servers[0].server_port}/gmail/callback"
                with real_client(timeout=3, trust_env=False) as browser:
                    start = browser.get(f"http://127.0.0.1:{servers[0].server_port}/")
                    self.assertEqual(start.status_code, 302)
                    self.assertTrue(start.headers["location"].startswith("https://accounts.google.com/"))
                    response = browser.get(endpoint, params={"code": "code", "state": "wrong"})
                    self.assertEqual(response.status_code, 400)
                    self.assertFalse(requests)
                    response = browser.get(endpoint, params={"code": "code", "state": params["state"][0]})
                worker.join(timeout=3)
                self.assertFalse(worker.is_alive())
                saved = root / ".private/gmail-oauth.json"
                return response.status_code, json.loads(saved.read_text()) if saved.exists() else None, errors

    def test_state_pkce_and_verified_sender_before_saving(self):
        status, credentials, errors = self.run_consent()
        self.assertEqual(status, 200)
        self.assertEqual(credentials["CUSTOMER_GMAIL_REFRESH_TOKEN"], "refresh")
        self.assertEqual(credentials["CUSTOMER_GMAIL_FROM"], "52 Coffee & Roastery <owner@example.com>")
        self.assertFalse(errors)

    def test_wrong_account_or_missing_gmail_scope_is_not_saved(self):
        for arguments in [{"account": "other@example.com"}, {"scope": "openid email"}]:
            with self.subTest(arguments=arguments):
                status, credentials, errors = self.run_consent(**arguments)
                self.assertEqual(status, 400)
                self.assertIsNone(credentials)
                self.assertIsInstance(errors[0], SystemExit)


if __name__ == "__main__":
    unittest.main()
