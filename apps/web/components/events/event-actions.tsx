'use client';

import { useState } from 'react';
import { CoffeeEvent, eventApi, jsonOptions, registrationLabel } from '../../lib/events';

export function EventActions({ event }: { event: CoffeeEvent }) {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reason, setReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const open = event.status === 'published' && event.moderation_status === 'visible' && event.registration_status === 'open' && event.confirmed_count < event.capacity && new Date(event.ends_at).getTime() > Date.now();

  async function contact() {
    const tab = window.open('', '_blank');
    setError('');
    try {
      const result = await eventApi<{ url: string }>(`${event.id}/whatsapp`, jsonOptions('POST'));
      if (tab) { tab.opener = null; tab.location.href = result.url; }
      else window.location.href = result.url;
    } catch (cause) { tab?.close(); setError(cause instanceof Error ? cause.message : 'WhatsApp tidak dapat dibuka.'); }
  }

  async function share() {
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title: event.title, url }); else { await navigator.clipboard.writeText(url); setNotice('Tautan event disalin.'); } }
    catch { setError('Tautan gagal dibagikan.'); }
  }

  async function report() {
    setError(''); setNotice('');
    try { await eventApi(`${event.id}/report`, jsonOptions('POST', { reason })); setNotice('Laporan dikirim untuk ditinjau admin.'); setReason(''); setReporting(false); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Laporan gagal dikirim.'); }
  }

  return <div className="rounded-2xl border border-border-subtle bg-white p-6 text-brand-charcoal"><p className="text-xs font-semibold uppercase tracking-widest text-brand-maroon">Registrasi</p><h2 className="mt-2 font-editorial text-2xl font-bold">{registrationLabel(event)}</h2><p className="mt-2 text-sm leading-6 text-on-surface-variant">Hubungi organizer lewat WhatsApp untuk meminta slot. Pendaftaran baru sah setelah organizer mengonfirmasi.</p><button type="button" disabled={!open} onClick={contact} className="mt-5 min-h-12 w-full rounded-xl bg-brand-charcoal px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Register via WhatsApp</button><p className="mt-2 text-xs text-on-surface-variant">Klik tombol tidak mengurangi kapasitas atau menjamin tempat.</p><div className="mt-5 flex gap-4 border-t border-border-subtle pt-4 text-sm"><button type="button" onClick={share} className="min-h-10 font-semibold text-brand-navy underline">Bagikan event</button><button type="button" onClick={() => setReporting(!reporting)} className="min-h-10 text-on-surface-variant underline">Laporkan event</button></div>{reporting ? <div className="mt-3"><label htmlFor="report-reason" className="text-xs font-semibold">Alasan laporan</label><textarea id="report-reason" minLength={10} maxLength={1000} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="field-control mt-2 w-full" /><button type="button" disabled={reason.trim().length < 10} onClick={report} className="mt-2 min-h-10 rounded-lg bg-brand-maroon px-4 text-xs font-bold text-white disabled:opacity-50">Kirim laporan</button></div> : null}{error ? <p role="alert" className="mt-3 text-xs text-brand-maroon">{error}</p> : null}{notice ? <p role="status" className="mt-3 text-xs text-brand-navy">{notice}</p> : null}</div>;
}
