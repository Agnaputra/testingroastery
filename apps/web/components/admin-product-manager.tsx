'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { CoffeeProduct, CoffeeSeries, PRODUCTS, formatRupiah } from '../lib/data';

type ManagedRow = { slug: string; product: CoffeeProduct; isPublished: boolean; isDeleted: boolean; hasImage: boolean };
type EditableProduct = CoffeeProduct;
const categories: CoffeeProduct['category'][] = ['filter', 'espresso', 'reserve', 'glassware', 'machine'];
const series: CoffeeSeries[] = ['Ijen Series', 'Enrekang Series', 'Sunda Series', 'Java Exotic', 'Dewata Series', 'Aceh Series', 'Argopuro Walida', 'Arjuna Series', 'Grand Reserve', 'Robusta Espresso', 'Arabica Espresso', 'Espresso Roast', 'Glassware', 'Coffee Machine'];
const categoryLabels: Record<CoffeeProduct['category'], string> = { filter: 'Filter Based', espresso: 'Espresso', reserve: 'Grand Reserve', glassware: 'Glassware', machine: 'Coffee Machine' };

function emptyProduct(): EditableProduct {
  return {
    id: '', slug: '', name: '', category: 'filter', categoryLabel: 'Filter Based', series: 'Ijen Series',
    publicationStatus: 'draft', origin: '', region: '', altitude: '', varietal: '', process: '', roastLevel: 'Medium',
    tastingNotes: [], flavorCategory: [], description: '', story: '', variants: [{ weightGrams: 100, weightLabel: '100g', price: 0, inStock: false, stockUnits: 0 }],
    basePrice: 0, defaultWeight: '100g', imageUrl: '/images/bag-prau.jpg', acidity: 3, sweetness: 3, body: 3,
    brewingRecipe: { method: '', dose: '', water: '', ratio: '', temp: '', time: '', steps: [] },
  };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/catalog/managed${path}`, { cache: 'no-store', ...init });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail ?? data.error ?? 'Perubahan produk gagal.');
  return data as T;
}

// ─── Section header for form groups ──────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="sm:col-span-2 flex items-center gap-3 pt-2">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-brand-maroon">{children}</span>
      <div className="flex-1 h-px bg-border-subtle" />
    </div>
  );
}

// ─── Field wrapper for consistent label + input spacing ───────────────────────
function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant ${className ?? ''}`}>
      {label}
      {children}
    </label>
  );
}

