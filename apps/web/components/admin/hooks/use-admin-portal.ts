'use client';

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { PRODUCTS } from '../../../lib/data';
import {
  OWNER_CATALOG_PRODUCTS,
  OwnerCatalogProduct,
  ACTIVE_CATALOG_MAPPING,
} from '../../../lib/catalog-master';
import { useOrderStore, OrderStatus, CourierType } from '../../../lib/store/useOrderStore';
import { PRICE_TEST_MODE } from '../../../lib/catalog-publication';
import type { AdminMetrics, AdminCatalogStats } from '../types';

const DEFAULT_PUBLISHED_ROWS = new Set(ACTIVE_CATALOG_MAPPING.map((mapping) => mapping.masterRow));

function publicationRowsFromOverrides(overrides: Record<string, boolean>): Set<number> {
  const rows = new Set<number>();
  DEFAULT_PUBLISHED_ROWS.forEach((row) => {
    const mappings = ACTIVE_CATALOG_MAPPING.filter((mapping) => mapping.masterRow === row);
    if (
      mappings.every(
        (mapping) =>
          overrides[mapping.slug] !== false &&
          (!mapping.knowledgeSlug || overrides[mapping.knowledgeSlug] !== false)
      )
    ) {
      rows.add(row);
    }
  });
  return rows;
}

