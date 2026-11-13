# Naskah demo dan konsultasi Pak Imam — 15 menit

> Gunakan [HASIL_LANJUTAN.md](./HASIL_LANJUTAN.md) sebagai status terbaru.
> Temuan pada naskah ini berasal dari audit awal; bedakan yang sudah diperbaiki
> dari cakupan data/browser/studi pengguna yang masih terbuka.

**Tujuan:** menunjukkan sistem, bukti pengujian internal, dan meminta persetujuan
metode/instrumen. Ini bukan sidang hasil evaluasi final.

## Sebelum pertemuan

- Buka laporan pre-evaluation dan raw JSON smoke. Cantumkan tanggal, revision,
  model, lingkungan, dan masalah yang belum selesai.
- Pastikan UI/chat dapat diakses pada perangkat demo. Bukti API lokal tidak
  menggantikan rehearsal browser. Jangan menyebut localhost dan production identik.
- Jalankan ulang kasus yang akan didemokan setelah bug diperbaiki; simpan sebagai
  run baru. Jangan menimpa hasil pilot 13 November.
- Gunakan akun/dataset sintetis. Jangan menampilkan alamat, bukti transfer, email
  pelanggan, API key, token, dashboard secrets, HPP, atau margin internal.
- Jika BT10–BT12 belum diverifikasi pada DB terisolasi, jangan mendemokan approval
  pembayaran di production. Tunjukkan alur yang direncanakan dan status BLOCKED.
- Siapkan raw respons pilot sebagai bukti cadangan bertanggal; jelaskan bahwa itu
  rekaman pengujian, bukan berpura-pura jawaban live.

## 00:00–02:00 — Masalah penelitian dan arsitektur

“Sistem ini membantu pengguna mencari informasi kopi, memilih produk, memahami
panduan seduh, dan membandingkan produk. Fokus penelitian saya adalah Virtual
Barista berbasis Modular RAG dan integrasinya dengan website 52 Coffee.”

Jelaskan alur secara ringkas:

1. Next.js menerima pertanyaan dan membawa konteks percakapan.
2. FastAPI menangani routing, kebijakan domain, dan pengolahan permintaan.
3. Retrieval dapat memakai embedding dan PostgreSQL/pgvector untuk katalog kopi.
4. Context yang relevan diberikan kepada generation OpenAI.
5. Policy deterministik dan adapter NeMo memeriksa input/output.
6. Respons terstruktur berisi teks, rekomendasi, dan usulan action.
7. Frontend memvalidasi dan menjalankan action cart; jawaban AI sendiri tidak
   membuktikan bahwa cart telah berubah.

“Tidak semua pertanyaan memakai jalur RAG. Pertanyaan website, penolakan kebijakan,
web search tentang kopi, dan fallback dilaporkan dengan jalur masing-masing.”

## 02:00–06:00 — Demo inti Virtual Barista

### Informasi produk

Ketik: **Apa tasting notes kopi Prau?**

Tunjukkan notes White Floral, Strawberry, Candy Mint dan cocokkan dengan katalog.
“Pada pilot API lokal, fakta notes ini cocok dengan sumber. Kualitas seluruh
klaim jawaban akan dinilai lebih lanjut; ini belum merupakan skor Faithfulness.”

### Rekomendasi dan follow-up

Ketik kasus yang akan diteliti, lalu periksa harga/varian secara terbuka:
**Rekomendasikan kopi fruity untuk V60 dengan budget Rp100.000.**

Jika belum diperbaiki, sampaikan:
“Pilot menunjukkan budget tanpa kata maksimal dibaca sebagai target sehingga
dua rekomendasi melebihi Rp100.000. Saya perlu menyelaraskan definisi budget
dan perilaku sistem sebelum evaluasi final.”

Lanjutkan: **Ada yang lebih murah dari rekomendasi tadi?**

“Referensi produk sebelumnya tersimpan, tetapi payload klarifikasinya belum
konsisten. Temuan ini saya catat sebagai FAIL pada kontrak, bukan saya sembunyikan.”
Jangan mengklaim pencarian alternatif lebih murah berhasil jika UI hanya meminta
pengguna memilih satu produk.

### Comparison dan batas sumber

Kasus pilot: **Apa perbedaan kopi Prau dan Gayo?**

“Frontend memiliki produk Gayo, sedangkan KB backend lokal belum memuatnya.
Pilot masih memberi deskripsi umum yang tidak boleh diklaim sebagai fakta katalog.
Saya akan menyelaraskan cakupan sumber atau memperjelas batas studi.”

Jika diminta menunjukkan comparison yang lengkap, pilih dua nama produk yang
sudah diverifikasi pada katalog dan KB, lakukan rehearsal terlebih dahulu, dan
laporkan run tersebut secara terpisah. Jangan mengganti pertanyaan dataset final
karena mendapat hasil buruk.

