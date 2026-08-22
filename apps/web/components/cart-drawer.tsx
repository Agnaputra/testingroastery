'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '../lib/store/useCartStore';
import { formatRupiah } from '../lib/data';

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotalItems,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const freeShippingThreshold = 250000;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-up border-l border-border-subtle">
          {/* Drawer Header */}
          <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-surface-container-low">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-brand-navy" />
              <h2 className="font-editorial text-lg font-bold text-brand-navy">
                Keranjang Seduh ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-full text-on-surface-variant hover:text-brand-navy hover:bg-brand-pill transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-surface-container-lowest px-5 py-3 border-b border-border-subtle">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-on-surface flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-semibold">Selamat! Anda Mendapatkan Gratis Ongkir</span>
                ) : (
                  <span>
                    Tambah <strong className="text-brand-navy">{formatRupiah(remainingForFreeShipping)}</strong> untuk Gratis Ongkir
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] text-on-surface-variant">
                {Math.round(progressToFreeShipping)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-navy to-brand-teal transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-editorial text-lg font-bold text-brand-navy">
                    Keranjang Masih Kosong
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-xs">
                    Temukan biji kopi segar kurasi roaster 52 Coffee dari lereng Nusantara hingga micro-lot Colombia.
                  </p>
                </div>
                <Link
                  href="/catalog"
                  onClick={closeDrawer}
                  className="btn-primary text-xs py-2.5 px-5 inline-flex"
                >
                  Jelajahi Katalog Kopi
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3.5 rounded-xl border border-border-subtle bg-white hover:border-brand-navy/30 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container-low border border-border-subtle">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/catalog/${item.slug}`}
                          onClick={closeDrawer}
                          className="font-editorial text-sm font-bold text-brand-navy hover:text-brand-teal line-clamp-1 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-on-surface-variant hover:text-red-600 transition-colors p-0.5"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-mono text-on-surface-variant">
                        <span className="px-1.5 py-0.5 bg-brand-pill rounded border border-border-subtle text-brand-navy font-semibold">
                          {item.weightLabel}
                        </span>
                        <span>•</span>
                        <span className="text-brand-teal font-sans font-medium">
                          {item.grindLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-subtle">
                      <span className="font-mono text-xs font-bold text-brand-navy">
                        {formatRupiah(item.unitPrice * item.quantity)}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-border-subtle rounded-full bg-surface-container-low">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-on-surface-variant hover:text-brand-navy rounded-full transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-mono text-xs font-semibold text-brand-navy min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-on-surface-variant hover:text-brand-navy rounded-full transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-border-subtle bg-surface-container-low space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal Produk</span>
                <span className="font-mono font-bold text-base text-brand-navy">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Ongkos kirim dan diskon promo dihitung saat proses checkout.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={closeDrawer}
                  className="btn-secondary text-xs py-3 bg-white"
                >
                  Belanja Lagi
                </button>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="btn-primary text-xs py-3 w-full"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
