'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Tag,
  History,
  Eye,
  EyeOff,
  Ban,
  Search,
  Plus,
  Check,
  ExternalLink,
  Clock,
  User,
  MapPin,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  CoffeeEvent,
  EventCategory,
  eventApi,
  jsonOptions,
  eventDate,
  eventTime,
} from '../../../lib/events';
import { BackButton } from '../../../components/ui/back-button';

type Report = {
  id: string;
  event_id: string;
  title: string;
  slug: string;
  reason: string;
  status: string;
  created_at: string;
};

type Audit = {
  id: number;
  event_id: string | null;
  action: string;
  actor_role: string;
  created_at: string;
};

type TabType = 'events' | 'reports' | 'categories' | 'audit';
type StatusFilter = 'all' | 'visible' | 'hidden' | 'suspended';

export default function EventModerationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [events, setEvents] = useState<CoffeeEvent[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [categories, setCategories] = useState<(EventCategory & { active: boolean })[]>([]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  async function loadData(showLoading = false) {
    if (showLoading) setIsRefreshing(true);
    try {
      const [all, reportList, logs, categoryList] = await Promise.all([
        eventApi<CoffeeEvent[]>('admin/all').catch(() => []),
        eventApi<Report[]>('admin/reports').catch(() => []),
        eventApi<Audit[]>('admin/audit').catch(() => []),
        eventApi<(EventCategory & { active: boolean })[]>('admin/categories').catch(() => []),
      ]);
      setEvents(all);
      setReports(reportList);
      setAudit(logs);
      setCategories(categoryList);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Moderasi event tidak tersedia.');
    } finally {
      setReady(true);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleModerate(event: CoffeeEvent, status: 'visible' | 'hidden' | 'suspended') {
    const actionKey = `event-${event.id}-${status}`;
    setActionInProgress(actionKey);
    try {
      await eventApi(`admin/events/${event.id}`, jsonOptions('PATCH', { moderationStatus: status }));
      // Optimistic update
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, moderation_status: status } : e))
      );
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Moderasi event gagal.');
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleSuspendOrganizer(slug: string, suspended: boolean) {
    const actionKey = `organizer-${slug}-${suspended ? 'suspend' : 'restore'}`;
    setActionInProgress(actionKey);
    try {
      await eventApi(`admin/organizers/${slug}`, jsonOptions('PATCH', { suspended }));
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Perubahan status organizer gagal.');
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (newCategoryName.trim().length < 2) return;
    setActionInProgress('add-category');
    try {
      await eventApi('admin/categories', jsonOptions('POST', { name: newCategoryName.trim() }));
      setNewCategoryName('');
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menambahkan kategori.');
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleToggleCategory(slug: string, currentActive: boolean) {
    const actionKey = `category-${slug}`;
    setActionInProgress(actionKey);
    try {
      await eventApi(`admin/categories/${slug}`, jsonOptions('PATCH', { active: !currentActive }));
      setCategories((prev) =>
        prev.map((c) => (c.slug === slug ? { ...c, active: !currentActive } : c))
      );
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memperbarui kategori.');
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleReviewReport(id: string, status: 'reviewed' | 'dismissed') {
    const actionKey = `report-${id}-${status}`;
    setActionInProgress(actionKey);
    try {
      await eventApi(`admin/reports/${id}`, jsonOptions('PATCH', { status }));
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memproses laporan.');
    } finally {
      setActionInProgress(null);
    }
  }

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.organizer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.venue_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ? true : e.moderation_status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [events, searchQuery, statusFilter]);

  const openReportsCount = useMemo(() => {
    return reports.filter((r) => r.status === 'open').length;
  }, [reports]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-brand-charcoal antialiased">
      {/* Sticky Apple-Style Header */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-white/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <BackButton fallbackHref="/admin" label="Admin Portal" />
            <div className="h-4 w-px bg-border-subtle" />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="font-sans text-sm font-semibold tracking-tight text-brand-charcoal">
                Moderasi Event & Komunitas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadData(true)}
              disabled={isRefreshing}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-subtle bg-white px-3 text-xs font-medium text-brand-charcoal transition-all hover:bg-black/[0.03] active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-brand-teal' : ''}`} />
              <span className="hidden sm:inline">Segarkan Data</span>
            </button>
            <Link
              href="/events"
              target="_blank"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-charcoal px-3 text-xs font-medium text-white transition-all hover:bg-brand-navy active:scale-95"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Halaman Event</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Error Notification Banner */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-maroon/20 bg-brand-maroon/5 p-4 text-sm text-brand-maroon shadow-xs"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-maroon" />
            <div className="flex-1">
              <p className="font-semibold text-brand-charcoal">{error}</p>
              {error.toLowerCase().includes('admin') && (
                <p className="mt-1 text-xs text-on-surface-variant">
                  Akses memerlukan sesi administrator aktif. Silakan masuk via{' '}
                  <Link href="/admin" className="font-semibold text-brand-navy underline underline-offset-2">
                    halaman Admin
                  </Link>
                  .
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-xs font-bold text-brand-maroon hover:opacity-75"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Page Title & Stats Overview */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-brand-charcoal sm:text-3xl">
              Kurasi & Moderasi Event
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Kelola visibilitas cupping session, respon laporan publik, dan atur taksonomi komunitas roastery.
            </p>
          </div>

          {/* Quick Counter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-3 py-1.5 shadow-2xs">
              <span className="text-xs text-on-surface-variant">Total Event:</span>
              <span className="font-mono text-xs font-bold text-brand-charcoal">{events.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-3 py-1.5 shadow-2xs">
              <span className="text-xs text-on-surface-variant">Laporan Aktif:</span>
              <span className={`font-mono text-xs font-bold ${openReportsCount > 0 ? 'text-brand-maroon' : 'text-brand-teal'}`}>
                {openReportsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Apple Segmented Navigation Bar */}
        <div className="mb-6 flex border-b border-border-subtle">
          <nav className="flex space-x-1 sm:space-x-2" aria-label="Tabs Moderasi">
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={`relative flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                activeTab === 'events'
                  ? 'border-brand-charcoal text-brand-charcoal'
                  : 'border-transparent text-on-surface-variant hover:text-brand-charcoal'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Daftar Event</span>
              <span className="rounded-full bg-black/5 px-2 py-0.5 font-mono text-[11px] font-bold text-brand-charcoal">
                {events.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`relative flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                activeTab === 'reports'
                  ? 'border-brand-maroon text-brand-maroon'
                  : 'border-transparent text-on-surface-variant hover:text-brand-charcoal'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Laporan Komunitas</span>
              {openReportsCount > 0 && (
                <span className="rounded-full bg-brand-maroon px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                  {openReportsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`relative flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                activeTab === 'categories'
                  ? 'border-brand-charcoal text-brand-charcoal'
                  : 'border-transparent text-on-surface-variant hover:text-brand-charcoal'
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>Kategori</span>
              <span className="rounded-full bg-black/5 px-2 py-0.5 font-mono text-[11px] font-bold text-brand-charcoal">
                {categories.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`relative flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                activeTab === 'audit'
                  ? 'border-brand-charcoal text-brand-charcoal'
                  : 'border-transparent text-on-surface-variant hover:text-brand-charcoal'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Audit Log</span>
              <span className="rounded-full bg-black/5 px-2 py-0.5 font-mono text-[11px] font-bold text-brand-charcoal">
                {audit.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Loading Skeleton - ZERO layout shift */}
        {!ready && (
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded-xl bg-black/5" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-white border border-border-subtle" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-white border border-border-subtle" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-white border border-border-subtle" />
          </div>
        )}

        {/* Tab 1: Daftar Event */}
        {ready && activeTab === 'events' && (
          <div className="space-y-5">
            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul event, organizer, atau lokasi venue..."
                  className="h-10 w-full rounded-xl border border-border-subtle bg-[#F8FAFC] pl-10 pr-4 text-xs text-brand-charcoal placeholder-on-surface-variant focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy"
                />
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-[#F1F5F9] p-1">
                {(
                  [
                    { id: 'all', label: 'Semua' },
                    { id: 'visible', label: 'Visible' },
                    { id: 'hidden', label: 'Hidden' },
                    { id: 'suspended', label: 'Suspended' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                      statusFilter === tab.id
                        ? 'bg-white text-brand-charcoal shadow-2xs'
                        : 'text-on-surface-variant hover:text-brand-charcoal'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Event List */}
            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-white p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] text-on-surface-variant mb-3">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-brand-charcoal">Tidak Ada Event Ditemukan</h3>
                <p className="mt-1 text-xs text-on-surface-variant max-w-sm">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Coba sesuaikan kata kunci pencarian atau ganti filter status di atas.'
                    : 'Belum ada agenda event cupping atau workshop yang terdaftar.'}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="mt-4 rounded-lg bg-brand-charcoal px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-navy"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const isVisible = event.moderation_status === 'visible';
                  const isHidden = event.moderation_status === 'hidden';
                  const isSuspended = event.moderation_status === 'suspended';

                  const isMutating =
                    actionInProgress?.startsWith(`event-${event.id}`) ||
                    actionInProgress?.startsWith(`organizer-${event.organizer_slug}`);

                  return (
                    <article
                      key={event.id}
                      className="group relative rounded-2xl border border-border-subtle bg-white p-5 shadow-xs transition-all hover:border-brand-navy/30 hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        {/* Event Info Left Column */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                                isVisible
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isSuspended
                                  ? 'bg-brand-maroon/10 text-brand-maroon border border-brand-maroon/20'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isVisible
                                    ? 'bg-emerald-500'
                                    : isSuspended
                                    ? 'bg-brand-maroon'
                                    : 'bg-amber-500'
                                }`}
                              />
                              {event.moderation_status}
                            </span>

                            {event.category_name && (
                              <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-brand-charcoal">
                                {event.category_name}
                              </span>
                            )}

                            <span className="font-mono text-[11px] text-on-surface-variant">
                              ID: {event.id.slice(0, 8)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <h2 className="font-sans text-base font-bold text-brand-charcoal sm:text-lg">
                              {event.title}
                            </h2>
                            <Link
                              href={`/events/${event.slug}`}
                              target="_blank"
                              title="Lihat halaman publik event"
                              className="text-on-surface-variant hover:text-brand-navy"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </div>

                          {/* Event Meta Details Grid */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-brand-teal" />
                              <span className="font-medium text-brand-charcoal">{event.organizer_name}</span>
                              <span className="font-mono text-[10px]">(@{event.organizer_slug})</span>
                            </span>

                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-brand-navy" />
                              <span>{eventDate(event.starts_at, event.timezone)}</span>
                            </span>

                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-on-surface-variant" />
                              <span>{eventTime(event.starts_at, event.timezone)}</span>
                            </span>

                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-brand-maroon" />
                              <span className="line-clamp-1 max-w-[220px]">
                                {event.location_type === 'online' ? 'Online Event' : event.venue_name || event.address}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Event Actions Right Column */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                          {/* Segmented Visibility Toggle */}
                          <div className="inline-flex rounded-xl border border-border-subtle bg-[#F8FAFC] p-1 shadow-2xs">
                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() => void handleModerate(event, 'visible')}
                              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                isVisible
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-on-surface-variant hover:text-brand-charcoal hover:bg-white'
                              } disabled:opacity-50`}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Show</span>
                            </button>

                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() => void handleModerate(event, 'hidden')}
                              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                isHidden
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-on-surface-variant hover:text-brand-charcoal hover:bg-white'
                              } disabled:opacity-50`}
                            >
                              <EyeOff className="h-3.5 w-3.5" />
                              <span>Hide</span>
                            </button>

                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() => void handleModerate(event, 'suspended')}
                              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                isSuspended
                                  ? 'bg-brand-maroon text-white shadow-xs'
                                  : 'text-brand-maroon hover:bg-brand-maroon/10'
                              } disabled:opacity-50`}
                            >
                              <Ban className="h-3.5 w-3.5" />
                              <span>Suspend</span>
                            </button>
                          </div>

                          {/* Secondary Organizer Actions */}
                          <div className="flex items-center gap-1.5 text-xs">
                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() => void handleSuspendOrganizer(event.organizer_slug, true)}
                              className="rounded-lg border border-brand-maroon/30 bg-white px-2.5 py-1 text-[11px] font-medium text-brand-maroon transition-all hover:bg-brand-maroon/5 active:scale-95 disabled:opacity-50"
                            >
                              Suspend Organizer
                            </button>

                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() => void handleSuspendOrganizer(event.organizer_slug, false)}
                              className="rounded-lg border border-border-subtle bg-white px-2.5 py-1 text-[11px] font-medium text-brand-charcoal transition-all hover:bg-black/[0.04] active:scale-95 disabled:opacity-50"
                            >
                              Restore Org
                            </button>
                          </div>

                          {isMutating && (
                            <span className="flex items-center gap-1 font-mono text-[10px] text-brand-teal">
                              <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan status…
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Laporan Komunitas */}
        {ready && activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <h2 className="font-headline text-lg font-bold text-brand-charcoal">
                    Antrean Laporan Komunitas ({reports.length})
                  </h2>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    Laporan dari pengunjung atau anggota cupping mengenai konten event atau penyalahgunaan.
                  </p>
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-maroon bg-brand-maroon/10 px-2.5 py-1 rounded-full">
                  Priority Queue
                </span>
              </div>

              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-brand-charcoal">Bersih! Tidak Ada Laporan Tertunda</h3>
                  <p className="mt-1 text-xs text-on-surface-variant max-w-sm">
                    Semua laporan komunitas telah ditinjau atau tidak ada keluhan aktif.
                  </p>
                </div>
              ) : (
                <div className="mt-4 divide-y divide-border-subtle">
                  {reports.map((report) => {
                    const isOpen = report.status === 'open';
                    const isMutating = actionInProgress?.startsWith(`report-${report.id}`);

                    return (
                      <article key={report.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                  isOpen
                                    ? 'bg-brand-maroon/10 text-brand-maroon border border-brand-maroon/20'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {report.status}
                              </span>
                              <h3 className="font-sans text-sm font-bold text-brand-charcoal">
                                {report.title}
                              </h3>
                            </div>

                            <p className="rounded-lg bg-[#F8FAFC] border border-border-subtle/60 p-2.5 text-xs text-brand-charcoal leading-relaxed font-sans">
                              {report.reason}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-on-surface-variant pt-1">
                              <span className="font-mono text-[11px]">
                                Dilaporkan: {new Date(report.created_at).toLocaleDateString('id-ID')}
                              </span>
                              <Link
                                href={`/events/${report.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 font-medium text-brand-navy hover:underline"
                              >
                                Buka Event ↗
                              </Link>
                            </div>
                          </div>

                          {isOpen && (
                            <div className="flex items-center gap-2 sm:self-center">
                              <button
                                type="button"
                                disabled={isMutating}
                                onClick={() => void handleReviewReport(report.id, 'reviewed')}
                                className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Tandai Selesai</span>
                              </button>
                              <button
                                type="button"
                                disabled={isMutating}
                                onClick={() => void handleReviewReport(report.id, 'dismissed')}
                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-border-subtle bg-white px-3 text-xs font-semibold text-brand-charcoal transition-all hover:bg-black/[0.04] active:scale-95 disabled:opacity-50"
                              >
                                <span>Tolak Laporan</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Kategori Event */}
        {ready && activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Create Category Card */}
            <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-xs">
              <h2 className="font-headline text-lg font-bold text-brand-charcoal">
                Tambah Kategori Event Baru
              </h2>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Kategori akan muncul pada formulir pembuatan event cupping session dan filter publik.
              </p>

              <form onSubmit={handleAddCategory} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Misal: Public Cupping, Roaster Workshop, Sensory Class..."
                  maxLength={80}
                  className="h-10 flex-1 rounded-xl border border-border-subtle bg-[#F8FAFC] px-3.5 text-xs text-brand-charcoal placeholder-on-surface-variant focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy"
                />
                <button
                  type="submit"
                  disabled={newCategoryName.trim().length < 2 || actionInProgress === 'add-category'}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-charcoal px-5 text-xs font-semibold text-white transition-all hover:bg-brand-navy active:scale-95 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Kategori</span>
                </button>
              </form>
            </div>

            {/* Existing Categories List */}
            <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-xs">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="font-sans text-sm font-bold text-brand-charcoal">
                  Daftar Kategori Aktif ({categories.length})
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Klik pada tag untuk mengaktifkan atau menonaktifkan visibilitas kategori.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {categories.map((category) => {
                  const isMutating = actionInProgress === `category-${category.slug}`;

                  return (
                    <button
                      key={category.slug}
                      type="button"
                      disabled={isMutating}
                      onClick={() => void handleToggleCategory(category.slug, category.active)}
                      className={`group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${
                        category.active
                          ? 'border-brand-teal/40 bg-brand-teal/10 text-brand-charcoal hover:bg-brand-teal/20'
                          : 'border-border-subtle bg-[#F1F5F9] text-on-surface-variant hover:bg-black/10'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          category.active ? 'bg-brand-teal' : 'bg-gray-400'
                        }`}
                      />
                      <span>{category.name}</span>
                      <span className="font-mono text-[10px] text-on-surface-variant/80">
                        {category.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {ready && activeTab === 'audit' && (
          <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-xs">
            <div className="border-b border-border-subtle pb-3">
              <h2 className="font-headline text-lg font-bold text-brand-charcoal">
                Riwayat Audit Moderasi
              </h2>
              <p className="text-xs text-on-surface-variant">
                Catatan tindakan administratif terhadap event, akun penyelenggara, dan laporan publik.
              </p>
            </div>

            {audit.length === 0 ? (
              <p className="mt-6 text-center text-xs text-on-surface-variant">
                Belum ada aktivitas moderasi tercatat.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-border-subtle font-mono text-xs">
                {audit.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 font-sans text-[10px] font-bold text-brand-charcoal uppercase">
                        {entry.actor_role}
                      </span>
                      <span className="font-sans font-semibold text-brand-charcoal">
                        {entry.action}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        Target: {entry.event_id ?? 'Kategori/Organizer'}
                      </span>
                    </div>

                    <span className="text-[11px] text-on-surface-variant">
                      {new Date(entry.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