## 06:00–08:00 — Integrasi commerce

Ketik: **Tambahkan 2 Prau 100g ke keranjang.**

Tunjukkan perbedaan antara usulan action dan hasilnya:
“API pilot menghasilkan slug Prau, varian 100g dan quantity 2 yang benar. Bukti
end-to-end harus memastikan frontend benar-benar menambahkannya, badge berubah,
dan subtotal sesuai harga varian.”

Jika rehearsal browser lulus, buka cart dan cocokkan produk, varian, jumlah,
subtotal. Jika belum, sebutkan BT06/BT09 BLOCKED. Jangan menyatakan fungsi UI lulus
hanya karena JSON action benar.

Terangkan checkout dan pembayaran manual:
“Total dihitung server, bukti pembayaran masuk menunggu verifikasi, dan admin
menyetujui setelah pemeriksaan dana. Demonstrasi penelitian menggunakan pesanan
sintetis pada lingkungan terisolasi.”

## 08:00–11:00 — Rancangan evaluasi

“Saya mengusulkan 40 pertanyaan: masing-masing 10 informasi produk, rekomendasi,
brewing/recipe information, dan comparison. Saat ini 40 item baru diverifikasi
terhadap sumber, belum divalidasi manusia atau dibekukan.”

Jelaskan empat metrik RAGAS dengan bahasa sederhana:

- Faithfulness: apakah klaim didukung context.
- Answer Relevancy: apakah menjawab pertanyaan.
- Context Precision: apakah context yang dipilih relevan dan terurut baik.
- Context Recall: apakah fakta reference tercakup dalam context.

“Context harus berasal dari request yang menghasilkan jawaban tersebut. Saya
memisahkan web search, policy deterministik, dan fallback dari skor RAGAS utama.
Kesalahan evaluator, retrieval miss, dan kasus excluded tetap dilaporkan.”

Jelaskan black-box, guardrails, dan studi pengguna tanpa vs dengan Virtual Barista.
Usulan 24 peserta utama + 4 pilot masih perlu persetujuan; bukan peserta yang
sudah diuji. Ukuran: keberhasilan tugas, waktu, dan perceived helpfulness.

## 11:00–13:00 — Bukti awal dan batasnya

Tunjukkan ringkasan laporan:

- Frontend: 5 suite / 37 assertion, typecheck dan lint PASS.
- Backend: 120 regression tests PASS dengan panggilan model dimock/diblokir.
- Smoke 12 skenario: 4 PASS API, 3 FAIL, 5 BLOCKED.
- NeMo lokal melaporkan ready; injection pilot diblokir **policy deterministik**.
- Tidak ada skor RAGAS final dan belum ada data studi pengguna.

“Lulus unit test tidak otomatis membuktikan kualitas jawaban model, pengalaman
browser, efektivitas NeMo, atau efektivitas layanan bagi pengguna.”

## 13:00–15:00 — Keputusan yang diminta dari Pak Imam

1. Apakah kategori dan empat metrik RAGAS sesuai rumusan masalah?
2. Apakah cakupan studi mengikuti seluruh 31 kopi frontend atau subset KB yang
   ditetapkan, dan bagaimana menangani produk yang belum lengkap sumbernya?
3. Siapa validator reference dan instrumen: peneliti, owner/ahli kopi, pembimbing?
4. Apakah definisi budget adalah batas keras; bagaimana menilai klarifikasi dan
   rekomendasi alternatif yang sama-sama sah?
5. Apakah kriteria eligible/excluded, pencatatan error, dan retry sudah tepat?
6. Apakah rancangan within-subject, counterbalance, jumlah peserta, timeout,
   dan rubrik keberhasilan tugas dapat disetujui?
7. Apakah Integration & Reusability tetap perlu diukur sebagai bukti modularitas?
8. Perbaikan dan pilot apa yang harus diselesaikan sebelum instrumen disahkan,
   dataset dibekukan, dan pengambilan data final dimulai?

Tutup dengan: “Saya akan memperbaiki temuan, melengkapi validasi, lalu menjalankan
pengujian final sebagai pengambilan data baru setelah persetujuan metode.”

## Catatan keputusan konsultasi

- Tanggal konsultasi:
- Revisi Bab III:
- Cakupan katalog yang disepakati:
- Validator dan target validasi:
- Instrumen/rubrik yang disetujui:
- Perubahan metode/ukuran sampel:
- Syarat sebelum freeze/final:

Kolom di atas sengaja kosong; jangan mengisinya sebagai persetujuan sebelum
Pak Imam memberikan keputusan.
