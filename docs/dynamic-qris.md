# QRIS dengan nominal pesanan

Alur customer sebelumnya mengirim JPEG statis dari `PAYMENT_QRIS_PATH`. Sekarang endpoint image menghasilkan PNG QR bernominal dari `order.total` yang diambil server melalui session pengguna ke backend. Query browser tidak menentukan nominal. Pemeriksaan kepemilikan order, metode pembayaran, status pending/rejected, dan cache no-store tetap digunakan.

ID metode `qris_static` dipertahankan untuk kompatibilitas data order dan constraint database. Tampilan customer tidak lagi menyebut QRIS statis. Tidak diperlukan migration.

Tombol **Download QRIS (PNG)** di detail pesanan memakai endpoint image dengan `download=1`. Server mengirim PNG sebagai attachment `52coffee-qris.png`, dengan nominal dan pemeriksaan akses/status yang sama seperti gambar yang ditampilkan.

## Konfigurasi server frontend

- Production: `PAYMENT_QRIS_PAYLOAD` berisi payload QR merchant yang sudah diverifikasi pemilik; `PAYMENT_QRIS_MERCHANT` adalah nama tampilan merchant. Nama tersebut harus dicocokkan dengan merchant yang terbaca pada aplikasi pembayaran. `CUSTOMER_PAYMENT_METHODS` harus mengizinkan `qris_static`.
- Testing: `PAYMENT_TEST_QRIS_PAYLOAD` dan `PAYMENT_TEST_QRIS_MERCHANT`; jika tidak diberikan, mode testing lokal/Preview menggunakan fixture QR yang sudah ada di repository. Jangan melakukan transfer dana sungguhan ke fixture tersebut.
- `PAYMENT_QRIS_PATH` dan `PAYMENT_TEST_QRIS_PATH` tidak lagi dipakai alur ini. Production tanpa payload valid menonaktifkan QRIS; tidak fallback ke fixture testing.
- Payload diperiksa struktur TLV, checksum CRC, mata uang IDR, negara ID, identitas merchant dasar, dan tidak memiliki field biaya/tip. Total harus integer rupiah positif. Payload merchant lengkap dan akun penerima tetap perlu diverifikasi dengan PJP/pemilik.

Ini QR bernominal yang dibentuk lokal dari payload merchant, bukan integrasi penerbitan transaksi PJP/payment gateway. Belum ada callback settlement, jaminan QR sekali pakai, atau expiry di aplikasi pembayaran. Status/expiry pesanan hanya membatasi penyajian QR di website; salinan QR masih dapat dipindai. Order lunas hanya setelah admin memverifikasi dana diterima. Konfirmasi kompatibilitas konversi payload dengan PJP sebelum penggunaan operasional.

## Verifikasi

Jalankan `node scripts/check-dynamic-qris.cjs`, `node scripts/check-production-payment-config.cjs`, dan `npm run typecheck --prefix apps/web`.

Uji berikutnya memakai order testing yang diizinkan: dua total berbeda menghasilkan nominal berbeda saat dipindai; merchant tepat; customer lain tidak bisa meminta QR; order paid/cancelled/awaiting_verification ditolak; unggah bukti dan approval admin tetap berjalan. Jangan mentransfer dana untuk memverifikasi rendering. Tidak ada konfigurasi cloud atau data yang diubah oleh implementasi ini.
