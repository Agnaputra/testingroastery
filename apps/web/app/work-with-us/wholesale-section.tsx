'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WHATSAPP_URL } from '../../lib/data';
import styles from './wholesale.module.css';

const services = [
  { value: 'Supplier Roast Beans', title: 'Pasokan roasted beans', copy: 'Untuk kebutuhan kopi rutin dan konsistensi operasional.', image: '/images/bag-prau.jpg' },
  { value: 'Label Khusus dan Special Blends', title: 'Label khusus & special blends', copy: 'Untuk karakter rasa dan identitas kopi bisnismu.', image: '/images/byob-roaster-craft.jpg' },
  { value: 'Consultation Business Beverages', title: 'Konsultasi bisnis minuman', copy: 'Diskusikan menu, SOP, peralatan, dan biaya per sajian.', image: '/images/canva-cafe-table.jpg' },
];

export function WholesaleSection() {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [serviceType, setServiceType] = useState('Supplier Roast Beans');
  const [estimatedVolume, setEstimatedVolume] = useState('');
  const [message, setMessage] = useState('');
  const [opened, setOpened] = useState(false);
  const [validation, setValidation] = useState(false);
  const whatsAppMessage = [
    'Halo tim 52 Coffee & Roastery, saya ingin mendiskusikan kemitraan.',
    `Bisnis: ${businessName || '[nama bisnis]'}`,
    `Kontak: ${contactName || '[nama kontak]'}`,
    `WhatsApp: ${phone || '[nomor WhatsApp]'}`,
    `Lokasi: ${city || 'Belum diinformasikan'}`,
    `Layanan: ${serviceType}`,
    `Estimasi kebutuhan: ${estimatedVolume || 'Belum ditentukan'}`,
    `Catatan: ${message || '-'}`,
  ].join('\n');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (![businessName, contactName, phone].every(value => value.trim())) {
      setValidation(true);
      return;
    }
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(whatsAppMessage)}`, '_blank', 'noopener,noreferrer');
    setOpened(true);
  }
  return <>
    <section className={styles.hero} aria-labelledby="partnership-hero-heading">
      <div className="site-container">
        <p className={styles.eyebrow}>52 Coffee / Wholesale &amp; Partnership</p>
        <h1 id="partnership-hero-heading">Pasokan kopi yang berawal dari kebutuhanmu.</h1>
        <p className={styles.heroDescription}>Bangun pasokan roasted beans, kembangkan racikan khusus, atau diskusikan kebutuhan bisnis bersama tim roastery.</p>
        <div className={styles.heroActions}><a href="#wholesale-business-form" className="btn-primary">Mulai diskusi</a><a href="#wholesale-services">Lihat layanan <span aria-hidden="true">↗</span></a></div>
        <div className={styles.briefPanel}>
          <section className={styles.briefCard} aria-labelledby="partnership-brief-title"><h2 id="partnership-brief-title">Brief kemitraan</h2><dl><div><dt>Layanan</dt><dd>{services.find(service => service.value === serviceType)?.title}</dd></div><div><dt>Kebutuhan</dt><dd>{estimatedVolume || 'Belum ditentukan'}</dd></div><div><dt>Lokasi</dt><dd>{city || 'Belum diinformasikan'}</dd></div></dl></section>
          <section className={styles.nextSteps} aria-labelledby="partnership-next-title"><h2 id="partnership-next-title">Setelah brief dikirim</h2><ol><li>Diskusikan kebutuhan bisnis.</li><li>Sesuaikan pilihan beans atau blend.</li><li>Sepakati volume dan jadwal.</li></ol></section>
        </div>
      </div>
    </section>
    <section id="wholesale-partnership" className={`${styles.workspace} site-container`} aria-labelledby="wholesale-title">
    <header id="wholesale-services" className={styles.intro}><span id="partnerships" />
      <p className={styles.eyebrow}>Wholesale & partnership</p>
      <h2 id="wholesale-title">Mulai dari kebutuhanmu.</h2>
      <p>Pilih layanan, ceritakan kebutuhan bisnismu, lalu diskusikan bersama tim roastery.</p>
    </header>
    <fieldset className={styles.services}>
      <legend>Pilih layanan kemitraan</legend>
      <div className={styles.serviceGrid}>{services.map(service => <label key={service.value} className={`${styles.service} ${serviceType === service.value ? styles.selected : ''}`}>
        <Image src={service.image} alt="" width={420} height={180} sizes="(min-width: 768px) 33vw, 100vw" />
        <div><span className={styles.choice}><input type="radio" name="partnership-service" value={service.value} checked={serviceType === service.value} onChange={() => setServiceType(service.value)} />{serviceType === service.value ? 'Dipilih' : 'Pilih layanan'}</span><h3>{service.title}</h3><p>{service.copy}</p></div>
      </label>)}</div>
    </fieldset>
    <div className={styles.content}>
      <aside className={styles.process}>
        <p className={styles.eyebrow}>Dari brief ke pasokan</p><h3>Langkah berikutnya jelas.</h3>
        <ol><li><strong>Ceritakan kebutuhan</strong><p>Jenis usaha, menu, volume, dan target rasa.</p></li><li><strong>Coba dan sesuaikan</strong><p>Diskusikan pilihan beans atau sampel blend.</p></li><li><strong>Tetapkan pasokan</strong><p>Sepakati spesifikasi, jumlah, dan jadwal bersama tim.</p></li></ol>
        <Link id="consultations" href="/work-with-us/consultations">Rancang blend & hitung HPP</Link>
      </aside>
      <form id="wholesale-business-form" onSubmit={submit} className={styles.form} aria-describedby="wholesale-note">
        <header><h3>Kebutuhan bisnis</h3><p>Field bertanda * wajib diisi.</p></header>
        <div className={styles.fields}>
          <label>Nama bisnis / kedai kopi *<input id="business-name" name="businessName" required autoComplete="organization" value={businessName} onChange={e => setBusinessName(e.target.value)} aria-invalid={validation && !businessName.trim() || undefined} className="field-control" />{validation && !businessName.trim() && <span className={styles.error}>Isi nama bisnis.</span>}</label>
          <label>Nama kontak *<input id="contact-name" name="contactName" required autoComplete="name" value={contactName} onChange={e => setContactName(e.target.value)} aria-invalid={validation && !contactName.trim() || undefined} className="field-control" />{validation && !contactName.trim() && <span className={styles.error}>Isi nama kontak.</span>}</label>
          <label>Nomor WhatsApp aktif *<input id="business-phone" name="phone" type="tel" required inputMode="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} aria-invalid={validation && !phone.trim() || undefined} className="field-control" />{validation && !phone.trim() && <span className={styles.error}>Isi nomor WhatsApp.</span>}</label>
          <label>Alamat / lokasi bisnis<input id="business-location" name="city" autoComplete="street-address" value={city} onChange={e => setCity(e.target.value)} className="field-control" placeholder="Contoh: Malang / Surabaya" /></label>
          <label>Jenis layanan kemitraan<select id="service-type" name="serviceType" value={serviceType} onChange={e => setServiceType(e.target.value)} className="field-control">{services.map(service => <option key={service.value} value={service.value}>{service.value}</option>)}</select></label>
          <label>Estimasi kebutuhan biji kopi<input id="estimated-volume" name="estimatedVolume" value={estimatedVolume} onChange={e => setEstimatedVolume(e.target.value)} className="field-control" placeholder="Contoh: 25 kg / bulan" /></label>
          <label className={styles.notes}>Catatan tambahan / profil rasa yang dicari<textarea id="partnership-notes" name="message" rows={3} value={message} onChange={e => setMessage(e.target.value)} className="field-control" placeholder="Profil rasa, target menu, atau mesin yang digunakan." /></label>
        </div>
        <details className={styles.preview}><summary>Pratinjau pesan WhatsApp</summary><p>{whatsAppMessage}</p></details>
        <p id="wholesale-note" className={styles.note}>Membuka WhatsApp belum mengirim pesan. Periksa pesan, lalu tekan Kirim di WhatsApp resmi 52 Coffee.</p>
        <button type="submit" className="btn-primary">Lanjutkan ke WhatsApp</button>
        {opened && <p role="status" className={styles.status}>WhatsApp telah dibuka. Kamu masih dapat mengedit kebutuhan dan membuka pesan kembali.</p>}
      </form>
    </div>
  </section></>;
}
