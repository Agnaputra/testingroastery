# Audit Master Katalog 52 Coffee & Roastery

Dokumen ini memuat hasil audit menyeluruh terhadap snapshot workbook owner (`Product Catalog 52 Coffee Roastery.xlsx`), blueprint arsitektur (`52-Roastery-Web-Blueprint.pdf`), dan implementasi aktif di `apps/web/lib/data.ts` serta `apps/web/lib/catalog-master.ts`.

Tanggal audit: 18 September 2026

---

## 1. Ringkasan Eksekutif

- **Total Master Products di Snapshot**: 55 produk
- **Status Publikasi Terverifikasi**:
  - **Published (31 produk / 30 master rows)**: Produk aktif yang memiliki spesifikasi lengkap, profil rasa, resep seduh, varian kemasan, dan harga terkonfirmasi di website.
  - **Draft (9 master rows)**: Produk yang memiliki data harga lengkap di Excel / Slowbar namun belum resmi diaktifkan di katalog website pelanggan.
  - **Needs Owner Review (16 master rows)**: Produk yang belum memiliki harga, memiliki catatan *"Harga belum ada (isi manual)"*, atau memiliki ambiguitas nama/varietas.
- **Menu Slowbar (33 items)**:
  - **Published (25 items)**: 100% harga secangkir terverifikasi identik antara snapshot owner dan website (Rp25.000 – Rp200.000).
  - **Draft / Hold (8 items)**: Belum aktif di web karena base bean berstatus draft atau filter bean sedang habis (sold out).
- **Integritas Bisnis (Zero Margin Leak)**: Seluruh data internal (Landed Cost, HPP Sangrai, Biaya Kemasan, Gross Profit Roastery) **TIDAK PERNAH** diekspos ke antarmuka publik pelanggan. Detail produk menyajikan nilai transparansi berbasis seduhan (*"Nilai untuk setiap seduhan"*).

---

## 2. Rincian 31 Produk Published (Katalog Publik Aktif)

Catatan: Row 15 (*Ijen Full Wash*) hadir dalam dua profil sangrai terpisah (Filter dan Espresso) sesuai praktik specialty roastery, sehingga 30 master rows merepresentasikan 31 SKU produk web aktif.

