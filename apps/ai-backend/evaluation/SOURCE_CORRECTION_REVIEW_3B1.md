# Source correction review - Tahap 3B.1

Fingerprint KB yang diperiksa: `pgvector:f36baa310f973e0db0eeed692a357e93a86b85ae0c930a46336516f2d8d29311`. Pembacaan dilakukan pada metadata 26 produk published dengan filter yang sama seperti retrieval pgvector. Sumber kode pembanding: `app/rag_service.py` (`PUBLISHED_COFFEE_KNOWLEDGE_BASE`). Tidak ada database atau katalog yang diubah.

## Temuan teknis

- **0 field dengan karakter pengganti U+FFFD** pada metadata published yang diperiksa; 0 pola mojibake `?`/`?` atau karakter kontrol pada string metadata.
- **26/26 field `recipe`** mengandung satuan suhu `°C` (karakter derajat U+00B0 diikuti C) di DB dan sumber kode. Tidak ditemukan nilai `?C`/`�C` pada snapshot aktif.
- Klaim Tahap 3B bahwa sumber suhu rusak **tidak terkonfirmasi** pada pembacaan byte/Unicode saat ini. Tampilan terminal sebelumnya keliru. Ekspresi penggantian yang tidak efektif di pembangun draft telah dihapus; nilai suhu pada dataset sama dengan sumber.
- Tidak ada koreksi suhu yang diusulkan berdasarkan bukti saat ini. Akurasi angka resep dan satuan tetap memerlukan persetujuan pemilik sebelum final; pemeriksaan encoding saja tidak memvalidasi resep.
- `PR07` semula tidak mencantumkan field `process` meskipun reference menyebut proses; daftar field pendukung draft telah dilengkapi tanpa mengubah klaim.

## Inventaris field recipe dan kebutuhan konfirmasi manusia

Nilai asli di bawah disalin dari `coffee_knowledge.metadata.recipe`; lokasi sumber kode menunjuk field recipe yang dibandingkan. Kolom usulan koreksi kosong karena tidak ada bukti kerusakan. Konfirmasi 52 Coffee diperlukan terutama untuk resep yang dipakai oleh reference answer.

