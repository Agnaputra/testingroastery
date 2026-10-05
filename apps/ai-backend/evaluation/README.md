# Evaluasi RAGAS

Jalankan setelah PostgreSQL + pgvector aktif dan knowledge base sudah di-seed:

```powershell
cd apps/ai-backend
python -m pip install --upgrade --force-reinstall -r requirements.txt
python -m app.migrate_pgvector  # only when upgrading legacy vector(768)
python -m app.seed_data
python -m evaluation.run_ragas
```

Fixture di `fixtures.json` adalah dataset evaluasi yang harus ditinjau dan diperluas dengan pertanyaan pengguna yang dianonimkan. Runner mengevaluasi `faithfulness`, `answer_relevancy`, `context_precision`, dan `context_recall` terhadap retrieval pgvector yang sama dengan endpoint chat. Laporan JSON bertimestamp ditulis ke `evaluation/results/` dan tidak boleh dianggap sebagai hasil penelitian sebelum fixture dan hasilnya direview.