export function useAdminPortal() {
  // Authentication PIN state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<'credentials' | 'pin'>('pin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Catalog & Publication state
  const [catalogSyncError, setCatalogSyncError] = useState('');
  const [publicationLoaded, setPublicationLoaded] = useState(false);
  const [updatingRow, setUpdatingRow] = useState<number | null>(null);
  const [masterItems, setMasterItems] = useState<OwnerCatalogProduct[]>(OWNER_CATALOG_PRODUCTS);
  const [publishedRows, setPublishedRows] = useState<Set<number>>(new Set());
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState<'all' | 'published' | 'draft' | 'review'>('all');

  // Slowbar availability state
  const [slowbarOutOfStock, setSlowbarOutOfStock] = useState<Set<string>>(new Set(['Arkana', 'Gayo']));

  // Edit Price Modal state
  const [editingProduct, setEditingProduct] = useState<OwnerCatalogProduct | null>(null);
  const [price100g, setPrice100g] = useState('');
  const [price200g, setPrice200g] = useState('');
  const [price500g, setPrice500g] = useState('');
  const [priceCup, setPriceCup] = useState('');
  const [editingSlug, setEditingSlug] = useState('');
  const [effectivePrices, setEffectivePrices] = useState<Record<string, { amountIdr: number }>>({});
  const [editingAmounts, setEditingAmounts] = useState<Record<string, string>>({});
  const [priceRevision, setPriceRevision] = useState<number | null>(null);
  const [priceError, setPriceError] = useState('');

  // Shipping modal state
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<CourierType>('JNE Reguler');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Orders from Zustand store
  const { orders, updateOrderStatus, updateShipping } = useOrderStore();

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch('/api/admin/session', { cache: 'no-store' }),
      fetch('/api/catalog/publication', { cache: 'no-store' }),
    ])
      .then(async ([sessionResponse, publicationResponse]) => {
        if (sessionResponse.ok) {
          const session = (await sessionResponse.json()) as {
            authenticated?: boolean; credentialsRequired?: boolean; credentialsVerified?: boolean;
          };
          setIsAuthenticated(session.authenticated === true);
          setAuthStep(session.credentialsRequired && !session.credentialsVerified ? 'credentials' : 'pin');
        }
        if (publicationResponse.ok) {
          const publication = (await publicationResponse.json()) as { overrides?: Record<string, boolean> };
          setPublishedRows(publicationRowsFromOverrides(publication.overrides ?? {}));
          setPublicationLoaded(true);
        } else {
          setPublicationLoaded(false);
          setCatalogSyncError('Status katalog belum dapat dimuat.');
        }
      })
      .catch(() => {
        setPublicationLoaded(false);
        setCatalogSyncError('Status katalog belum dapat dimuat.');
      });
  }, []);

  useEffect(() => {
    if (!PRICE_TEST_MODE || !isAuthenticated) return;
    void fetch('/api/catalog/prices', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('price unavailable');
        const payload = (await response.json()) as {
          revision?: number;
          prices?: Record<string, { amountIdr: number }>;
        };
        if (!Number.isSafeInteger(payload.revision) || !payload.prices) {
          throw new Error('invalid price payload');
        }
        setEffectivePrices(payload.prices);
        setPriceRevision(payload.revision ?? null);
      })
      .catch(() => {
        setPriceRevision(null);
        setPriceError('Harga belum dapat diverifikasi.');
      });
  }, [isAuthenticated]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const credentials = authStep === 'credentials';
    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials
        ? { stage: 'credentials', username: username.trim(), password }
        : { stage: 'pin', pin: pinInput.trim() }),
    });
    if (response.ok) {
      if (credentials) {
        setAuthStep('pin');
        setPassword('');
      } else {
        setIsAuthenticated(true);
      }
      setPinError('');
    } else {
      const result = await response.json().catch(() => ({})) as { error?: string };
      setPinError(result.error ?? 'Akses admin ditolak.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    setIsAuthenticated(false);
    setAuthStep('credentials');
    setUsername('');
    setPassword('');
    setPinInput('');
  };

  const handleTogglePublish = async (row: number) => {
    const slugs = ACTIVE_CATALOG_MAPPING
      .filter((mapping) => mapping.masterRow === row)
      .flatMap((mapping) => [mapping.slug, mapping.knowledgeSlug].filter((slug): slug is string => Boolean(slug)));
    if (slugs.length === 0 || updatingRow !== null || !publicationLoaded) return;
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
      const confirmed = await fetch('/api/catalog/publication', { cache: 'no-store' });
      if (!confirmed.ok) throw new Error('Publication confirmation failed');
      const payload = (await confirmed.json()) as { overrides?: Record<string, boolean> };
      setPublishedRows(publicationRowsFromOverrides(payload.overrides ?? {}));
    } catch {
      setPublishedRows((previous) => {
        const reverted = new Set(previous);
        if (nextPublished) reverted.delete(row);
        else reverted.add(row);
        return reverted;
      });
      setCatalogSyncError('Perubahan gagal disimpan. Silakan masuk ulang dan coba lagi.');
      setPublicationLoaded(false);
    } finally {
      setUpdatingRow(null);
    }
  };

  const loadAdminPrices = async () => {
    const response = await fetch('/api/catalog/prices', { cache: 'no-store' });
    if (!response.ok) throw new Error('Harga belum dapat diverifikasi');
    const payload = (await response.json()) as {
      revision?: number;
      prices?: Record<string, { amountIdr: number }>;
    };
    if (!Number.isSafeInteger(payload.revision) || !payload.prices) {
      throw new Error('Respons harga tidak valid');
    }
    setEffectivePrices(payload.prices);
    setPriceRevision(payload.revision ?? null);
    return payload;
  };

  const selectPriceProfile = (slug: string, prices: Record<string, { amountIdr: number }>) => {
    const product = PRODUCTS.find((item) => item.slug === slug);
    if (!product) return;
    setEditingSlug(slug);
    const variants = [
      ...product.variants.map((variant) => `${slug}:beans:${variant.weightGrams}`),
      ...(product.cupPrice ? [`${slug}:cup:1`] : []),
    ];
    setEditingAmounts(Object.fromEntries(variants.map((sku) => [sku, String(prices[sku]?.amountIdr ?? '')])));
  };

  const openEditModal = async (p: OwnerCatalogProduct) => {
    setEditingProduct(p);
    if (PRICE_TEST_MODE) {
      setPriceError('Memuat harga efektif...');
      setPriceRevision(null);
      try {
        const payload = await loadAdminPrices();
        const mapping = ACTIVE_CATALOG_MAPPING.find((item) => item.masterRow === p.sourceRow);
        const slug = PRODUCTS.find((item) => item.id === mapping?.webId)?.slug ?? mapping?.slug;
        if (!slug) throw new Error('Produk belum memiliki mapping harga');
        selectPriceProfile(slug, payload.prices ?? {});
        setPriceError('');
      } catch (error) {
        setPriceError(error instanceof Error ? error.message : 'Harga tidak tersedia');
      }
      return;
    }
    setPrice100g(p.prices.filter100g !== '-' ? p.prices.filter100g : '');
    setPrice200g(p.prices.filter200g !== '-' ? p.prices.filter200g : '');
    setPrice500g(p.prices.filter500g !== '-' ? p.prices.filter500g : '');
    setPriceCup(p.prices.slowbarCup !== '-' ? p.prices.slowbarCup : '');
  };

  const saveProductPrice = async () => {
    if (!editingProduct) return;
    if (PRICE_TEST_MODE) {
      if (priceRevision === null || !editingSlug) return;
      const amounts: Record<string, number> = {};
      for (const [sku, input] of Object.entries(editingAmounts)) {
        const amount = Number(input.trim());
        if (!Number.isSafeInteger(amount) || amount <= 0) {
          setPriceError('Masukkan nominal Rupiah penuh yang positif untuk setiap variant.');
          return;
        }
        amounts[sku] = amount;
      }
      try {
        setPriceError('Menyimpan harga...');
        const response = await fetch('/api/catalog/prices', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: editingSlug, amounts, expectedRevision: priceRevision }),
        });
        if (!response.ok) {
          throw new Error(response.status === 409 ? 'Harga berubah. Muat ulang editor.' : 'Harga gagal disimpan.');
        }
        const result = (await response.json()) as { revision?: number };
        const confirmed = await loadAdminPrices();
        if (confirmed.revision !== result.revision) {
          throw new Error('Revisi harga belum dapat dikonfirmasi.');
        }
        setEditingProduct(null);
        setPriceError('');
      } catch (error) {
        setPriceError(error instanceof Error ? error.message : 'Harga gagal disimpan.');
      }
      return;
    }
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

  const handleSaveShipping = () => {
    if (!shippingOrderId) return;
    updateShipping(shippingOrderId, selectedCourier, trackingNumberInput.trim());
    setShippingOrderId(null);
    setTrackingNumberInput('');
  };

  const openShippingModal = (orderId: string, courier?: CourierType, tracking?: string) => {
    setShippingOrderId(orderId);
    setSelectedCourier(courier || 'JNE Reguler');
    setTrackingNumberInput(tracking || '');
  };

  const handleToggleSlowbarStock = (alias: string) => {
    setSlowbarOutOfStock((prev) => {
      const next = new Set(prev);
      if (next.has(alias)) next.delete(alias);
      else next.add(alias);
      return next;
    });
  };

  const metrics: AdminMetrics = useMemo(() => {
    const totalGrossRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const totalBeansRevenue = orders.reduce((acc, o) => acc + o.subtotal, 0);
    const totalOrdersCount = orders.length;
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalGrossRevenue / totalOrdersCount) : 0;
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

  const catalogStats: AdminCatalogStats = useMemo(() => {
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

  return {
    mounted,
    isAuthenticated,
    authStep,
    username,
    setUsername,
    password,
    setPassword,
    pinInput,
    setPinInput,
    pinError,
    setPinError,
    handleLogin,
    handleLogout,
    metrics,
    catalogStats,
    filteredCatalog,
    catalogSearch,
    setCatalogSearch,
    catalogStatusFilter,
    setCatalogStatusFilter,
    catalogSyncError,
    publishedRows,
    publicationLoaded,
    updatingRow,
    priceRevision,
    effectivePrices,
    openEditModal,
    handleTogglePublish,
    orders,
    updateOrderStatus,
    openShippingModal,
    slowbarOutOfStock,
    handleToggleSlowbarStock,
    priceModalProps: {
      editingProduct,
      onClose: () => setEditingProduct(null),
      onSave: saveProductPrice,
      price100g,
      setPrice100g,
      price200g,
      setPrice200g,
      price500g,
      setPrice500g,
      priceCup,
      setPriceCup,
      editingSlug,
      editingAmounts,
      setEditingAmounts,
      effectivePrices,
      priceRevision,
      priceError,
      onSelectPriceProfile: selectPriceProfile,
    },
    shippingModalProps: {
      shippingOrderId,
      selectedCourier,
      setSelectedCourier,
      trackingNumberInput,
      setTrackingNumberInput,
      onClose: () => setShippingOrderId(null),
      onSave: handleSaveShipping,
    },
  };
}