export function AdminProductManager({ initialSlug, createOnLoad = false }: { initialSlug?: string; createOnLoad?: boolean }) {
  const initialActionApplied = useRef(false);
  const [managed, setManaged] = useState<ManagedRow[]>([]);
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [editor, setEditor] = useState<EditableProduct | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refresh() {
    const [rows, balances] = await Promise.all([api<ManagedRow[]>(''), api<Record<string, number>>('/stocks')]);
    setManaged(rows); setStocks(balances);
    setLoading(false); setReady(true);
  }
  useEffect(() => { void refresh().catch((cause) => {
    setError(cause.message === 'Not Found'
      ? 'Backend belum memuat API katalog terbaru. Restart npm run ai:start lalu muat ulang halaman ini.'
      : cause.message);
    setLoading(false);
  }); }, []);

  useEffect(() => {
    if (!ready || initialActionApplied.current) return;
    initialActionApplied.current = true;
    if (createOnLoad) { setIsNew(true); setEditor(emptyProduct()); return; }
    if (!initialSlug) return;
    const current = managed.find((row) => row.slug === initialSlug)?.product ?? PRODUCTS.find((item) => item.slug === initialSlug);
    if (!current) { setError('Produk tidak ditemukan. Pilih produk dari daftar.'); return; }
    setIsNew(false);
    setEditor({ ...structuredClone(current), variants: current.variants.map((variant) => ({ ...variant,
      stockUnits: stocks[`${current.slug}:beans:${variant.weightGrams}:${encodeURIComponent(variant.weightLabel)}`],
    })) });
  }, [ready, createOnLoad, initialSlug, managed, stocks]);

  const products = useMemo(() => {
    const all = new Map(PRODUCTS.map((product) => [product.slug, { product, managed: false, published: true, deleted: false }]));
    managed.forEach((row) => all.set(row.slug, { product: row.product, managed: true, published: row.isPublished, deleted: row.isDeleted }));
    return [...all.values()].filter(({ product, deleted }) => (showArchived || !deleted) && `${product.name} ${product.slug}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.product.name.localeCompare(b.product.name, 'id'));
  }, [managed, query, showArchived]);

  function start(product?: CoffeeProduct) {
    setError(''); setNotice(''); setImageFile(null);
    setIsNew(!product);
    const current = product && (managed.find((row) => row.slug === product.slug)?.product ?? product);
    setEditor(current ? { ...structuredClone(current), variants: current.variants.map((variant) => ({ ...variant,
      stockUnits: stocks[`${current.slug}:beans:${variant.weightGrams}:${encodeURIComponent(variant.weightLabel)}`],
    })) } : emptyProduct());
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    const slug = editor.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) { setError('Slug hanya memakai huruf kecil, angka, dan tanda hubung.'); return; }
    const variants = editor.variants.map((variant) => ({ ...variant, weightLabel: variant.weightLabel.trim(),
      inStock: variant.inStock && (variant.stockUnits === undefined || variant.stockUnits > 0) }));
    if (!variants.length || variants.some((variant) => variant.price <= 0 || variant.weightGrams <= 0 || !variant.weightLabel)
      || new Set(variants.map((variant) => `${variant.weightGrams}:${variant.weightLabel}`)).size !== variants.length) {
      setError('Isi berat, label, dan harga setiap varian. Setiap varian harus unik.'); return;
    }
    const product: CoffeeProduct = { ...editor, slug, id: isNew ? slug : editor.id,
      variants, basePrice: variants[0].price, defaultWeight: isNew ? variants[0].weightLabel : editor.defaultWeight,
      isSoldOut: variants.every((variant) => !variant.inStock),
      tastingNotes: editor.tastingNotes.filter(Boolean),
      categoryLabel: categoryLabels[editor.category],
    };
    setBusy(true); setError(''); setNotice('');
    try {
      await api(isNew ? '' : `/${slug}`, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
      if (imageFile) {
        const form = new FormData(); form.append('file', imageFile);
        await api(`/${slug}/image`, { method: 'POST', body: form });
      }
      await refresh(); setEditor(null); setImageFile(null);
      setNotice(isNew ? 'Produk disimpan sebagai draft. Periksa gambar dan stok sebelum dipublikasikan.' : 'Perubahan produk tersimpan.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Produk gagal disimpan.'); }
    finally { setBusy(false); }
  }

  async function action(slug: string, method: 'PATCH' | 'DELETE', published?: boolean) {
    setBusy(true); setError(''); setNotice('');
    try {
      await api(`/${slug}${method === 'PATCH' ? '/publication' : ''}`, {
        method, ...(method === 'PATCH' ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublished: published }) } : {}),
      });
      await refresh();
      setNotice(method === 'DELETE' ? 'Produk diarsipkan dan tidak ditampilkan ke pelanggan.' : published ? 'Produk dipublikasikan.' : 'Produk menjadi draft.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Aksi produk gagal.'); }
    finally { setBusy(false); }
  }

  async function restore(slug: string) {
    setBusy(true); setError('');
    try { await api(`/${slug}/restore`, { method: 'PATCH' }); await refresh(); setNotice('Produk dipulihkan sebagai draft.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Produk gagal dipulihkan.'); }
    finally { setBusy(false); }
  }

  // ── Catalog list view ─────────────────────────────────────────────────────
  const listView = (
    <div className="mt-6 space-y-5">
      {/* Search bar */}
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex-1 max-w-sm">
          Cari produk
          <input
            className="field-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nama atau slug..."
          />
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm text-on-surface-variant">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4 rounded border-border-subtle accent-brand-navy"
          />
          Tampilkan arsip
        </label>
      </div>

      {/* Product list */}
      {loading ? (
        <p className="py-8 text-center text-sm text-on-surface-variant" role="status">Memuat produk…</p>
      ) : (
        <ul className="divide-y divide-border-subtle rounded-sm border border-border-subtle bg-white">
          {products.map(({ product, managed: saved, published, deleted }) => {
            const statusLabel = deleted ? 'Arsip' : published ? 'Published' : 'Draft';
            const statusColor = deleted
              ? 'bg-black/[0.05] text-on-surface-variant'
              : published
              ? 'bg-brand-teal/15 text-brand-charcoal border border-brand-teal/40'
              : 'bg-brand-navy/10 text-brand-navy border border-brand-navy/20';

            return (
              <li key={product.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={deleted ? '/images/bag-prau.jpg' : product.imageUrl || '/images/bag-prau.jpg'}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-sm object-cover border border-border-subtle"
                    unoptimized
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-semibold text-brand-charcoal">{product.name}</strong>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant truncate">
                      {product.slug} · {product.variants.map((v) => `${v.weightLabel} ${formatRupiah(v.price)}`).join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {deleted ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void restore(product.slug)}
                      className="min-h-9 rounded-sm border border-border-subtle bg-white px-3 text-xs font-semibold text-brand-charcoal hover:border-brand-navy/40 hover:text-brand-navy transition-colors disabled:opacity-50"
                    >
                      Pulihkan draft
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => start(product)}
                        className="min-h-9 rounded-sm border border-border-subtle bg-white px-3 text-xs font-semibold text-brand-charcoal hover:border-brand-navy/40 hover:text-brand-navy transition-colors"
                      >
                        Edit
                      </button>
                      {saved && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void action(product.slug, 'PATCH', !published)}
                            className={`min-h-9 rounded-sm px-3 text-xs font-semibold transition-colors disabled:opacity-50 ${
                              published
                                ? 'border border-brand-navy/20 bg-brand-navy/10 text-brand-navy hover:bg-brand-navy/15'
                                : 'bg-brand-teal text-white hover:bg-brand-teal/90'
                            }`}
                          >
                            {published ? 'Jadikan draft' : 'Publish'}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void action(product.slug, 'DELETE')}
                            className="min-h-9 rounded-sm border border-brand-maroon/30 bg-brand-maroon/5 px-3 text-xs font-semibold text-brand-maroon hover:bg-brand-maroon/10 transition-colors disabled:opacity-50"
                          >
                            Arsipkan
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  // ── Editor form ───────────────────────────────────────────────────────────
  const editorView = editor && (
    <form onSubmit={save} className="mt-6 space-y-0 border-t border-border-subtle pt-6">
      {/* Form title */}
      <div className="mb-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-brand-maroon">
          {isNew ? 'Produk Baru' : 'Edit Produk'}
        </p>
        <h3 className="mt-1 font-headline text-xl font-bold text-brand-charcoal">
          {isNew ? 'Tambah produk ke katalog' : editor.name}
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">

        {/* ── Identitas ──────────────────────────────────────────────── */}
        <SectionLabel>Identitas produk</SectionLabel>

        <Field label="Nama produk">
          <input className="field-control" required
            value={editor.name}
            onChange={(e) => setEditor((c) => c ? { ...c, name: e.target.value } : c)} />
        </Field>

        <Field label="Slug URL">
          <input className="field-control" required disabled={!isNew}
            value={editor.slug}
            onChange={(e) => setEditor((c) => c ? { ...c, slug: e.target.value } : c)} />
        </Field>

        <Field label="Origin">
          <input className="field-control" required
            value={editor.origin}
            onChange={(e) => setEditor((c) => c ? { ...c, origin: e.target.value } : c)} />
        </Field>

        <Field label="Region">
          <input className="field-control"
            value={editor.region}
            onChange={(e) => setEditor((c) => c ? { ...c, region: e.target.value } : c)} />
        </Field>

        <Field label="Ketinggian">
          <input className="field-control"
            value={editor.altitude}
            onChange={(e) => setEditor((c) => c ? { ...c, altitude: e.target.value } : c)} />
        </Field>

        <Field label="Varietal">
          <input className="field-control"
            value={editor.varietal}
            onChange={(e) => setEditor((c) => c ? { ...c, varietal: e.target.value } : c)} />
        </Field>

        <Field label="Proses">
          <input className="field-control"
            value={editor.process}
            onChange={(e) => setEditor((c) => c ? { ...c, process: e.target.value } : c)} />
        </Field>

        <Field label="Badge">
          <input className="field-control"
            value={editor.badge ?? ''}
            onChange={(e) => setEditor((c) => c ? { ...c, badge: e.target.value } : c)} />
        </Field>

        <Field label="Alias Slowbar">
          <input className="field-control"
            value={editor.slowbarAlias ?? ''}
            onChange={(e) => setEditor((c) => c ? { ...c, slowbarAlias: e.target.value } : c)} />
        </Field>

        {/* ── Klasifikasi ─────────────────────────────────────────────── */}
        <SectionLabel>Klasifikasi</SectionLabel>

        <Field label="Kategori">
          <select className="field-control" value={editor.category}
            onChange={(e) => setEditor((c) => c ? { ...c, category: e.target.value as CoffeeProduct['category'] } : c)}>
            {categories.map((v) => <option key={v} value={v}>{categoryLabels[v]}</option>)}
          </select>
        </Field>

        <Field label="Seri">
          <select className="field-control" value={editor.series}
            onChange={(e) => setEditor((c) => c ? { ...c, series: e.target.value as CoffeeSeries } : c)}>
            {series.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>

        <Field label="Roast level">
          <select className="field-control" value={editor.roastLevel}
            onChange={(e) => setEditor((c) => c ? { ...c, roastLevel: e.target.value as CoffeeProduct['roastLevel'] } : c)}>
            {(['Light', 'Light-Medium', 'Medium-Light', 'Medium', 'Medium-Dark'] as const).map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>

        {/* ── Tasting notes ────────────────────────────────────────────── */}
        <SectionLabel>Karakter rasa</SectionLabel>

        <Field label="Tasting notes (pisahkan koma)">
          <input className="field-control"
            value={editor.tastingNotes.join(', ')}
            onChange={(e) => setEditor((c) => c ? { ...c, tastingNotes: e.target.value.split(',').map((n) => n.trim()) } : c)} />
        </Field>

        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Profil rasa</p>
          <div className="flex flex-wrap gap-3">
            {(['Fruity', 'Floral', 'Chocolaty', 'Nutty', 'Sweet', 'Spicy'] as const).map((flavor) => (
              <label key={flavor} className="flex min-h-10 items-center gap-2 rounded-sm border border-border-subtle bg-white px-3 text-sm text-brand-charcoal cursor-pointer hover:border-brand-navy/40 transition-colors has-[:checked]:border-brand-navy/40 has-[:checked]:bg-brand-navy/5">
                <input
                  type="checkbox"
                  checked={editor.flavorCategory.includes(flavor)}
                  onChange={(e) => setEditor((c) => c ? { ...c, flavorCategory: e.target.checked ? [...c.flavorCategory, flavor] : c.flavorCategory.filter((f) => f !== flavor) } : c)}
                  className="h-3.5 w-3.5 accent-brand-navy"
                />
                {flavor}
              </label>
            ))}
          </div>
        </div>

        {/* ── Skor sensorik ───────────────────────────────────────────── */}
        <SectionLabel>Skor sensorik</SectionLabel>

        {(['acidity', 'sweetness', 'body'] as const).map((key) => (
          <Field key={key} label={key === 'acidity' ? 'Acidity (0–5)' : key === 'sweetness' ? 'Sweetness (0–5)' : 'Body (0–5)'}>
            <input className="field-control" type="number" min="0" max="5" step="0.5"
              value={editor[key]}
              onChange={(e) => setEditor((c) => c ? { ...c, [key]: Number(e.target.value) } : c)} />
          </Field>
        ))}

        <Field label="Harga per cup (opsional)">
          <input className="field-control" type="number" min="1"
            value={editor.cupPrice ?? ''}
            onChange={(e) => setEditor((c) => c ? { ...c, cupPrice: e.target.value ? Number(e.target.value) : undefined } : c)} />
        </Field>

        {/* ── Konten ──────────────────────────────────────────────────── */}
        <SectionLabel>Konten produk</SectionLabel>

        <Field label="Deskripsi" className="sm:col-span-2">
          <textarea className="field-control min-h-24" required minLength={10}
            value={editor.description}
            onChange={(e) => setEditor((c) => c ? { ...c, description: e.target.value } : c)} />
        </Field>

        <Field label="Cerita produk" className="sm:col-span-2">
          <textarea className="field-control min-h-24"
            value={editor.story}
            onChange={(e) => setEditor((c) => c ? { ...c, story: e.target.value } : c)} />
        </Field>

        {/* ── Panduan seduh ────────────────────────────────────────────── */}
        <SectionLabel>Panduan seduh</SectionLabel>

        <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3">
          {(['method', 'dose', 'water', 'ratio', 'temp', 'time'] as const).map((key) => (
            <Field key={key} label={key}>
              <input className="field-control"
                value={editor.brewingRecipe[key]}
                onChange={(e) => setEditor((c) => c ? { ...c, brewingRecipe: { ...c.brewingRecipe, [key]: e.target.value } } : c)} />
            </Field>
          ))}

          <Field label="Langkah seduh (satu per baris)" className="sm:col-span-3">
            <textarea className="field-control min-h-24"
              value={editor.brewingRecipe.steps.join('\n')}
              onChange={(e) => setEditor((c) => c ? { ...c, brewingRecipe: { ...c.brewingRecipe, steps: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) } } : c)} />
          </Field>
        </div>

        {/* ── Varian & harga ──────────────────────────────────────────── */}
        <SectionLabel>Varian dan harga</SectionLabel>

        <div className="sm:col-span-2 space-y-3">
          {editor.variants.map((variant, index) => (
            <div key={index} className="rounded-sm border border-border-subtle bg-[#F8FAFC] p-4">
              <div className="flex flex-wrap items-end gap-3">
                <Field label="Label varian">
                  <input className="field-control w-36" required
                    value={variant.weightLabel}
                    onChange={(e) => setEditor((c) => c ? { ...c, variants: c.variants.map((item, i) => i === index ? { ...item, weightLabel: e.target.value } : item) } : c)} />
                </Field>
                <Field label="Berat isi (gram)">
                  <input className="field-control w-28" type="number" min="1"
                    value={variant.weightGrams}
                    onChange={(e) => setEditor((c) => c ? { ...c, variants: c.variants.map((item, i) => i === index ? { ...item, weightGrams: Number(e.target.value) } : item) } : c)} />
                </Field>
                <Field label="Harga (Rp)">
                  <input className="field-control w-36" type="number" min="1"
                    value={variant.price}
                    onChange={(e) => setEditor((c) => c ? { ...c, variants: c.variants.map((item, i) => i === index ? { ...item, price: Number(e.target.value) } : item) } : c)} />
                </Field>
                <Field label="Stok siap jual di luar reservasi (unit)">
                  <input className="field-control w-28" type="number" min="0"
                    value={variant.stockUnits ?? ''}
                    placeholder="Belum dihitung"
                    onChange={(e) => setEditor((c) => c ? { ...c, variants: c.variants.map((item, i) => i === index ? { ...item, stockUnits: e.target.value === '' ? undefined : Number(e.target.value) } : item) } : c)} />
                </Field>
                <label className="flex min-h-11 items-center gap-2 text-sm text-brand-charcoal">
                  <input
                    type="checkbox"
                    checked={variant.inStock}
                    onChange={(e) => setEditor((c) => c ? { ...c, variants: c.variants.map((item, i) => i === index ? { ...item, inStock: e.target.checked } : item) } : c)}
                    className="h-4 w-4 accent-brand-teal"
                  />
                  <span className="font-semibold">Tersedia</span>
                </label>
                <button
                  type="button"
                  className="min-h-11 text-xs font-semibold text-brand-maroon underline underline-offset-2 hover:text-brand-maroon/70"
                  onClick={() => setEditor((c) => c ? { ...c, variants: c.variants.filter((_, i) => i !== index) } : c)}
                >
                  Hapus varian
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-sm border border-dashed border-brand-navy/30 px-4 py-2 text-xs font-semibold text-brand-navy hover:border-brand-navy/60 hover:bg-brand-navy/5 transition-colors"
            onClick={() => setEditor((c) => c ? { ...c, variants: [...c.variants, { weightGrams: 200, weightLabel: '200g', price: 0, inStock: false, stockUnits: 0 }] } : c)}
          >
            + Tambah varian
          </button>
        </div>

        {/* ── Foto produk ─────────────────────────────────────────────── */}
        <SectionLabel>Foto produk</SectionLabel>

        <Field label="Foto produk (JPG, PNG, WebP, maksimal 4 MB)" className="sm:col-span-2">
          <input
            className="field-control"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </Field>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="sm:col-span-2 flex flex-wrap items-center gap-3 border-t border-border-subtle pt-5 mt-2">
          <button
            disabled={busy}
            className="min-h-11 rounded-sm bg-brand-navy px-6 text-sm font-semibold text-white hover:bg-brand-navy/90 disabled:opacity-50 transition-colors"
          >
            {busy ? 'Menyimpan…' : 'Simpan produk'}
          </button>
          <button
            type="button"
            onClick={() => setEditor(null)}
            className="min-h-11 rounded-sm border border-border-subtle bg-white px-4 text-sm font-semibold text-brand-charcoal hover:border-brand-navy/40 hover:text-brand-navy transition-colors"
          >
            Batal
          </button>
        </div>

      </div>
    </form>
  );

  // ── Shell ──────────────────────────────────────────────────────────────────
  return (
    <section className="rounded-sm border border-border-subtle bg-white p-5 sm:p-7 shadow-2xs">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-headline text-xl font-bold text-brand-charcoal">Produk katalog</h2>
          <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
            Produk baru dimulai sebagai draft. Penghapusan mengarsipkan produk agar pesanan lama tetap utuh.
          </p>
        </div>
        <button
          type="button"
          disabled={!ready || busy}
          onClick={() => start()}
          className="min-h-11 rounded-sm bg-brand-charcoal px-5 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-50 transition-colors"
        >
          + Tambah produk
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <p role="alert" className="mt-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 rounded-sm border border-brand-teal/40 bg-brand-teal/10 px-4 py-3 text-sm text-brand-charcoal">
          {notice}
        </p>
      )}

      {/* Not ready */}
      {!ready && !editor && (
        <p className="mt-5 text-sm text-on-surface-variant" role="status">
          {loading ? 'Memuat produk…' : 'Pengelolaan produk belum tersedia sampai backend terbaru berjalan.'}
        </p>
      )}

      {/* Views */}
      {ready && (editor ? editorView : listView)}
    </section>
  );
}
