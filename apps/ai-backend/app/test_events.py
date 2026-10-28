import unittest
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, urlparse
from uuid import uuid4

from fastapi.testclient import TestClient

from app.config import settings
from app.events import connection, token_hash
from app.main import app


class EventFlowTest(unittest.TestCase):
    def test_local_event_lifecycle_and_authorization(self):
        original_key = settings.ADMIN_API_KEY
        settings.ADMIN_API_KEY = 'synthetic-event-admin-key'
        client = TestClient(app)
        suffix = uuid4().hex[:10]
        emails = [f'event-test-{suffix}@example.test', f'event-other-{suffix}@example.test']
        ids = []
        try:
            with connection() as conn, conn.cursor() as cur:
                cur.execute('DELETE FROM event_login_attempts WHERE key_hash=%s', (token_hash('register:testclient'),))
            first = client.post('/api/events/auth/register', json={'email': emails[0], 'password': 'test-password-123'})
            self.assertEqual(first.status_code, 200, first.text)
            token = first.json()['token']
            other = client.post('/api/events/auth/register', json={'email': emails[1], 'password': 'test-password-123'})
            self.assertEqual(other.status_code, 200, other.text)
            other_token = other.json()['token']
            auth = {'Authorization': f'Bearer {token}'}
            other_auth = {'Authorization': f'Bearer {other_token}'}
            profile = client.put('/api/events/profile/me', headers=auth, json={'name': 'Test Roastery', 'bio': 'Cupping test', 'whatsapp': '6281234567890'})
            self.assertEqual(profile.status_code, 200, profile.text)
            client.put('/api/events/profile/me', headers=other_auth, json={'name': 'Other Roastery', 'bio': '', 'whatsapp': '6281234567891'})
            start = datetime.now(timezone.utc) + timedelta(days=5)
            payload = {'title': f'Cupping Integration {suffix}', 'description': 'Sesi cupping untuk menguji alur integrasi secara aman.', 'category': 'cupping', 'startsAt': start.isoformat(), 'endsAt': (start + timedelta(hours=2)).isoformat(), 'timezone': 'Asia/Jakarta', 'locationType': 'offline', 'venueName': 'Test Venue', 'address': 'Test Address', 'capacity': 12, 'confirmedCount': 0, 'isPaid': False, 'price': 0, 'whatsapp': '6281234567890', 'instructions': '', 'registrationStatus': 'open'}
            created = client.post('/api/events/list', headers=auth, json=payload)
            self.assertEqual(created.status_code, 200, created.text)
            event_id = created.json()['id']; ids.append(event_id)
            slug = created.json()['slug']
            self.assertEqual(client.patch(f'/api/events/{event_id}', headers=other_auth, json=payload).status_code, 404)
            self.assertEqual(client.post(f'/api/events/{event_id}/status/publish', headers=auth).status_code, 200)
            listing = client.get('/api/events/list', params={'q': suffix, 'category': 'cupping', 'price': 'free'}).json()
            self.assertEqual(listing['total'], 1)
            self.assertEqual(listing['items'][0]['slug'], slug)
            self.assertEqual(client.get(f'/api/events/detail/{slug}').status_code, 200)
            self.assertEqual(client.post(f'/api/events/{event_id}/status/unpublish', headers=auth).status_code, 200)
            self.assertEqual(client.get(f'/api/events/detail/{slug}').status_code, 404)
            self.assertEqual(client.post(f'/api/events/{event_id}/status/publish', headers=auth).status_code, 200)
            handoff = client.post(f'/api/events/{event_id}/whatsapp')
            self.assertEqual(handoff.status_code, 200, handoff.text)
            url = urlparse(handoff.json()['url'])
            self.assertEqual(url.netloc, 'wa.me')
            self.assertEqual(url.path, '/6281234567890')
            message = parse_qs(url.query)['text'][0]
            self.assertIn(payload['title'], message)
            self.assertIn('Nama:', message)
            self.assertEqual(client.get(f'/api/events/manage/{event_id}/stats', headers=auth).json()['whatsappClicks'], 1)
            full = {**payload, 'registrationStatus': 'full'}
            self.assertEqual(client.patch(f'/api/events/{event_id}', headers=auth, json=full).status_code, 200)
            self.assertEqual(client.post(f'/api/events/{event_id}/whatsapp').status_code, 409)
            closed = {**payload, 'registrationStatus': 'closed'}
            self.assertEqual(client.patch(f'/api/events/{event_id}', headers=auth, json=closed).status_code, 200)
            self.assertEqual(client.post(f'/api/events/{event_id}/whatsapp').status_code, 409)
            self.assertEqual(client.post(f'/api/events/{event_id}/report', json={'reason': 'A test report for moderation'}).status_code, 200)
            admin = {'X-Admin-Key': settings.ADMIN_API_KEY}
            reports = client.get('/api/events/admin/reports', headers=admin).json()
            report = next(row for row in reports if row['event_id'] == event_id)
            self.assertEqual(client.patch(f"/api/events/admin/reports/{report['id']}", headers=admin, json={'status': 'reviewed'}).status_code, 200)
            self.assertEqual(client.patch(f'/api/events/admin/events/{event_id}', headers=admin, json={'moderationStatus': 'hidden'}).status_code, 200)
            self.assertEqual(client.get(f'/api/events/detail/{slug}').status_code, 404)
            self.assertEqual(client.post(f'/api/events/{event_id}/status/unpublish', headers=auth).status_code, 409)
            self.assertEqual(client.patch(f'/api/events/admin/events/{event_id}', headers=admin, json={'moderationStatus': 'visible'}).status_code, 200)
            self.assertEqual(client.post(f'/api/events/{event_id}/status/cancel', headers=auth).status_code, 200)
            self.assertEqual(client.get(f'/api/events/detail/{slug}').status_code, 200)
        finally:
            with connection() as conn, conn.cursor() as cur:
                for event_id in ids:
                    cur.execute('DELETE FROM events WHERE id=%s', (event_id,))
                cur.execute('DELETE FROM event_users WHERE email=ANY(%s)', (emails,))
                cur.execute('DELETE FROM event_login_attempts WHERE key_hash=%s', (token_hash('register:testclient'),))
            settings.ADMIN_API_KEY = original_key


if __name__ == '__main__':
    unittest.main()
