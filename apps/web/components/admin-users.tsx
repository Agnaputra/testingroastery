'use client';

import { useEffect, useState } from 'react';
import { customerApi, customerJson } from '../lib/customer-api';

type UserRow = { id: string; email: string; displayName: string; role: 'customer' | 'admin'; verified: boolean; disabled: boolean };

export function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const load = () => customerApi<UserRow[]>('admin/users').then(setUsers).catch((cause) => setError(cause instanceof Error ? cause.message : 'Akun tidak dapat dimuat.'));
  useEffect(() => { void load(); }, []);
  async function changeRole(user: UserRow, role: UserRow['role']) {
    setBusy(user.id); setError('');
    try {
      await customerApi(`admin/users/${user.id}/role`, customerJson('PATCH', { role }));
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Role gagal diperbarui.'); }
    finally { setBusy(''); }
  }
  return <section className="rounded-xl border border-border-subtle bg-white p-5 shadow-xs">
    <div className="border-b border-border-subtle pb-4"><h1 className="font-headline text-2xl font-bold">Akun & Role</h1><p className="mt-1 text-sm text-on-surface-variant">Kelola akses customer dan admin database.</p></div>
    {error && <p role="alert" className="mt-4 rounded-md bg-brand-maroon/5 p-3 text-sm text-brand-maroon">{error}</p>}
    <div className="mt-4 divide-y divide-border-subtle">{users.map((user) => <div key={user.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="font-semibold">{user.displayName || user.email}</p><p className="text-xs text-on-surface-variant">{user.email} · {user.verified ? 'Terverifikasi' : 'Belum terverifikasi'}{user.disabled ? ' · Dinonaktifkan' : ''}</p></div>
      <label className="text-xs font-semibold">Role <select value={user.role} disabled={busy === user.id || user.disabled} onChange={(event) => void changeRole(user, event.target.value as UserRow['role'])} className="ml-2 rounded-md border border-border-subtle bg-white px-3 py-2"><option value="customer">Customer</option><option value="admin">Admin</option></select></label>
    </div>)}</div>
  </section>;
}