| No | Master Row | ID / Slug Web | Nama Produk | Alias Slowbar | Seri Web | Origin | Kategori / Profil | Rentang Harga (Rp) |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | `sumbing-supernova-celestia` | Sumbing Supernova Wash | Celestia | Java Exotic | Gunung Sumbing, Central Java | Filter (Light) | 100g: 139k, 200g: 259k |
| 2 | 2 | `prau-natural-surya` | Prau Natural El Davisio Double Mosto | Surya | Java Exotic | Gunung Prau, Central Java | Filter (Light) | 100g: 139k, 200g: 259k |
| 3 | 3 | `prau-not-chiroso-unchiro` | Prau Not-Chiroso Style | Unchiro | Java Exotic | Gunung Prau, Central Java | Filter (Light) | 100g: 139k, 200g: 259k |
| 4 | 5 | `sindoro-strawberry-selai` | Sindoro Strawberry Triple Yeast | Selai | Java Exotic | Gunung Sindoro, Central Java | Filter (Light) | 100g: 119k, 200g: 220k |
| 5 | 8 | `sindoro-lavender-candy` | Sindoro Lavender Candy Wash | Lavender | Java Exotic | Gunung Sindoro, Central Java | Filter (Light) | 100g: 119k, 200g: 220k |
| 6 | 10 | `puntang-natural-aromanis` | Puntang Natural Aromanis | Aromanis | Sunda Series | Gunung Puntang, West Java | Filter (Light-Med) | 100g: 99k, 200g: 185k, 500g: 399k |
| 7 | 11 | `puntang-honey-gulali` | Puntang Honey Gulali | Gulali | Sunda Series | Gunung Puntang, West Java | Filter (Light-Med) | 100g: 95k, 200g: 179k, 500g: 379k |
| 8 | 12 | `ijen-cm-asmara` | Ijen Carbonic Maceration | Asmara | Ijen Series | Kawah Ijen, East Java | Filter (Light-Med) | 100g: 65k, 200g: 120k, 500g: 320k |
| 9 | 13 | `ijen-lactic-laras` | Ijen Lactic | Laras | Ijen Series | Kawah Ijen, East Java | Filter (Light-Med) | 100g: 59k, 200g: 109k, 500g: 290k |
| 10 | 14 | `ijen-anaerob-rahsa` | Ijen Anaerob | Rahsa | Ijen Series | Kawah Ijen, East Java | Filter (Light-Med) | 100g: 59k, 200g: 109k, 500g: 290k |
| 11 | 15 | `ijen-full-wash-washey` | Ijen Full Wash | Washey | Ijen Series | Kawah Ijen, East Java | Filter (Light-Med) | 100g: 59k, 200g: 109k, 500g: 290k |
| 12 | 16 | `ijen-kenyan-wening` | Ijen Kenyan | Wening | Ijen Series | Kawah Ijen, East Java | Filter (Light-Med) | 100g: 59k, 200g: 109k, 500g: 290k |
| 13 | 17 | `ijen-yellow-bourbon-kencana` | Ijen Yellow Bourbon | Kencana | Ijen Series | Kawah Ijen, East Java | Filter (Light-Med) | 100g: 59k, 200g: 109k, 500g: 290k |
| 14 | 19 | `buntu-lenta-wine-duharman` | Buntu Lenta Wine | Duharman Winey | Enrekang Series | Enrekang, South Sulawesi | Filter (Light-Med) | 100g: 115k, 200g: 215k, 500g: 459k |
| 15 | 20 | `buntu-lenta-natural-duharman` | Buntu Lenta Natural | Duharman Natural | Enrekang Series | Enrekang, South Sulawesi | Filter (Light-Med) | 100g: 109k, 200g: 199k, 500g: 439k |
| 16 | 21 | `buntu-lenta-wash-duharman` | Buntu Lenta Wash | Duharman Wash | Enrekang Series | Enrekang, South Sulawesi | Filter (Light-Med) | 100g: 109k, 200g: 199k, 500g: 439k |
| 17 | 22 | `kalaciri-wash-process` | Kalaciri Wash | Kalaciri | Enrekang Series | Enrekang, South Sulawesi | Filter (Medium) | 100g: 99k, 200g: 185k, 500g: 399k |
| 18 | 23 | `benteng-alla-wash-sembada` | Benteng Alla Wash | Sembada | Enrekang Series | Enrekang, South Sulawesi | Filter (Light-Med) | 100g: 115k, 200g: 215k, 500g: 459k |
| 19 | 39 | `argopuro-walida-anaerob-arcapada` | Argopuro Natural Anaerob | Arcapada | Argopuro Walida | Gunung Argopuro, East Java | Filter (Light-Med) | 100g: 80k, 200g: 150k |
| 20 | 41 | `damarkandang-cm-kismis` | Argopuro Damarkandang CM Kismis | Damarkandang Kismis | Argopuro Walida | Gunung Argopuro, East Java | Filter (Light-Med) | 100g: 90k, 200g: 175k |
| 21 | 29 | `grand-reserve-magnum-sidra` | Magnum Sidra El Vergel Cauca Colombia | Soberano | Grand Reserve | Cauca, Colombia | Reserve (Light) | 16g: 72k, 50g: 180k, 100g: 350k, 200g: 685k |
| 22 | 30 | `grand-reserve-el-triunfo-geisha` | El Triunfo Geisha Tolima Colombia | Aurora | Grand Reserve | Tolima, Colombia | Reserve (Light) | 16g: 86k, 50g: 200k, 100g: 380k, 200g: 709k |
| 23 | 31 | `grand-reserve-sudan-rume-carmin` | Sudan Rume Huila Colombia | Carmin | Grand Reserve | Huila, Colombia | Reserve (Light) | 16g: 80k, 50g: 185k, 100g: 360k, 200g: 690k |
| 24 | 32 | `grand-reserve-pink-bourbon-marfil` | Inmaculada Pink Bourbon Huila Colombia | Marfil | Grand Reserve | Huila, Colombia | Reserve (Light) | 16g: 62k, 50g: 177k, 100g: 348k, 200g: 687k |
| 25 | 33 | `grand-reserve-yemen-sahara` | Yemen Haraz Golden Harvest | Sahara | Grand Reserve | Haraz, Yemen | Reserve (Light-Med) | 16g: 59k, 50g: 165k, 100g: 229k, 200g: 549k |
| 26 | 24 | `espresso-dampit-natural` | Dampit Natural | - | Robusta Espresso | Dampit, Malang, East Java | Espresso (Med-Dark) | 200g: 35k, 500g: 85k, 1kg: 150k |
| 27 | 25 | `espresso-telemung-honey` | Telemung Honey | - | Robusta Espresso | Banyuwangi, East Java | Espresso (Medium) | 200g: 35k, 500g: 85k, 1kg: 150k |
| 28 | 18 | `espresso-arabica-kintamani` | Kintamani Full Wash | Arkana | Arabica Espresso | Kintamani, Bali | Espresso (Medium) | 200g: 70k, 500g: 135k, 1kg: 260k |
| 29 | 27 | `espresso-arabica-gayo-full-wash` | Gayo Full Wash | Gayo | Arabica Espresso | Aceh Tengah, Sumatera | Espresso (Med-Dark) | 200g: 75k, 500g: 140k, 1kg: 265k |
| 30 | 15 | `espresso-arabica-ijen-full-wash` | Arabica Ijen Full Wash | Washey | Arabica Espresso | Kawah Ijen, East Java | Espresso (Medium) | 200g: 60k, 500g: 140k, 1kg: 250k |
| 31 | 28 | `espresso-brazil-santos` | Brazil Santos | - | Arabica Espresso | Santos, Brazil | Espresso (Med-Dark) | 200g: 92k, 500g: 175k, 1kg: 340k |

