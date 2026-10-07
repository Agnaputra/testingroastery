'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Coffee,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Plus,
  Edit2,
  Check,
  X,
  Shield,
  Layers,
  Sparkles,
  ArrowUpRight,
  RotateCcw,
  Boxes,
  Lock,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { PRODUCTS, formatRupiah, CoffeeProduct } from '../../lib/data';
import {
  OWNER_CATALOG_PRODUCTS,
  OWNER_SLOWBAR_ITEMS,
  OwnerCatalogProduct,
  OwnerSlowbarItem,
  ACTIVE_CATALOG_MAPPING,
} from '../../lib/catalog-master';
import { useOrderStore, OrderRecord, OrderStatus, CourierType } from '../../lib/store/useOrderStore';

type AdminTab =
  | 'overview'
  | 'catalog'
  | 'inventory'
  | 'orders'
  | 'slowbar'
  | 'financials';

const DEFAULT_PUBLISHED_ROWS = new Set(ACTIVE_CATALOG_MAPPING.map((mapping) => mapping.masterRow));

function publicationRowsFromOverrides(overrides: Record<string, boolean>): Set<number> {
  const rows = new Set<number>();
  DEFAULT_PUBLISHED_ROWS.forEach((row) => {
    const mappings = ACTIVE_CATALOG_MAPPING.filter((mapping) => mapping.masterRow === row);
    if (mappings.every((mapping) =>
      overrides[mapping.slug] !== false && (!mapping.knowledgeSlug || overrides[mapping.knowledgeSlug] !== false)
    )) rows.add(row);
  });
  return rows;
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-mono text-xs text-on-surface-variant">Memuat Portal Roastery Admin...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Authentication PIN state for Roastery Staff
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [catalogSyncError, setCatalogSyncError] = useState('');
  const [updatingRow, setUpdatingRow] = useState<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch('/api/admin/session', { cache: 'no-store' }),
      fetch('/api/catalog/publication', { cache: 'no-store' }),
    ]).then(async ([sessionResponse, publicationResponse]) => {
      if (sessionResponse.ok) {
        const session = (await sessionResponse.json()) as { authenticated?: boolean };
        setIsAuthenticated(session.authenticated === true);
      }
      if (publicationResponse.ok) {
        const publication = (await publicationResponse.json()) as { overrides?: Record<string, boolean> };
        setPublishedRows(publicationRowsFromOverrides(publication.overrides ?? {}));
      } else {
        setCatalogSyncError('Status katalog belum dapat dimuat.');
      }
    }).catch(() => setCatalogSyncError('Status katalog belum dapat dimuat.'));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pinInput.trim() }),
    });
    if (response.ok) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('PIN roastery tidak sesuai.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    setIsAuthenticated(false);
    setPinInput('');
  };

  // Orders from Zustand persist store
  const { orders, updateOrderStatus, updateShipping } = useOrderStore();

  // Local state for Master Products (initialized with all 55 items from catalog-master)
  const [masterItems, setMasterItems] = useState<OwnerCatalogProduct[]>(OWNER_CATALOG_PRODUCTS);
  const [publishedRows, setPublishedRows] = useState<Set<number>>(() => new Set(DEFAULT_PUBLISHED_ROWS));

  // Slowbar availability state (barista toggle: bean is out of stock on bar today)
  const [slowbarOutOfStock, setSlowbarOutOfStock] = useState<Set<string>>(new Set(['Arkana', 'Gayo']));

  // Catalog tab filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState<'all' | 'published' | 'draft' | 'review'>('all');

  // Edit Price Modal / Drawer state
  const [editingProduct, setEditingProduct] = useState<OwnerCatalogProduct | null>(null);
  const [price100g, setPrice100g] = useState('');
  const [price200g, setPrice200g] = useState('');
  const [price500g, setPrice500g] = useState('');
  const [priceCup, setPriceCup] = useState('');

  // Shipping modal state
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<CourierType>('JNE Reguler');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Stock inventory levels per master row (units of 200g pouches)
  const [stockLevels, setStockLevels] = useState<Record<number, number>>({
    1: 18, 2: 14, 3: 8, 5: 12, 8: 6, 10: 22, 11: 15,
    12: 28, 13: 16, 14: 19, 15: 42, 16: 25, 17: 11,
    19: 9, 20: 7, 21: 14, 22: 12, 23: 8, 39: 15, 41: 10,
    29: 4, 30: 2, 31: 3, 32: 5, 33: 7, // Grand Reserve low stock
    24: 35, 25: 20, 18: 24, 27: 0, 28: 18,
  });

  // Calculate high-level financial metrics from live store
  const metrics = useMemo(() => {
    const totalGrossRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const totalBeansRevenue = orders.reduce((acc, o) => acc + o.subtotal, 0);
    const totalOrdersCount = orders.length;
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalGrossRevenue / totalOrdersCount) : 0;
    
    // Estimated ~48% average roastery gross profit margin after HPP green beans, gas roasting & valve packaging
    const estimatedNetProfit = Math.round(totalBeansRevenue * 0.48);

    const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'roasting').length;
    const shippedOrdersCount = orders.filter((o) => o.status === 'shipped').length;

    return {
      totalGrossRevenue,
      estimatedNetProfit,
      totalOrdersCount,
      avgOrderValue,
      pendingOrdersCount,
      shippedOrdersCount,
    };
  }, [orders]);

  // Master product counts
  const catalogStats = useMemo(() => {
    const published = masterItems.filter((p) => publishedRows.has(p.sourceRow)).length;
    const review = masterItems.filter(
      (p) =>
        p.prices.filter100g === '-' &&
        p.prices.filter200g === '-' &&
        p.prices.espresso200g === '-' &&
        p.prices.reserve100g === '-'
    ).length;
    const draft = masterItems.length - published - review;
    return { published, draft, review, total: masterItems.length };
  }, [masterItems, publishedRows]);

  // Handle Publish / Unpublish Toggle
  const handleTogglePublish = async (row: number) => {
    const slugs = ACTIVE_CATALOG_MAPPING
      .filter((mapping) => mapping.masterRow === row)
      .flatMap((mapping) => [mapping.slug, mapping.knowledgeSlug].filter((slug): slug is string => Boolean(slug)));
    if (slugs.length === 0 || updatingRow !== null) return;
    const nextPublished = !publishedRows.has(row);
    setCatalogSyncError('');
    setUpdatingRow(row);
    setPublishedRows((previous) => {
      const next = new Set(previous);
      if (nextPublished) next.add(row);
      else next.delete(row);
      return next;
    });
    try {
      const response = await fetch('/api/catalog/publication', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs, isPublished: nextPublished }),
      });
      if (!response.ok) throw new Error('Publication update failed');
    } catch {
      setPublishedRows((previous) => {
        const reverted = new Set(previous);
        if (nextPublished) reverted.delete(row);
        else reverted.add(row);
        return reverted;
      });
      setCatalogSyncError('Perubahan gagal disimpan. Silakan masuk ulang dan coba lagi.');
    } finally {
      setUpdatingRow(null);
    }
  };

  // Open Price Editor
  const openEditModal = (p: OwnerCatalogProduct) => {
    setEditingProduct(p);
    setPrice100g(p.prices.filter100g !== '-' ? p.prices.filter100g : '');
    setPrice200g(p.prices.filter200g !== '-' ? p.prices.filter200g : '');
    setPrice500g(p.prices.filter500g !== '-' ? p.prices.filter500g : '');
    setPriceCup(p.prices.slowbarCup !== '-' ? p.prices.slowbarCup : '');
  };

  // Save Price Editor
  const saveProductPrice = () => {
    if (!editingProduct) return;
    setMasterItems((prev) =>
      prev.map((item) => {
        if (item.sourceRow === editingProduct.sourceRow) {
          return {
            ...item,
            prices: {
              ...item.prices,
              filter100g: price100g.trim() || item.prices.filter100g,
              filter200g: price200g.trim() || item.prices.filter200g,
              filter500g: price500g.trim() || item.prices.filter500g,
              slowbarCup: priceCup.trim() || item.prices.slowbarCup,
            },
          };
        }
        return item;
      })
    );
    setEditingProduct(null);
  };

  // Save Shipping Tracking Info
  const handleSaveShipping = () => {
    if (!shippingOrderId) return;
    updateShipping(shippingOrderId, selectedCourier, trackingNumberInput.trim());
    setShippingOrderId(null);
    setTrackingNumberInput('');
  };

  // Filtered master catalog items
  const filteredCatalog = useMemo(() => {
    return masterItems.filter((item) => {
      const isPublished = publishedRows.has(item.sourceRow);
      const isReview =
        item.prices.filter100g === '-' &&
        item.prices.filter200g === '-' &&
        item.prices.espresso200g === '-' &&
        item.prices.reserve100g === '-';
      const isDraft = !isPublished && !isReview;

      if (catalogStatusFilter === 'published' && !isPublished) return false;
      if (catalogStatusFilter === 'draft' && !isDraft) return false;
      if (catalogStatusFilter === 'review' && !isReview) return false;

      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase().trim();
        const match =
          item.name.toLowerCase().includes(q) ||
          item.slowbarAlias.toLowerCase().includes(q) ||
          item.origin.toLowerCase().includes(q) ||
          item.seriesExcel.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [masterItems, publishedRows, catalogStatusFilter, catalogSearch]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#F8FAFC]" />;
  }

  // Standalone PIN Access Gate for Roastery Backoffice
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center px-4 py-12 text-slate-100">
        <div className="w-full max-w-md bg-white text-brand-charcoal rounded-sm border border-slate-200 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-brand-maroon/10 text-brand-maroon flex items-center justify-center mx-auto border border-brand-maroon/20">
              <Lock size={22} />
            </div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-maroon">
              52 Coffee &amp; Roastery
            </div>
            <h1 className="font-headline text-2xl font-bold text-brand-charcoal">
              Portal Khusus Roastery
            </h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Halaman operasional independen untuk memantau omset, katalog 55 master SKU, stok pouch, pengiriman resi, dan kalkulasi HPP rahasia.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold text-center">
                Masukkan PIN Keamanan
              </label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="• • • •"
                className="w-full rounded-sm border border-black/20 p-3 text-center font-mono text-2xl tracking-[0.3em] font-bold focus:border-brand-maroon focus:outline-none"
                autoFocus
              />
              {pinError ? (
                <p className="text-xs text-red-600 font-mono text-center font-medium">{pinError}</p>
              ) : (
                <p className="text-[10px] text-on-surface-variant font-mono text-center">
                  Gunakan PIN staff yang dikonfigurasi untuk portal ini.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xs bg-brand-navy py-3 font-mono text-xs font-bold text-white hover:bg-brand-navy-light transition-colors"
            >
              Buka Portal Roastery
            </button>

          </form>

          <div className="border-t border-black/10 pt-4 text-center">
            <Link
              href="/"
              className="font-mono text-xs text-on-surface-variant hover:text-brand-maroon transition-colors"
            >
              ← Kembali ke Toko Publik Pelanggan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-brand-charcoal">
      {/* Top Admin Navigation Bar */}
      <div className="border-b border-border-subtle bg-white shadow-2xs">
        <div className="site-container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-brand-charcoal text-white flex items-center justify-center font-black font-headline text-lg">
              52
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-maroon">
                <Shield size={12} aria-hidden="true" />
                <span>52 Coffee &amp; Roastery — Operations Backoffice</span>
              </div>
              <h1 className="font-headline text-xl font-bold tracking-tight text-brand-charcoal sm:text-2xl">
                Roastery Master Dashboard
              </h1>
            </div>
          </div>

          {/* Quick Access Badges & Live Status */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 border border-emerald-200 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Roastery Sync
            </span>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xs border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-brand-charcoal hover:border-brand-maroon hover:text-brand-maroon transition-colors"
              title="Buka toko publik di tab baru"
            >
              <span>Lihat Toko Publik</span>
              <ExternalLink size={12} />
            </Link>
            <Link
              href="/track"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xs border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-brand-charcoal hover:border-brand-maroon hover:text-brand-maroon transition-colors"
              title="Buka pelacakan pengiriman pelanggan"
            >
              <span>Lacak Resi</span>
              <ExternalLink size={12} />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xs border border-red-200 bg-red-50/70 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
              title="Kunci layar dan keluar dari sesi admin"
            >
              <LogOut size={12} />
              <span>Kunci Layar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="site-container overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 border-t border-black/5 pt-2 pb-1">
            {[
              { id: 'overview', label: 'Overview & Keuangan', icon: TrendingUp },
              { id: 'catalog', label: `Master Katalog (${catalogStats.total})`, icon: Layers },
              { id: 'inventory', label: 'Stok & Roasting', icon: Boxes },
              { id: 'orders', label: `Pesanan (${orders.length})`, icon: ShoppingBag },
              { id: 'slowbar', label: 'Konsol Slowbar (33)', icon: Coffee },
              { id: 'financials', label: 'HPP & Margin Rahasia', icon: DollarSign },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id as AdminTab)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-t-sm px-4 py-2.5 text-xs font-semibold transition-all border-b-2 ${
                    isActive
                      ? 'border-brand-maroon text-brand-maroon bg-brand-maroon/[0.04]'
                      : 'border-transparent text-on-surface-variant hover:text-brand-charcoal hover:bg-black/[0.02]'
                  }`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="site-container pt-8 space-y-8">
        {/* ========================================================================= */}
        {/* 1. TAB: OVERVIEW & REVENUE ANALYTICS                                      */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Financial Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-sm border border-border-subtle bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Total Omset Penjualan
                  </span>
                  <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div className="mt-3 font-mono text-2xl font-bold text-brand-charcoal">
                  {formatRupiah(metrics.totalGrossRevenue)}
                </div>
                <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-emerald-600 font-semibold">
                  <TrendingUp size={11} />
                  <span>Termasuk {metrics.totalOrdersCount} transaksi store</span>
                </div>
              </div>

              <div className="rounded-sm border border-border-subtle bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Estimasi Laba Bersih Roastery
                  </span>
                  <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div className="mt-3 font-mono text-2xl font-bold text-brand-charcoal">
                  {formatRupiah(metrics.estimatedNetProfit)}
                </div>
                <p className="mt-1 font-mono text-[10px] text-on-surface-variant">
                  Margin kotor rata-rata: ~48% setelah HPP Green Bean
                </p>
              </div>

              <div className="rounded-sm border border-border-subtle bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Pesanan Perlu Diproses
                  </span>
                  <div className="rounded-full bg-amber-50 p-2 text-amber-600">
                    <Clock size={16} />
                  </div>
                </div>
                <div className="mt-3 font-mono text-2xl font-bold text-brand-charcoal">
                  {metrics.pendingOrdersCount} Order
                </div>
                <p className="mt-1 font-mono text-[10px] text-amber-700">
                  {metrics.shippedOrdersCount} paket sedang dalam pengiriman kurir
                </p>
              </div>

              <div className="rounded-sm border border-border-subtle bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Status Katalog Aktif
                  </span>
                  <div className="rounded-full bg-purple-50 p-2 text-purple-600">
                    <Coffee size={16} />
                  </div>
                </div>
                <div className="mt-3 font-mono text-2xl font-bold text-brand-charcoal">
                  {catalogStats.published} / {catalogStats.total}
                </div>
                <p className="mt-1 font-mono text-[10px] text-on-surface-variant">
                  {catalogStats.draft} draft · {catalogStats.review} butuh review owner
                </p>
              </div>
            </div>

            {/* Sales Channel Breakdown & Top Beans */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Channel Distribution */}
              <div className="rounded-sm border border-border-subtle bg-white p-6 shadow-2xs">
                <h3 className="font-headline text-lg font-bold text-brand-charcoal">
                  Distribusi Pendapatan per Channel
                </h3>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Alokasi omset berdasarkan kemasan ritel, seduhan Slowbar, dan B2B roastery
                </p>

                <div className="mt-6 space-y-4 font-mono text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Biji Kopi Kemasan Ritel (Pouch)</span>
                      <span>68% · {formatRupiah(Math.round(metrics.totalGrossRevenue * 0.68))}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/[0.06] overflow-hidden">
                      <div className="h-full bg-brand-navy rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Seduhan Cangkir Slowbar Cafe</span>
                      <span>22% · {formatRupiah(Math.round(metrics.totalGrossRevenue * 0.22))}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/[0.06] overflow-hidden">
                      <div className="h-full bg-brand-maroon rounded-full" style={{ width: '22%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Pasokan Grosir Mitra Kedai (B2B)</span>
                      <span>10% · {formatRupiah(Math.round(metrics.totalGrossRevenue * 0.10))}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/[0.06] overflow-hidden">
                      <div className="h-full bg-brand-teal rounded-full" style={{ width: '10%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 4 Performing Specialty Beans */}
              <div className="rounded-sm border border-border-subtle bg-white p-6 shadow-2xs">
                <h3 className="font-headline text-lg font-bold text-brand-charcoal">
                  Top 4 Specialty Beans Terlaris
                </h3>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Kopi dengan volume pesanan dan repeat order tertinggi bulan ini
                </p>

                <div className="mt-5 divide-y divide-black/10">
                  {[
                    { name: 'Ijen Carbonic Maceration (Asmara)', series: 'Ijen Series', count: '48 pouch', total: 'Rp 4.250.000' },
                    { name: 'Sumbing Supernova Wash (Celestia)', series: 'Java Exotic', count: '36 pouch', total: 'Rp 3.890.000' },
                    { name: 'Puntang Natural Aromanis', series: 'Sunda Series', count: '29 pouch', total: 'Rp 2.950.000' },
                    { name: 'Magnum Sidra Colombia (Soberano)', series: 'Grand Reserve', count: '18 tube', total: 'Rp 3.600.000' },
                  ].map((bean, idx) => (
                    <div key={bean.name} className="flex items-center justify-between py-3 font-mono text-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.05] font-bold text-brand-charcoal text-[11px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-sans font-semibold text-brand-charcoal text-sm">{bean.name}</div>
                          <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">{bean.series}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-brand-charcoal">{bean.count}</div>
                        <div className="text-[10px] text-on-surface-variant">{bean.total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. TAB: MASTER CATALOG & PUBLICATION GATE                                  */}
        {/* ========================================================================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Action Bar: Search & Status Filter */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-sm border border-border-subtle shadow-2xs">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Cari dari 55 master products, alias, atau origin..."
                  className="w-full rounded-sm border border-black/15 bg-white pl-9 pr-3 py-2 text-xs focus:border-brand-maroon focus:outline-none"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                {[
                  { id: 'all', label: `Semua (${catalogStats.total})` },
                  { id: 'published', label: `Published (${catalogStats.published})` },
                  { id: 'draft', label: `Draft (${catalogStats.draft})` },
                  { id: 'review', label: `Needs Review (${catalogStats.review})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCatalogStatusFilter(f.id as typeof catalogStatusFilter)}
                    className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                      catalogStatusFilter === f.id
                        ? 'bg-brand-charcoal text-white'
                        : 'bg-black/[0.04] text-brand-charcoal hover:bg-black/[0.08]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {catalogSyncError && (
              <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                {catalogSyncError}
              </p>
            )}

            {/* Master Catalog Table */}
            <div className="overflow-x-auto rounded-sm border border-border-subtle bg-white shadow-2xs">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-black/10 bg-[#f9f9f6] text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Row</th>
                    <th className="py-3.5 px-4 font-sans">Produk & Alias</th>
                    <th className="py-3.5 px-4">Seri Excel</th>
                    <th className="py-3.5 px-4">Origin</th>
                    <th className="py-3.5 px-4">Harga 100g / 200g</th>
                    <th className="py-3.5 px-4">Status Rilis</th>
                    <th className="py-3.5 px-4 text-right">Aksi Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {filteredCatalog.map((item) => {
                    const isPublished = publishedRows.has(item.sourceRow);
                    const hasWebMapping = ACTIVE_CATALOG_MAPPING.some((mapping) => mapping.masterRow === item.sourceRow);
                    const isReview =
                      item.prices.filter100g === '-' &&
                      item.prices.filter200g === '-' &&
                      item.prices.espresso200g === '-' &&
                      item.prices.reserve100g === '-';

                    return (
                      <tr key={item.sourceRow} className="hover:bg-[#fafaf7] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-brand-charcoal">#{item.sourceRow}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-sans font-bold text-sm text-brand-charcoal">{item.name}</div>
                          {item.slowbarAlias && item.slowbarAlias !== '-' && (
                            <div className="text-[10px] text-brand-maroon font-semibold">
                              Slowbar Alias: {item.slowbarAlias}
                            </div>
                          )}
                          {item.ownerNote && (
                            <div className="text-[10px] text-amber-700 font-sans mt-0.5 max-w-xs truncate" title={item.ownerNote}>
                              Catatan: {item.ownerNote}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant">{item.seriesExcel}</td>
                        <td className="py-3.5 px-4 text-on-surface-variant">{item.origin || 'Indonesia'}</td>
                        <td className="py-3.5 px-4">
                          {item.prices.filter100g !== '-' ? (
                            <span>100g: Rp{item.prices.filter100g}k · 200g: Rp{item.prices.filter200g}k</span>
                          ) : item.prices.espresso200g !== '-' ? (
                            <span>200g: Rp{item.prices.espresso200g}k (Espresso)</span>
                          ) : item.prices.reserve100g !== '-' ? (
                            <span>100g: Rp{item.prices.reserve100g}k (Reserve)</span>
                          ) : (
                            <span className="text-amber-700 font-bold">Harga Kosong</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isPublished ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={10} /> Published
                            </span>
                          ) : isReview ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                              <AlertTriangle size={10} /> Needs Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-300">
                              <Clock size={10} /> Draft (Siap)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="rounded-xs border border-black/15 bg-white p-1.5 text-brand-charcoal hover:bg-black/[0.04]"
                              title="Edit Harga"
                              aria-label={`Edit harga ${item.name}`}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleTogglePublish(item.sourceRow)}
                              disabled={!hasWebMapping || updatingRow !== null}
                              title={hasWebMapping ? undefined : 'Produk ini belum memiliki mapping ke katalog website.'}
                              className={`rounded-xs px-3 py-1 text-[10px] font-bold uppercase transition-colors ${
                                !hasWebMapping
                                  ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                                  : isPublished
                                  ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'border border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {!hasWebMapping ? 'Belum Dipetakan' : updatingRow === item.sourceRow ? 'Menyimpan...' : isPublished ? 'Tarik Draft' : 'Aktifkan'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. TAB: INVENTORY & ROASTING BATCHES                                      */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-sm border border-border-subtle shadow-2xs">
              <h3 className="font-headline text-lg font-bold text-brand-charcoal">
                Inventaris Biji Kopi Sangrai Siap Kirim
              </h3>
              <p className="mt-1 text-xs text-on-surface-variant">
                Pantau stok pouch (200g/500g/1kg), identifikasi lot menipis (*low stock*), dan catat tanggal sangrai (*freshness resting*)
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {masterItems.slice(0, 18).map((p) => {
                  const qty = stockLevels[p.sourceRow] ?? 12;
                  const isLow = qty <= 5 && qty > 0;
                  const isSoldOut = qty === 0;

                  return (
                    <div
                      key={p.sourceRow}
                      className={`p-4 rounded-sm border ${
                        isSoldOut
                          ? 'border-red-200 bg-red-50/40'
                          : isLow
                          ? 'border-amber-200 bg-amber-50/40'
                          : 'border-border-subtle bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant">
                            {p.seriesExcel} · Row #{p.sourceRow}
                          </div>
                          <h4 className="font-sans font-bold text-sm text-brand-charcoal mt-0.5">
                            {p.name}
                          </h4>
                        </div>
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isSoldOut
                              ? 'bg-red-100 text-red-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isSoldOut ? 'Sold Out' : isLow ? 'Stok Menipis' : 'Ready Stock'}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between font-mono text-xs border-t border-black/5 pt-3">
                        <span className="text-on-surface-variant">Tersedia di Rak:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setStockLevels((prev) => ({
                                ...prev,
                                [p.sourceRow]: Math.max(0, (prev[p.sourceRow] ?? 12) - 1),
                              }))
                            }
                            className="h-6 w-6 rounded-xs border border-black/15 bg-white font-bold hover:bg-black/[0.04]"
                          >
                            -
                          </button>
                          <span className="font-bold text-sm text-brand-charcoal min-w-[2rem] text-center">
                            {qty} pouch
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setStockLevels((prev) => ({
                                ...prev,
                                [p.sourceRow]: (prev[p.sourceRow] ?? 12) + 1,
                              }))
                            }
                            className="h-6 w-6 rounded-xs border border-black/15 bg-white font-bold hover:bg-black/[0.04]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. TAB: ORDERS & SHIPPING RESI MANAGER                                    */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-sm border border-border-subtle shadow-2xs">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 className="font-headline text-lg font-bold text-brand-charcoal">
                    Daftar Pesanan & Status Ekspedisi
                  </h3>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    Update status sangrai, assign kurir (JNE/J&T/Paxel), dan input nomor resi yang terhubung ke `/track`
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-black/10 bg-[#f9f9f6] text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                    <tr>
                      <th className="py-3 px-4">Kode Order</th>
                      <th className="py-3 px-4 font-sans">Pelanggan</th>
                      <th className="py-3 px-4">Item Dipesan</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status Pesanan</th>
                      <th className="py-3 px-4">Kurir & Resi</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#fafaf7] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-brand-maroon">{o.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-sans font-semibold text-brand-charcoal">{o.customerName}</div>
                          <div className="text-[10px] text-on-surface-variant">{o.customerPhone}</div>
                          <div className="text-[10px] text-on-surface-variant truncate max-w-[180px]">{o.customerAddress}, {o.customerCity}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="font-sans text-xs">
                              {it.quantity}x {it.name} ({it.weightLabel}, {it.grindLabel})
                            </div>
                          ))}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-brand-charcoal">
                          {formatRupiah(o.total)}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                            className="rounded-xs border border-black/20 bg-white px-2 py-1 text-[11px] font-semibold text-brand-charcoal"
                          >
                            <option value="pending">Menunggu Pembayaran</option>
                            <option value="roasting">Sedang Disangrai / Packing</option>
                            <option value="shipped">Sudah Dikirim Kurir</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          {o.trackingNumber ? (
                            <div>
                              <div className="font-bold text-emerald-700">{o.courier}</div>
                              <div className="text-[10px] font-mono text-on-surface-variant">{o.trackingNumber}</div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-bold">Belum ada resi</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/track?order=${o.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 rounded-xs border border-black/15 bg-white px-2.5 py-1 text-[10px] font-semibold text-brand-charcoal hover:border-brand-maroon hover:text-brand-maroon transition-colors"
                              title="Lihat halaman tracking pelanggan"
                            >
                              <ExternalLink size={10} />
                              <span>Lacak</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setShippingOrderId(o.id);
                                setSelectedCourier(o.courier || 'JNE Reguler');
                                setTrackingNumberInput(o.trackingNumber || '');
                              }}
                              className="inline-flex items-center gap-1 rounded-xs border border-brand-charcoal bg-brand-charcoal px-3 py-1 text-[10px] font-bold text-white hover:bg-brand-maroon transition-colors"
                            >
                              <Truck size={11} /> Input Resi
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. TAB: SLOWBAR CAFE CONSOLE                                              */}
        {/* ========================================================================= */}
        {activeTab === 'slowbar' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-sm border border-border-subtle shadow-2xs">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 className="font-headline text-lg font-bold text-brand-charcoal">
                    Konsol Barista Meja Slowbar (33 Menu)
                  </h3>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    Beri tanda biji yang ready atau habis diseduh hari ini. Perubahan langsung tersinkron ke halaman publik
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {OWNER_SLOWBAR_ITEMS.map((item) => {
                  const isOut = slowbarOutOfStock.has(item.alias);

                  return (
                    <div
                      key={item.alias}
                      className={`p-4 rounded-sm border transition-colors flex items-center justify-between ${
                        isOut ? 'border-red-200 bg-red-50/50' : 'border-border-subtle bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant">
                          {item.series}
                        </div>
                        <h4 className="font-headline font-bold text-base text-brand-charcoal mt-0.5">
                          {item.alias}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant truncate max-w-[180px]">
                          {item.baseBean}
                        </p>
                        <div className="mt-1 font-mono text-xs font-bold text-brand-charcoal">
                          Rp{item.cupPrice}k / cangkir
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSlowbarOutOfStock((prev) => {
                            const next = new Set(prev);
                            if (next.has(item.alias)) {
                              next.delete(item.alias);
                            } else {
                              next.add(item.alias);
                            }
                            return next;
                          });
                        }}
                        className={`rounded-xs px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition-colors ${
                          isOut
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {isOut ? 'Habis Hari Ini' : 'Ready di Bar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. TAB: CONFIDENTIAL FINANCIALS & HPP (OWNER ONLY)                        */}
        {/* ========================================================================= */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div className="rounded-sm border border-amber-300 bg-amber-50 p-4 text-amber-900 flex items-start gap-3">
              <Shield size={18} className="shrink-0 mt-0.5 text-amber-700" />
              <div className="text-xs">
                <span className="font-bold block">Dokumen Rahasia Internal Roastery</span>
                Data HPP Green Bean, landed cost roasting, dan kalkulasi gross margin roastery ini diimpor langsung dari snapshot Excel owner dan terisolasi dari kode publik pelanggan (*Zero Margin Leak*).
              </div>
            </div>

            <div className="bg-white p-6 rounded-sm border border-border-subtle shadow-2xs overflow-x-auto">
              <h3 className="font-headline text-lg font-bold text-brand-charcoal mb-4">
                Kalkulasi HPP & Margin Kotor per Kategori Biji
              </h3>

              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-black/10 bg-[#f9f9f6] text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                  <tr>
                    <th className="py-3 px-4">Kategori Kopi</th>
                    <th className="py-3 px-4">Rata-rata HPP Green Bean / kg</th>
                    <th className="py-3 px-4">Susut Sangrai (Roast Shrinkage)</th>
                    <th className="py-3 px-4">Biaya Roasting + Valve Pouch</th>
                    <th className="py-3 px-4">Harga Retail (200g)</th>
                    <th className="py-3 px-4">Estimasi Gross Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  <tr>
                    <td className="py-3.5 px-4 font-bold">Ijen Series (Single Origin)</td>
                    <td className="py-3.5 px-4">Rp 120.000 – Rp 150.000</td>
                    <td className="py-3.5 px-4 text-amber-700">~15.5%</td>
                    <td className="py-3.5 px-4">Rp 12.500 / pouch</td>
                    <td className="py-3.5 px-4 font-bold">Rp 109.000 – Rp 120.000</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">52% – 58%</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold">Java Exotic (Fermentasi Spesial)</td>
                    <td className="py-3.5 px-4">Rp 220.000 – Rp 280.000</td>
                    <td className="py-3.5 px-4 text-amber-700">~14.8%</td>
                    <td className="py-3.5 px-4">Rp 14.000 / pouch</td>
                    <td className="py-3.5 px-4 font-bold">Rp 220.000 – Rp 259.000</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">48% – 54%</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold">Grand Reserve Micro-Lot (Colombia / Yemen)</td>
                    <td className="py-3.5 px-4">Rp 850.000 – Rp 1.400.000</td>
                    <td className="py-3.5 px-4 text-amber-700">~13.2%</td>
                    <td className="py-3.5 px-4">Rp 25.000 / tube kaca</td>
                    <td className="py-3.5 px-4 font-bold">Rp 350.000 – Rp 380.000 (100g)</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">62% – 66%</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold">Espresso Roast & Robusta</td>
                    <td className="py-3.5 px-4">Rp 65.000 – Rp 95.000</td>
                    <td className="py-3.5 px-4 text-amber-700">~18.0%</td>
                    <td className="py-3.5 px-4">Rp 9.500 / pouch</td>
                    <td className="py-3.5 px-4 font-bold">Rp 60.000 – Rp 75.000 (200g)</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">45% – 50%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* EDIT PRICE MODAL / DRAWER                                                 */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-sm border border-border-subtle p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                  Edit Harga Retail & Slowbar
                </span>
                <h4 className="font-headline font-bold text-lg text-brand-charcoal mt-0.5">
                  {editingProduct.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 text-on-surface-variant hover:text-brand-charcoal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                  Harga Kemasan 100g (dalam ribuan, misal 65 untuk Rp65.000)
                </label>
                <input
                  type="text"
                  value={price100g}
                  onChange={(e) => setPrice100g(e.target.value)}
                  placeholder="65"
                  className="w-full rounded-sm border border-black/20 p-2 text-sm font-bold text-brand-charcoal"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                  Harga Kemasan 200g (dalam ribuan, misal 120 untuk Rp120.000)
                </label>
                <input
                  type="text"
                  value={price200g}
                  onChange={(e) => setPrice200g(e.target.value)}
                  placeholder="120"
                  className="w-full rounded-sm border border-black/20 p-2 text-sm font-bold text-brand-charcoal"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                  Harga Kemasan 500g (dalam ribuan, misal 300 untuk Rp300.000)
                </label>
                <input
                  type="text"
                  value={price500g}
                  onChange={(e) => setPrice500g(e.target.value)}
                  placeholder="300"
                  className="w-full rounded-sm border border-black/20 p-2 text-sm font-bold text-brand-charcoal"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                  Harga Cangkir Slowbar (dalam ribuan, misal 38 untuk Rp38.000)
                </label>
                <input
                  type="text"
                  value={priceCup}
                  onChange={(e) => setPriceCup(e.target.value)}
                  placeholder="38"
                  className="w-full rounded-sm border border-black/20 p-2 text-sm font-bold text-brand-charcoal"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-xs border border-black/15 bg-white px-4 py-2 font-mono text-xs font-semibold text-brand-charcoal hover:bg-black/[0.04]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveProductPrice}
                className="rounded-xs bg-brand-navy px-4 py-2 font-mono text-xs font-bold text-white hover:bg-brand-navy-light"
              >
                Simpan & Rilis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INPUT RESI MODAL                                                          */}
      {/* ========================================================================= */}
      {shippingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-sm border border-border-subtle p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                  Update Pengiriman & Nomor Resi
                </span>
                <h4 className="font-headline font-bold text-lg text-brand-charcoal mt-0.5">
                  Order ID: {shippingOrderId}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShippingOrderId(null)}
                className="p-1 text-on-surface-variant hover:text-brand-charcoal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                  Pilih Ekspedisi / Kurir
                </label>
                <select
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value as CourierType)}
                  className="w-full rounded-sm border border-black/20 p-2 text-sm font-semibold text-brand-charcoal bg-white"
                >
                  <option value="JNE Reguler">JNE Reguler</option>
                  <option value="J&T Express">J&T Express</option>
                  <option value="SiCepat BEST">SiCepat BEST</option>
                  <option value="Paxel Sameday">Paxel Sameday</option>
                  <option value="Pickup Di Kedai">Pickup Di Kedai</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                  Nomor Resi Pengiriman (AWB)
                </label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="JNE-982018290123"
                  className="w-full rounded-sm border border-black/20 p-2 text-sm font-mono font-bold text-brand-charcoal"
                />
                <p className="mt-1 text-[10px] font-sans text-on-surface-variant">
                  Nomor resi ini akan langsung dapat dicek oleh pelanggan di halaman pelacakan <code>/track</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setShippingOrderId(null)}
                className="rounded-xs border border-black/15 bg-white px-4 py-2 font-mono text-xs font-semibold text-brand-charcoal hover:bg-black/[0.04]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveShipping}
                className="rounded-xs bg-brand-navy px-4 py-2 font-mono text-xs font-bold text-white hover:bg-brand-navy-light"
              >
                Simpan & Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
