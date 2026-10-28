import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | 52 Coffee & Roastery',
  description: 'Informasi tentang data akun, penggunaan Google Login, dan layanan 52 Coffee & Roastery.',
};

export default function PrivacyPage() {
  return (
    <article className="bg-background px-5 pb-24 pt-36 text-brand-charcoal sm:px-8 sm:pt-44">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-maroon">52 Coffee / Privasi</p>
        <h1 className="mt-5 font-headline text-4xl font-bold leading-tight sm:text-6xl">Kebijakan Privasi</h1>
        <p className="mt-5 text-sm text-brand-navy">Terakhir diperbarui: 28 Oktober 2026</p>
        <div className="mt-12 space-y-10 text-base leading-8 text-brand-charcoal/85">
          <section>
            <h2 className="font-headline text-2xl font-semibold text-brand-charcoal">Data yang kami gunakan</h2>
            <p className="mt-3">Saat kamu membuat akun, kami menyimpan alamat email, nama tampilan, dan informasi profil yang kamu berikan. Jika kamu masuk dengan Google, kami menerima identitas akun Google, alamat email yang telah diverifikasi, dan nama untuk membuat atau menghubungkan akun 52 Coffee. Kami tidak meminta akses ke isi Gmail atau file Google Drive.</p>
            <p className="mt-3">Jika kamu mengisi alamat, WhatsApp, pesanan, atau bukti pembayaran melalui fitur yang tersedia, data tersebut digunakan untuk mengelola permintaan dan riwayat pesananmu. Formulir kontak atau konsultasi menggunakan informasi yang kamu kirim untuk menanggapi permintaanmu.</p>
          </section>
          <section>
            <h2 className="font-headline text-2xl font-semibold text-brand-charcoal">Cara data dipakai dan disimpan</h2>
            <p className="mt-3">Data akun dan transaksi disimpan di sistem 52 Coffee untuk autentikasi, pengelolaan profil, layanan pelanggan, dan pencatatan pesanan. Cookie sesi dipakai agar kamu tetap masuk ke akun. Keranjang dapat tersimpan di browser perangkatmu. Akses ke data pesanan dibatasi pada pemilik akun dan petugas yang berwenang.</p>
            <p className="mt-3">Kami menggunakan penyedia infrastruktur untuk menjalankan website dan menyimpan data. Pesan yang kamu kirim ke Virtual Barista diproses melalui layanan AI untuk menghasilkan jawaban. Hindari memasukkan kata sandi atau informasi pembayaran rahasia ke percakapan tersebut.</p>
          </section>
          <section>
            <h2 className="font-headline text-2xl font-semibold text-brand-charcoal">Layanan di luar website</h2>
            <p className="mt-3">Jika kamu membuka tautan WhatsApp, marketplace, atau media sosial, penggunaan datamu di sana mengikuti kebijakan layanan masing-masing. Tombol Google Login memproses autentikasi melalui Google; kami hanya menggunakan data identitas yang diperlukan untuk masuk.</p>
          </section>
          <section>
            <h2 className="font-headline text-2xl font-semibold text-brand-charcoal">Pilihan dan kontak</h2>
            <p className="mt-3">Kamu dapat memperbarui nama, kontak, dan alamat pada <Link href="/account" className="underline underline-offset-4 hover:text-brand-maroon">halaman akun</Link>. Untuk pertanyaan tentang data pribadi atau permintaan terkait akun, hubungi <a href="mailto:agenaputra@gmail.com" className="underline underline-offset-4 hover:text-brand-maroon">agenaputra@gmail.com</a>. Sebagian catatan transaksi mungkin perlu disimpan untuk keperluan operasional atau kewajiban yang berlaku.</p>
          </section>
        </div>
      </div>
    </article>
  );
}