---

## 3. Rincian 9 Produk Draft (Siap Dirilis Setelah Approval)

Produk-produk ini memiliki data harga lengkap di Excel dan/atau menu Slowbar, namun belum diaktifkan ke katalog web publik:

| Master Row | Nama Produk | Alias Slowbar | Seri Excel | Status Harga | Catatan Owner |
|---|---|---|---|---|---|
| 4 | Prau Hybrid Wash Oxigenium | Crosswave | Java Exotic | Filter 100g: 115k, 200g: 215k; Slowbar: 40k | Ada di Slowbar PDF, belum di 25 kartu web |
| 6 | Prau Black Honey Triple Yeast | Jati | Java Exotic | Filter 100g: 115k, 200g: 215k; Slowbar: 56k | Ada di Slowbar PDF, belum di 25 kartu web |
| 7 | Prau Natural Secret Project Oxigenium Wash | 52 Project | Java Exotic | Filter 100g: 139k, 200g: 259k; Slowbar: 55k | Ada di Slowbar PDF, belum di 25 kartu web |
| 9 | Kendal Liberica Wash Mosto | Kawiswara | Java Exotic | Filter 100g: 139k, 200g: 259k; Slowbar: 55k | Spesies Liberica langka. Ada di Slowbar PDF |
| 26 | Temanggung Natural | - | Single Origin Series | Espresso 200g: 54k, 500g: 85k, 1kg: 150k | Robusta klasik Jawa Tengah |
| 40 | Argopuro Full Wash | Tirta Argopuro | Argopuro Series | Filter 100g: 75k, 200g: 140k; Slowbar: 50k | Ada di Slowbar PDF, belum di 25 kartu web |
| 42 | Argopuro Natural Extended | Bermi | Argopuro Series | Filter 100g: 80k, 200g: 150k; Slowbar: 50k | Ada di Slowbar PDF, belum di 25 kartu web |
| 43 | Arjuna Natural | - | Arjuna Series | Filter 100g: 70k, 200g: 135k | Belum tayang di web |
| 44 | Arjuna Wash | - | Arjuna Series | Filter 100g: 70k, 200g: 135k | Belum tayang di web |

---

## 4. Rincian 16 Produk Needs Owner Review

Produk-produk ini ditahan di staging layer dan **tidak dipublikasikan** ke publik karena data harga belum lengkap atau membutuhkan konfirmasi owner:

