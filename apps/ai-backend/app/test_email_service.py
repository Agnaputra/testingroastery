import base64
import json
import os
import unittest
from email import policy
from email.parser import BytesParser
from unittest.mock import patch

import httpx
from fastapi import HTTPException

from app.email_service import send_transactional_email


class GmailEmailTest(unittest.TestCase):
    def test_background_notification_error_is_contained(self):
        from app.customer_payments import send_order_notification
        with patch("app.email_service.send_order_receipt_email", side_effect=RuntimeError("synthetic failure")):
            send_order_notification({"id": "synthetic-order"})

    def setUp(self):
        self.env = patch.dict(os.environ, {
            "CUSTOMER_GMAIL_CLIENT_ID": "client-id",
            "CUSTOMER_GMAIL_CLIENT_SECRET": "client-secret",
            "CUSTOMER_GMAIL_REFRESH_TOKEN": "refresh-secret",
            "CUSTOMER_GMAIL_FROM": "52 Coffee <owner@example.com>",
            "CUSTOMER_SMTP_HOST": "smtp.example.com",
        })
        self.env.start()
        self.addCleanup(self.env.stop)
        self.requests = []

    def send(self, token_status=200, send_status=200, token_body=None, send_body=None):
        def handler(request):
            self.requests.append(request)
            if request.url.host == "oauth2.googleapis.com":
                return httpx.Response(token_status, json=token_body if token_body is not None else {
                    "access_token": "access-secret", "token_type": "Bearer", "expires_in": 3600,
                })
            return httpx.Response(send_status, json=send_body if send_body is not None else {"id": "mail-id"})

        real_client = httpx.Client

        def client(*args, **kwargs):
            return real_client(*args, **kwargs, transport=httpx.MockTransport(handler))

        with patch("app.email_service.httpx.Client", side_effect=client), \
                patch("app.email_service.smtplib.SMTP") as smtp:
            try:
                return send_transactional_email("customer@example.com", "Struk kopi ☕", "<p>Lunas</p>", "Lunas")
            finally:
                smtp.assert_not_called()

    def test_sends_mime_with_refreshed_token_and_overrides_smtp(self):
        self.assertEqual(self.send(), {"provider": "gmail", "id": "mail-id"})
        token_request, send_request = self.requests
        self.assertIn(b"refresh_token=refresh-secret", token_request.content)
        self.assertIn(b"client_secret=client-secret", token_request.content)
        self.assertEqual(send_request.headers["Authorization"], "Bearer access-secret")
        self.assertEqual(str(send_request.url), "https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
        raw = json.loads(send_request.content)["raw"]
        msg = BytesParser(policy=policy.default).parsebytes(base64.urlsafe_b64decode(raw))
        self.assertEqual(msg["From"], "52 Coffee <owner@example.com>")
        self.assertEqual(msg["To"], "customer@example.com")
        self.assertEqual(msg["Subject"], "Struk kopi ☕")
        self.assertEqual(msg.get_body(preferencelist=("html",)).get_content().strip(), "<p>Lunas</p>")

    def test_incomplete_config_does_not_call_network(self):
        with patch.dict(os.environ, {"CUSTOMER_GMAIL_CLIENT_SECRET": ""}), \
                patch("app.email_service.httpx.Client") as client:
            with self.assertRaises(HTTPException) as error:
                send_transactional_email("customer@example.com", "Struk", "<p>Lunas</p>")
            self.assertEqual(error.exception.status_code, 503)
            client.assert_not_called()

    def test_expired_consent_does_not_fall_back_to_smtp_or_leak_tokens(self):
        with self.assertRaises(HTTPException) as error:
            self.send(token_status=400, token_body={"error": "invalid_grant", "error_description": "refresh-secret"})
        self.assertEqual(error.exception.status_code, 503)
        self.assertNotIn("refresh-secret", error.exception.detail)
        self.assertEqual(len(self.requests), 1)

    def test_gmail_rejection_and_missing_message_id_are_failures(self):
        for status, body in [(403, {"error": {"message": "API disabled"}}), (200, {})]:
            with self.subTest(status=status), self.assertRaises(HTTPException) as error:
                self.send(send_status=status, send_body=body)
            self.assertEqual(error.exception.status_code, 503)

    def test_existing_smtp_path_still_works_without_gmail_token(self):
        with patch.dict(os.environ, {"CUSTOMER_GMAIL_REFRESH_TOKEN": "", "CUSTOMER_SMTP_USER": "owner@example.com",
                                     "CUSTOMER_SMTP_PASSWORD": "smtp-secret"}), \
                patch("app.email_service.smtplib.SMTP") as smtp:
            self.assertEqual(send_transactional_email("customer@example.com", "Struk", "<p>Lunas</p>"),
                             {"provider": "smtp"})
            smtp.return_value.__enter__.return_value.send_message.assert_called_once()


if __name__ == "__main__":
    unittest.main()
