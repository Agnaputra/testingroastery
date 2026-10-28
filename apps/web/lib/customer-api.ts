export class CustomerApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'CustomerApiError';
    this.status = status;
  }
}

export async function customerApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/customer/${path}`, { cache: 'no-store', ...init });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new CustomerApiError(data.detail ?? data.error ?? 'Layanan pelanggan tidak tersedia.', response.status);
  return data as T;
}

export function customerJson(method: string, value: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) };
}