| Slug | Nilai asli `metadata.recipe` | Sumber kode | Dipakai fixture | Usulan koreksi | Konfirmasi 52 Coffee |
|---|---|---|---|---|---|
| `arabica-ijen-full-wash-espresso` | Espresso Machine: 18g in, 36g out, 26 detik suhu 93°C. | `app/rag_service.py:583` | - | Tidak ada | [ ] |
| `argopuro-walida-anaerob-arcapada` | V60 Pour Over 15g, 225ml air (1:15), 91°C, 2m 15s. | `app/rag_service.py:419` | - | Tidak ada | [ ] |
| `benteng-alla-wash-sembada` | V60 15g, 225ml air (1:15), 92°C, 2m 15s. | `app/rag_service.py:297` | - | Tidak ada | [ ] |
| `brazil-santos-espresso` | Espresso Machine: 18.5g in, 37g out, 28 detik suhu 92°C. | `app/rag_service.py:602` | BS08 | Tidak ada | [ ] |
| `buntu-lenta-natural-duharman` | V60 15g, 225ml air (1:15), 91°C, 2m 15s. | `app/rag_service.py:257` | - | Tidak ada | [ ] |
| `buntu-lenta-wash-duharman` | V60 15g, 225ml air (1:15), 92°C, 2m 20s. | `app/rag_service.py:217` | - | Tidak ada | [ ] |
| `buntu-lenta-wine-duharman` | Kalita Wave 15g, 225ml air (1:15), 91°C, 2m 30s. | `app/rag_service.py:237` | - | Tidak ada | [ ] |
| `damarkandang-cm-kismis` | Kalita Wave / V60 15g, 225ml air (1:15), 91°C, 2m 20s. | `app/rag_service.py:438` | - | Tidak ada | [ ] |
| `dampit-natural-espresso` | Espresso Machine: 19g in, 38g out, 26 detik suhu 93°C. Cocok untuk Es Kopi Susu Gula Aren. | `app/rag_service.py:545` | - | Tidak ada | [ ] |
| `el-triunfo-geisha-tolima-aurora` | Hario V60 Plastic 16g kopi, 256ml air (1:16), 93°C, 2m 15s. Bloom 50g 45s. | `app/rag_service.py:461` | BS10 | Tidak ada | [ ] |
| `ijen-anaerob-rahsa` | Kalita Wave 15g kopi, 225ml air (1:15), 91°C, 2m 20s. | `app/rag_service.py:135` | BS03 | Tidak ada | [ ] |
| `ijen-carbonic-maceration-asmara` | V60 15g kopi, 225ml air (1:15), 92°C, 2m 15s. Bloom 45g 40s. | `app/rag_service.py:95` | BS01 | Tidak ada | [ ] |
| `ijen-full-wash-washey` | V60 15g, 225ml air (1:15), 90°C, 2m 15s. | `app/rag_service.py:195` | BS07 | Tidak ada | [ ] |
| `ijen-kenyan-wening` | V60 15g kopi, 240ml air (1:16), 93°C, 2m 10s. Bloom 45g 35s. | `app/rag_service.py:115` | BS02 | Tidak ada | [ ] |
| `ijen-lactic-laras` | Origami / V60 15g, 225ml air (1:15), 91°C, 2m 25s. | `app/rag_service.py:155` | BS04 | Tidak ada | [ ] |
| `ijen-yellow-bourbon-kencana` | V60 15g, 240ml air (1:16), 92°C, 2m 15s. | `app/rag_service.py:175` | - | Tidak ada | [ ] |
| `kalaciri-wash-process` | Aeropress / V60 16g, 240ml air (1:15), 90°C, 2m 00s. | `app/rag_service.py:277` | - | Tidak ada | [ ] |
| `kintamani-full-wash-arabica-espresso` | Espresso Machine: 18g in, 36g out, 28 detik suhu 93°C. | `app/rag_service.py:564` | PR04, BS09 | Tidak ada | [ ] |
| `magnum-sidra-el-vergel-soberano` | V60 Pour Over 16g, 240ml air (1:15), 92°C, 2m 10s. | `app/rag_service.py:482` | - | Tidak ada | [ ] |
| `prau-natural-el-davisio-surya` | V60 15g, 230ml air (1:15.3), 92°C, 2m 15s. | `app/rag_service.py:379` | BS06 | Tidak ada | [ ] |
| `puntang-honey-gulali` | V60 16g kopi, 250ml air (1:15.6), 92°C, 2m 30s. | `app/rag_service.py:319` | BS05 | Tidak ada | [ ] |
| `puntang-natural-aromanis` | V60 15g kopi, 225ml air (1:15), 91°C, 2m 15s. | `app/rag_service.py:339` | - | Tidak ada | [ ] |
| `sindoro-strawberry-selai` | V60 / Kalita 15g, 225ml air (1:15), 91°C, 2m 20s. | `app/rag_service.py:398` | - | Tidak ada | [ ] |
| `sudan-rume-huila-carmin` | Kalita Wave / V60 16g, 240ml air (1:15), 91°C, 2m 20s. | `app/rag_service.py:503` | - | Tidak ada | [ ] |
| `sumbing-supernova-celestia` | Origami / V60 15g, 225ml air (1:15), 91°C, 2m 10s. | `app/rag_service.py:360` | BS11 | Tidak ada | [ ] |
| `yemen-haraz-golden-harvest-sahara` | Origami / V60 16g, 240ml air (1:15), 91°C, 2m 15s. | `app/rag_service.py:524` | - | Tidak ada | [ ] |

## Field lain yang perlu keputusan manusia

| Item | Nilai/masalah asli | Sumber | Usulan koreksi berbukti | Keputusan yang diperlukan |
|---|---|---|---|---|
| `PI11` (cadangan) | Harga 100g disebut ?saat ini?, padahal reference hanya snapshot | `coffee_knowledge.metadata.price_100g` / `sumbing-supernova-celestia` | Tidak ada | Konfirmasi harga dan tanggal jika akan digunakan; saat ini tetap cadangan |
| `PI12`, `PR13`, `PC12` (cadangan) | Klaim best seller/terlaris tidak bersumber | Tidak ada data penjualan dalam metadata | Tidak ada | Tetap eksklusi dari dataset utama kecuali sumber penjualan terverifikasi tersedia dalam versi studi baru |
| `PI13`, `PR12` (cadangan) | Keamanan bagi penderita maag tidak bersumber | Tidak ada bukti medis dalam metadata | Tidak ada | Tetap eksklusi; jangan membuat klaim keamanan |
| `BS11` (cadangan) | Pertanyaan moka pot di luar resep Sumbing Celestia | `coffee_knowledge.metadata.recipe` / `sumbing-supernova-celestia` | Tidak ada | Bedakan ?tidak tercatat? dari ?tidak cocok? |
| `PC11` (cadangan) | ?Dua kopi yang tadi? memerlukan riwayat dan varian | Tidak ada konteks multi-turn pada fixture | Tidak ada | Tetap eksklusi dari sampel single-turn |

Status seluruh konfirmasi manusia: **PENDING**. Tidak ada status HUMAN VALIDATED pada dokumen ini.
