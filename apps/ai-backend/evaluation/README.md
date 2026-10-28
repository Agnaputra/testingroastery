# Evaluasi RAGAS

Trace hanya aktif jika `EVALUATION_TRACE_ENABLED=true`, `ENVIRONMENT=test`,
dan tidak ada penanda runtime Vercel/Railway/Cloud Run. Nilai default nonaktif;
runtime deployment selalu menolak trace. Hanya pertanyaan yang **persis cocok**
dengan `fixtures.json` yang boleh dicatat. Tinjau fixture agar tidak berisi data
pribadi sebelum menjalankannya.
Jangan gunakan percakapan pelanggan sebagai fixture mentah.

Setelah dependency evaluasi tersedia dan knowledge base pgvector siap, jalankan
dari `apps/ai-backend` pada lingkungan lokal:

```powershell
$env:RAGAS_DO_NOT_TRACK = 'true'
$env:EVALUATION_TRACE_ENABLED = 'true'
$env:ENVIRONMENT = 'test'
.\evaluation\.venv\Scripts\python.exe -B -m evaluation.run_ragas
```

Runner memanggil generation **sekali** per fixture. Trace request tersebut
menyimpan pasangan `context_ids`/`context_texts` dalam urutan final dan string
`catalog_context` persis seperti yang diberikan kepada OpenAI. RAGAS memakai
`context_texts` dari trace tersebut, tanpa melakukan retrieval kedua. Hanya
respons `pgvector + openai` dengan context lengkap masuk skor utama. Jalur
deterministik, web search, in-memory, dan local fallback dicatat sebagai kasus
tereksklusi. Trace gagal ditulis atau context tidak lengkap menggagalkan fixture.

Trace lokal ditulis ke `evaluation/results/evaluation-traces.jsonl` dan laporan
bertimestamp ke `evaluation/results/`; keduanya diabaikan Git. Trace berisi
query, context katalog publik, dan jawaban, tetapi tidak menyimpan token,
header, riwayat mentah, atau identitas pengguna. Filter privasi menolak pola
email, telepon, dan credential yang terdeteksi; tetap gunakan fixture sintetis
yang telah diperiksa manusia. Hapus file lokal setelah masa retensi penelitian.

Laporan menyertakan hash fixture, fingerprint snapshot KB sebelum dan sesudah
run, revisi Git dan hash file implementasi lokal, model, skor per fixture,
serta jumlah kasus yang dikecualikan.
Fingerprint KB berasal dari baris pgvector terpublikasi dan tidak mengubah DB.
Snapshot tersebut dibaca pada awal dan akhir run, bukan pada setiap request.
Trace HTTP lokal di luar runner memakai hash katalog sumber dan diberi label
`source_catalog`, sehingga tidak diklaim sebagai fingerprint DB.
Hasil lama di `results/` tidak menjadi bukti run baru. Empat fixture awal perlu
ditinjau dan diperluas sebelum skor dipakai dalam kesimpulan skripsi.

## Stack evaluasi lokal

Gunakan Python 3.12.14 dan `requirements-eval.txt` hanya pada virtual environment
evaluasi. Versi langsung yang dipilih: RAGAS 0.4.3, LangChain 0.3.27,
langchain-core 0.3.78, langchain-community 0.3.31, langchain-openai 0.3.35,
dan OpenAI SDK 2.54.0. Adapter LangChain 0.3 memerlukan OpenAI SDK di bawah 3;
environment backend biasa boleh memakai versi berbeda. Jangan memasang stack
evaluasi ini pada deployment production. Catat `pip freeze` dari environment
yang dipakai saat penelitian agar dependency transitif juga dapat direproduksi.
`evaluation/requirements-eval.lock.txt` merekam 118 paket dari smoke environment
lokal Tahap 3A; verifikasi ulang instalasi bersih sebelum evaluasi final.

Runner memakai `Faithfulness` (query, answer, contexts), `AnswerRelevancy`
(query, answer, evaluator LLM dan embeddings), `ContextPrecisionWithReference`
(query, reference answer, contexts), dan `ContextRecall` (query, reference
answer, contexts) dari `ragas.metrics.collections`. Reference answer harus
divalidasi manusia terhadap katalog/knowledge base yang sama sebelum run final.
Skor gagal menjadi `null` dengan `score_errors`, bukan nol. Metadata per kasus
mencakup fixture ID, waktu, revisi kode, fingerprint KB, versi RAGAS, model
generation/evaluator/embedding, dan status eksklusi. Hasil smoke sintetis
harus disimpan terpisah dari `results/` penelitian final.

Pada RAGAS 0.4.3, setiap fixture dengan `k` context biasanya membutuhkan
`6 + k` panggilan evaluator LLM: Faithfulness 2, Answer Relevancy 3,
Context Precision `k`, Context Recall 1. Answer Relevancy juga membutuhkan
dua panggilan embedding (satu pertanyaan, satu batch pertanyaan hasil LLM).
Retry dapat menambah panggilan. Perkirakan biaya memakai token input/output
aktual hasil smoke berizin sebelum mengunci anggaran penelitian.
