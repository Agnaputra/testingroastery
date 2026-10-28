export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type RegistrationStatus = 'open' | 'full' | 'closed';

export type CoffeeEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location_type: 'offline' | 'online';
  venue_name: string;
  address: string;
  meeting_link: string;
  whatsapp: string;
  capacity: number;
  confirmed_count: number;
  is_paid: boolean;
  price: number;
  instructions: string;
  registration_status: RegistrationStatus;
  status: EventStatus;
  moderation_status: 'visible' | 'hidden' | 'suspended';
  category_slug: string;
  category_name: string;
  organizer_slug: string;
  organizer_name: string;
  organizer_bio: string;
  has_cover: boolean;
  has_avatar: boolean;
  created_at: string;
};

export type EventCategory = { slug: string; name: string };

export function eventDate(value: string, timezone: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: timezone }).format(new Date(value));
}

export function eventTime(value: string, timezone: string): string {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).format(new Date(value));
}

export function eventPrice(event: CoffeeEvent): string {
  return event.is_paid ? formatRupiah(event.price) : 'Gratis';
}

export function registrationLabel(event: CoffeeEvent): string {
  if (event.status === 'cancelled') return 'Dibatalkan';
  if (event.status === 'completed') return 'Selesai';
  if (event.registration_status === 'closed') return 'Pendaftaran ditutup';
  if (event.registration_status === 'full' || event.confirmed_count >= event.capacity) return 'Penuh';
  return 'Pendaftaran dibuka';
}

export async function eventApi<T>(path: string, options?: RequestInit): Promise<T> {
  const target = path.startsWith('?') ? `list${path}` : path || 'list';
  const response = await fetch(`/api/events/${target}`, { cache: 'no-store', ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Permintaan gagal.');
  return data as T;
}

export const jsonOptions = (method: string, data?: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: data === undefined ? '{}' : JSON.stringify(data),
});
import { formatRupiah } from './data';
