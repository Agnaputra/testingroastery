'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { customerApi, customerJson } from '../lib/customer-api';

export type UserRow = {
  id: string;
  email: string;
  displayName: string;
  role: 'customer' | 'admin';
  verified: boolean;
  disabled: boolean;
};

export function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await customerApi<UserRow[]>('admin/users');
      setUsers(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Akun tidak dapat dimuat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  async function changeRole(user: UserRow, role: UserRow['role']) {
    setBusy(user.id);
    setError('');
    try {
      await customerApi(`admin/users/${user.id}/role`, customerJson('PATCH', { role }));
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role } : u))
      );
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Role gagal diperbarui.');
    } finally {
      setBusy('');
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === 'all' ? true : u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  const adminCount = useMemo(() => users.filter((u) => u.role === 'admin').length, [users]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-headline text-2xl font-bold tracking-tight text-brand-charcoal">
                Manajemen Akun &amp; Role
              </h1>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Kelola hak akses pelanggan, peran administrator, dan status verifikasi akun.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-white px-3.5 text-xs font-semibold text-brand-charcoal transition-all hover:bg-black/[0.03] active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-brand-teal' : ''}`} />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border-subtle bg-[#F8FAFC] p-3">
            <span className="block text-[11px] text-on-surface-variant font-medium">Total Akun Terdaftar</span>
            <span className="mt-0.5 block font-mono text-lg font-bold text-brand-charcoal">{users.length}</span>
          </div>
          <div className="rounded-xl border border-border-subtle bg-[#F8FAFC] p-3">
            <span className="block text-[11px] text-on-surface-variant font-medium">Administrator</span>
            <span className="mt-0.5 block font-mono text-lg font-bold text-brand-navy">{adminCount}</span>
          </div>
          <div className="rounded-xl border border-border-subtle bg-[#F8FAFC] p-3 col-span-2 sm:col-span-1">
            <span className="block text-[11px] text-on-surface-variant font-medium">Pelanggan Biasa</span>
            <span className="mt-0.5 block font-mono text-lg font-bold text-brand-teal">{users.length - adminCount}</span>
          </div>
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-brand-maroon/20 bg-brand-maroon/5 p-4 text-sm text-brand-maroon shadow-xs"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-maroon" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Pastikan Anda memiliki izin administrator aktif dan backend AI (`apps/ai-backend`) berjalan normal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg bg-brand-maroon px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Controls & User Table */}
      <section className="rounded-2xl border border-border-subtle bg-white p-5 shadow-xs">
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-3 pb-4 border-b border-border-subtle sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari email atau nama pengguna..."
              className="h-10 w-full rounded-xl border border-border-subtle bg-[#F8FAFC] pl-10 pr-4 text-xs text-brand-charcoal placeholder-on-surface-variant focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-[#F1F5F9] p-1">
            {(
              [
                { id: 'all', label: 'Semua Akun' },
                { id: 'admin', label: 'Admin Saja' },
                { id: 'customer', label: 'Customer' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  roleFilter === tab.id
                    ? 'bg-white text-brand-charcoal shadow-2xs'
                    : 'text-on-surface-variant hover:text-brand-charcoal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && users.length === 0 && (
          <div className="space-y-3 py-6">
            <div className="h-16 w-full animate-pulse rounded-xl bg-[#F8FAFC]" />
            <div className="h-16 w-full animate-pulse rounded-xl bg-[#F8FAFC]" />
            <div className="h-16 w-full animate-pulse rounded-xl bg-[#F8FAFC]" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] text-on-surface-variant mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-brand-charcoal">Tidak Ada Akun Ditemukan</h3>
            <p className="mt-1 text-xs text-on-surface-variant max-w-sm">
              {searchQuery || roleFilter !== 'all'
                ? 'Tidak ada akun yang sesuai dengan filter pencarian Anda.'
                : 'Belum ada akun customer terdaftar di database.'}
            </p>
          </div>
        )}

        {/* User Rows */}
        <div className="divide-y divide-border-subtle">
          {filteredUsers.map((user) => {
            const isAdmin = user.role === 'admin';
            const isMutating = busy === user.id;

            return (
              <div
                key={user.id}
                className="flex flex-col gap-3 py-4 first:pt-4 last:pb-0 sm:flex-row sm:items-center sm:justify-between hover:bg-black/[0.01] transition-colors rounded-xl px-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-mono text-sm font-bold ${
                      isAdmin
                        ? 'bg-brand-navy/10 text-brand-navy border border-brand-navy/20'
                        : 'bg-[#F1F5F9] text-brand-charcoal border border-border-subtle'
                    }`}
                  >
                    {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-sans font-bold text-sm text-brand-charcoal">
                        {user.displayName || user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-navy/10 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-navy">
                          <ShieldCheck className="h-3 w-3" /> Admin
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant font-mono">
                      <span>{user.email}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        {user.verified ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-700">Terverifikasi</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-amber-500" />
                            <span className="text-amber-700">Belum verifikasi</span>
                          </>
                        )}
                      </span>
                      {user.disabled && (
                        <span className="rounded-md bg-brand-maroon/10 px-1.5 py-0.2 text-[10px] font-bold text-brand-maroon">
                          Dinonaktifkan
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="flex items-center gap-2 sm:self-center">
                  <label htmlFor={`role-${user.id}`} className="font-sans text-xs font-medium text-on-surface-variant">
                    Hak Akses:
                  </label>
                  <div className="relative">
                    <select
                      id={`role-${user.id}`}
                      value={user.role}
                      disabled={isMutating || user.disabled}
                      onChange={(event) => void changeRole(user, event.target.value as UserRow['role'])}
                      className={`h-9 rounded-xl border px-3 pr-8 font-sans text-xs font-semibold transition-all focus:outline-none ${
                        isAdmin
                          ? 'border-brand-navy/40 bg-brand-navy/5 text-brand-navy focus:border-brand-navy'
                          : 'border-border-subtle bg-white text-brand-charcoal focus:border-brand-teal'
                      } disabled:opacity-50 cursor-pointer`}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Administrator</option>
                    </select>
                    {isMutating && (
                      <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-brand-teal" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