| Master Row | Nama Produk | Seri | Alasan Review | Catatan Workbook Owner |
|---|---|---|---|---|
| 34 | 52 Blend 50:50 | House Blend | Harga kosong | *"Belum tayang di web. Harga belum ada (isi manual)."* |
| 35 | 52 Bold Blend | House Blend | Harga kosong | *"Belum tayang di web. Harga belum ada (isi manual)."* |
| 36 | 52 Golden Blend | House Blend | Harga kosong | *"Belum tayang di web. Harga belum ada (isi manual)."* |
| 37 | Drip Bag Single Origin | Drip Bag | Harga kosong | *"Belum tayang di web. Harga belum ada (isi manual)."* |
| 38 | Drip Bag Mixed Origin | Drip Bag | Harga kosong | *"Belum tayang di web. Harga belum ada (isi manual)."* |
| 45 | Arjuna Yellow Catura | Arjuna Series | Ambiguitas varietas & proses | *"Kemungkinan varietas 'Yellow Caturra'. Web tulis 'Arjuna Yellow Catura Anaerobic'. Belum tayang di web."* |
| 46 | Kintamani Natural Sunsweet | Dewata Series | Harga belum difinalisasi | *"Harga belum ada (isi manual). Kintamani eksperimental BARU - belum di web/slowbar."* |
| 47 | Kintamani Natural Selected | Dewata Series | Harga belum difinalisasi | *"Harga belum ada (isi manual). Kintamani eksperimental BARU - belum di web/slowbar."* |
| 48 | Kintamani Washed Citrine | Dewata Series | Harga belum difinalisasi | *"Harga belum ada (isi manual). Kintamani eksperimental BARU - belum di web/slowbar."* |
| 49 | Kintamani Aerobic Natural | Dewata Series | Harga belum difinalisasi | *"Harga belum ada (isi manual). Kintamani eksperimental BARU - belum di web/slowbar."* |
| 50 | Kintamani Yeast Semi Anaerobic Natural | Dewata Series | Harga belum difinalisasi | *"Harga belum ada (isi manual). Kintamani eksperimental BARU - belum di web/slowbar."* |
| 51 | Kintamani Yeast Inoculated Honey | Dewata Series | Harga belum difinalisasi | *"Harga belum ada (isi manual). Kintamani eksperimental BARU - belum di web/slowbar."* |
| 52 | Ijen CM COE Winner | Ijen Series | Harga belum difinalisasi | *"Harga belum ada (isi manual). Varian Ijen BARU - belum di web/slowbar."* |
| 53 | Ijen CM Pink Honey | Ijen Series | Harga belum difinalisasi | *"Harga belum ada (isi manual). Varian Ijen BARU - belum di web/slowbar."* |
| 54 | Ijen Mosto Washed | Ijen Series | Harga belum difinalisasi | *"Harga belum ada (isi manual). Varian Ijen BARU - belum di web/slowbar."* |
| 55 | Ijen Karamela | Ijen Series | Harga belum difinalisasi | *"Harga belum ada (isi manual). Varian Ijen BARU - belum di web/slowbar."* |

---

## 5. Analisis Menu Slowbar (33 Items)

Dari 33 item Slowbar dalam snapshot:
- **25 Menu Aktif di Web**: Memiliki padanan bean aktif di katalog dengan harga per cangkir yang identik:
  - Asmara (38k), Wening (30k), Rahsa (35k), Laras (35k), Kencana (30k), Washey (25k)
  - Duharman Wash (45k), Duharman Winey (52k), Duharman Natural (45k), Kalaciri (35k), Sembada (50k)
  - Gulali (45k), Aromanis (52k)
  - Celestia (48k), Surya (60k), Unchiro (56k), Selai (56k), Lavender (55k)
  - Soberano (180k), Aurora (200k), Carmin (180k), Marfil (140k), Sahara (99k)
  - Arcapada (50k), Damarkandang Kismis (60k)
- **8 Menu Belum Aktif di Web**:
  1. *Crosswave* (Rp40.000) — Base bean (Row 4) masih draft.
  2. *Jati* (Rp56.000) — Base bean (Row 6) masih draft.
  3. *Kawiswara* (Rp55.000) — Base bean (Row 9) masih draft.
  4. *52 Project* (Rp55.000) — Base bean (Row 7) masih draft.
  5. *Arkana* (Rp35.000) — Biji Kintamani Full Wash di web saat ini hanya aktif sebagai profil Espresso (200g/500g/1kg). Butuh konfirmasi owner untuk aktivasi biji Filter (Row 18) di web.
  6. *Gayo* (Rp35.000) — Di web aktif sebagai Espresso. Profil Filter di catatan owner berstatus *SOLD OUT*.
  7. *Tirta Argopuro* (Rp50.000) — Base bean (Row 40) masih draft.
  8. *Bermi* (Rp50.000) — Base bean (Row 42) masih draft.

---

## 6. Rekomendasi Keputusan Owner

1. **Kanonisasi Nama Seri**:
   - Disarankan mempertahankan `Sunda Series` di web karena mencakup Jawa Barat secara kultural roastery, namun sistem mapping internal tetap mencatat alias `Puntang Series`.
   - Disarankan mempertahankan `Argopuro Walida` di web untuk menghormati nama produsen/kolektif kopi Walida di Jawa Timur.
   - Disarankan menggunakan `Grand Reserve` sebagai nama display publik untuk kesederhanaan editorial, dengan `Grand Reserve Import` sebagai metadata internal.
2. **Persetujuan Rilis 9 Produk Draft**:
   - Apakah owner ingin merilis 9 item draft (termasuk Prau Crosswave, Jati, 52 Project, Kendal Liberica Kawiswara, Argopuro Tirta & Bermi) ke website pada rilis katalog berikutnya?
3. **Pengisian Harga Resmi**:
   - Pengisian harga resmi untuk House Blend (3 varian), Drip Bag (2 box varian), 6 varian Dewata Kintamani baru, dan 4 varian Ijen baru agar dapat dipindahkan dari status `needs_owner_review` ke `draft`/`published`.

