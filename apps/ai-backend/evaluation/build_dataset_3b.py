"""Build the draft thesis dataset from the currently published pgvector metadata.

Read-only on PostgreSQL. Writes only dataset_candidates_3b.json and
dataset_review_3b.md in this evaluation directory. Does not call OpenAI.
"""
from __future__ import annotations

import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import psycopg2

from app.config import settings
from app.conversation_state import _comparison_candidates, derive_conversation_state, find_product_candidates
from app.chat_router import route_chat_intent
from app.rag_service import PUBLISHED_COFFEE_KNOWLEDGE_BASE
from evaluation.trace import code_revision, knowledge_base_version


ROOT = Path(__file__).parent

# id, category, question, answer template, source slugs, source fields,
# difficulty, proposed final, status, review note.
# Templates are populated exclusively from published pgvector metadata below.
SPECS = [
    ("PI01", "Product Information", "Dari mana asal Ijen Kenyan Wening dan bagaimana prosesnya?", "{a_name} berasal dari {a_origin} dan diproses dengan {a_process}.", ["ijen-kenyan-wening"], ["name", "origin", "process"], "easy", True, "VERIFIED BY SOURCE", "Ejaan nama mengikuti metadata."),
    ("PI02", "Product Information", "Apa varietas dan roast profile Sumbing Supernova Wash Celestia?", "{a_name} memakai varietas {a_varietal} dengan roast profile {a_roast}.", ["sumbing-supernova-celestia"], ["name", "varietal", "roast"], "easy", True, "VERIFIED BY SOURCE", ""),
    ("PI03", "Product Information", "Tasting notes apa yang tercatat untuk Puntang Natural Aromanis?", "Tasting notes {a_name} adalah {a_notes_text}.", ["puntang-natural-aromanis"], ["name", "notes"], "easy", True, "VERIFIED BY SOURCE", ""),
    ("PI04", "Product Information", "Apa metode proses dan karakter rasa Buntu Lenta Wine Duharman?", "{a_name} memakai proses {a_process}, dengan notes {a_notes_text}.", ["buntu-lenta-wine-duharman"], ["name", "process", "notes"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PI05", "Product Information", "Apa varietas dan asal Brazil Santos Espresso?", "{a_name} berasal dari {a_origin}; varietasnya {a_varietal}.", ["brazil-santos-espresso"], ["name", "origin", "varietal"], "easy", True, "VERIFIED BY SOURCE", ""),
    ("PI06", "Product Information", "Bagaimana profil roast dan notes Kalaciri Wash Process?", "{a_name} memiliki roast {a_roast} dan notes {a_notes_text}.", ["kalaciri-wash-process"], ["name", "roast", "notes"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PI07", "Product Information", "Apa proses pengolahan dan varietas El Triunfo Geisha Tolima Aurora?", "{a_name} menggunakan proses {a_process} dan varietas {a_varietal}.", ["el-triunfo-geisha-tolima-aurora"], ["name", "process", "varietal"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PI08", "Product Information", "Asal dan tasting notes Yemen Haraz Golden Harvest Sahara apa saja?", "{a_name} berasal dari {a_origin}; notes yang tercatat adalah {a_notes_text}.", ["yemen-haraz-golden-harvest-sahara"], ["name", "origin", "notes"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PI09", "Product Information", "Karakter rasa dan proses Ijen Lactic Laras seperti apa?", "{a_name} diproses dengan {a_process}; notes-nya {a_notes_text}.", ["ijen-lactic-laras"], ["name", "process", "notes"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PI10", "Product Information", "Apa asal, proses, dan roast profile Dampit Natural Espresso?", "{a_name} berasal dari {a_origin}, memakai {a_process}, dan di-roast {a_roast}.", ["dampit-natural-espresso"], ["name", "origin", "process", "roast"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PI11", "Product Information", "Berapa harga kemasan 100g Sumbing Supernova Celestia saat ini?", "Harga 100g {a_name} pada snapshot katalog ini adalah Rp{a_price_100g:,}.", ["sumbing-supernova-celestia"], ["name", "price_100g"], "medium", False, "NEEDS REVIEW", "Harga berubah; verifikasi ulang sebelum studi. Frasa saat ini berisiko usang."),
    ("PI12", "Product Information", "Apakah Sindoro Strawberry Selai tergolong best seller?", "Knowledge base tidak memuat data penjualan terverifikasi untuk menetapkan status best seller {a_name}.", ["sindoro-strawberry-selai"], ["name"], "hard", False, "NEEDS REVIEW", "Jalur sales_question deterministic; bukan kasus RAGAS utama."),
    ("PI13", "Product Information", "Apakah Ijen Full Wash Washey aman untuk penderita maag?", "Knowledge base tidak memuat bukti keamanan medis {a_name} bagi penderita maag.", ["ijen-full-wash-washey"], ["name"], "hard", False, "NEEDS REVIEW", "Jalur health_sensitive_recommendation; butuh sumber klinis, eksklusi."),

    ("PR01", "Product Recommendation", "Rekomendasikan kopi 52 Coffee dengan notes jasmine dan citrus yang clean.", "{a_name} sesuai sebagai contoh: notes-nya {a_notes_text}; roast {a_roast}.", ["ijen-kenyan-wening"], ["name", "notes", "roast"], "easy", True, "VERIFIED BY SOURCE", "Pilihan berdasarkan atribut, bukan klaim terbaik."),
    ("PR02", "Product Recommendation", "Aku mencari beans 52 Coffee yang manis dengan honey dan almond; pilihkan satu.", "{a_name} merupakan pilihan yang sesuai karena notes-nya {a_notes_text} dan prosesnya {a_process}.", ["ijen-yellow-bourbon-kencana"], ["name", "notes", "process"], "easy", True, "VERIFIED BY SOURCE", ""),
    ("PR03", "Product Recommendation", "Pilihkan kopi filter 52 Coffee yang fruity dengan nuansa blueberry dan strawberry.", "{a_name} sesuai: kategori {a_category}, notes {a_notes_text}, proses {a_process}.", ["buntu-lenta-natural-duharman"], ["name", "category", "notes", "process"], "easy", True, "VERIFIED BY SOURCE", ""),
    ("PR04", "Product Recommendation", "Ada rekomendasi kopi 52 Coffee dengan rasa cokelat dan brown sugar untuk espresso?", "{a_name} adalah salah satu opsi: kategori {a_category}, notes {a_notes_text}, dengan resep {a_recipe_display}.", ["kintamani-full-wash-arabica-espresso"], ["name", "category", "notes", "recipe"], "medium", True, "VERIFIED BY SOURCE", "Ada opsi lain; jangan nilai jawaban alternatif yang benar sebagai salah."),
    ("PR05", "Product Recommendation", "Aku ingin kopi 52 Coffee yang floral, peach, dan terasa seperti teh. Apa opsinya?", "{a_name} sesuai karena notes-nya {a_notes_text}.", ["el-triunfo-geisha-tolima-aurora"], ["name", "notes"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PR06", "Product Recommendation", "Rekomendasikan kopi 52 Coffee yang fruity dengan profil mango, lychee, dan lime.", "{a_name} sesuai dengan notes {a_notes_text}; prosesnya {a_process}.", ["ijen-lactic-laras"], ["name", "notes", "process"], "easy", True, "VERIFIED BY SOURCE", ""),
    ("PR07", "Product Recommendation", "Kalau mengejar rasa winey seperti permen, pilihkan beans 52 Coffee yang relevan.", "{a_name} dapat dipilih karena notes-nya {a_notes_text}; prosesnya {a_process}.", ["damarkandang-cm-kismis"], ["name", "notes", "process"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PR08", "Product Recommendation", "Saya suka kopi boozy dan candy-like fruit; produk 52 Coffee apa yang cocok?", "{a_name} sesuai dengan preferensi tersebut: notes {a_notes_text}, proses {a_process}.", ["argopuro-walida-anaerob-arcapada"], ["name", "notes", "process"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PR09", "Product Recommendation", "Pilih kopi 52 Coffee yang citrus dengan notes lime, cashew, dan caramel.", "{a_name} cocok berdasarkan notes {a_notes_text}; prosesnya {a_process}.", ["benteng-alla-wash-sembada"], ["name", "notes", "process"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PR10", "Product Recommendation", "Aku mencari espresso 52 Coffee yang earthy, dark chocolate, dan full body. Sarankan satu.", "{a_name} adalah salah satu pilihan dengan notes {a_notes_text} dan roast {a_roast}.", ["arabica-ijen-full-wash-espresso"], ["name", "notes", "roast"], "medium", True, "VERIFIED BY SOURCE", "Brazil Santos juga memenuhi notes; validasi jawaban alternatif."),
    ("PR11", "Product Recommendation", "Rekomendasikan kopi 52 Coffee paling enak untuk semua orang.", "Tidak ada data preferensi universal; pilihan produk perlu didasarkan pada rasa atau metode seduh yang diinginkan.", [], [], "hard", False, "NEEDS REVIEW", "Kurang spesifik, kemungkinan klarifikasi deterministic."),
    ("PR12", "Product Recommendation", "Saya maag, tolong pilih kopi 52 Coffee yang pasti aman diminum.", "Knowledge base tidak dapat menjamin keamanan medis kopi untuk kondisi maag.", [], [], "hard", False, "NEEDS REVIEW", "Eksklusi: health-sensitive deterministic dan membutuhkan bukti medis."),
    ("PR13", "Product Recommendation", "Apa kopi 52 Coffee terlaris minggu ini yang sebaiknya saya beli?", "Knowledge base tidak memiliki data penjualan mingguan yang terverifikasi.", [], [], "hard", False, "NEEDS REVIEW", "Eksklusi: sales_question deterministic dan data tidak tersedia."),

    ("BS01", "Brewing Suitability", "Untuk Ijen Carbonic Maceration Asmara, metode seduh apa yang tertulis dalam resep 52 Coffee?", "Resep {a_name} menyebut {a_recipe_display}.", ["ijen-carbonic-maceration-asmara"], ["name", "recipe"], "easy", True, "VERIFIED BY SOURCE", "Metode resep, bukan klaim satu-satunya metode cocok."),
    ("BS02", "Brewing Suitability", "Bagaimana dosis kopi dan air untuk V60 Ijen Kenyan Wening menurut resep produk?", "Resep {a_name}: {a_recipe_display}.", ["ijen-kenyan-wening"], ["name", "recipe"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("BS03", "Brewing Suitability", "Kalau menyeduh Ijen Anaerob Rahsa, alat apa yang dicantumkan di resepnya?", "Resep {a_name} mencantumkan {a_recipe_display}.", ["ijen-anaerob-rahsa"], ["name", "recipe"], "easy", True, "VERIFIED BY SOURCE", ""),
    ("BS04", "Brewing Suitability", "Apakah resep Ijen Lactic Laras menyebut V60 atau Origami?", "Resep {a_name}: {a_recipe_display}.", ["ijen-lactic-laras"], ["name", "recipe"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("BS05", "Brewing Suitability", "Rasio dan dosis yang tercatat untuk Puntang Honey Gulali bagaimana?", "Resep {a_name}: {a_recipe_display}.", ["puntang-honey-gulali"], ["name", "recipe"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("BS06", "Brewing Suitability", "Apa resep seduh V60 untuk Prau Natural El Davisio Surya?", "Resep {a_name}: {a_recipe_display}.", ["prau-natural-el-davisio-surya"], ["name", "recipe"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("BS07", "Brewing Suitability", "Ijen Full Wash Washey diresepkan untuk alat seduh apa?", "Resep {a_name} menyebut {a_recipe_display}.", ["ijen-full-wash-washey"], ["name", "recipe"], "easy", True, "VERIFIED BY SOURCE", ""),
    ("BS08", "Brewing Suitability", "Bagaimana resep espresso Brazil Santos yang tersedia di knowledge base?", "Resep {a_name}: {a_recipe_display}.", ["brazil-santos-espresso"], ["name", "recipe"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("BS09", "Brewing Suitability", "Apa input dan output espresso yang diresepkan untuk Kintamani Full Wash?", "Resep {a_name}: {a_recipe_display}.", ["kintamani-full-wash-arabica-espresso"], ["name", "recipe"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("BS10", "Brewing Suitability", "El Triunfo Geisha Aurora punya panduan V60 berapa gram kopi dan air?", "Resep {a_name}: {a_recipe_display}.", ["el-triunfo-geisha-tolima-aurora"], ["name", "recipe"], "hard", True, "VERIFIED BY SOURCE", ""),
    ("BS11", "Brewing Suitability", "Bisakah Sumbing Celestia diseduh dengan moka pot?", "Resep yang tercatat untuk {a_name} adalah {a_recipe_display}; tidak ada panduan moka pot dalam metadata produk ini.", ["sumbing-supernova-celestia"], ["name", "recipe"], "hard", False, "NEEDS REVIEW", "Pertanyaan metode lain; jawaban harus membedakan ketiadaan data dari ketidakcocokan."),
    ("BS12", "Brewing Suitability", "Buka panduan seduh lengkap Coffee Lab untuk saya.", "Ini adalah permintaan navigasi fitur situs, bukan fakta resep produk pada knowledge base.", [], [], "easy", False, "NEEDS REVIEW", "Jalur website_action/website_feature; eksklusi RAGAS utama."),

    ("PC01", "Product Comparison", "Bandingkan proses dan notes Buntu Lenta Wash Duharman dengan Kalaciri Wash Process.", "{a_name}: {a_process}, notes {a_notes_text}. {b_name}: {b_process}, notes {b_notes_text}.", ["buntu-lenta-wash-duharman", "kalaciri-wash-process"], ["name", "process", "notes"], "medium", True, "VERIFIED BY SOURCE", "Perlu kedua produk dalam context; top-k 3 dapat meleset."),
    ("PC02", "Product Comparison", "Bandingkan Buntu Lenta Natural Duharman dengan slowbar Aromanis dari sisi proses dan notes buah.", "{a_name}: {a_process}, notes {a_notes_text}. {b_name}: {b_process}, notes {b_notes_text}.", ["buntu-lenta-natural-duharman", "puntang-natural-aromanis"], ["name", "process", "notes"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PC03", "Product Comparison", "Bandingkan roast dan karakter rasa Puntang Honey Gulali dengan Puntang Natural Aromanis.", "{a_name}: roast {a_roast}, notes {a_notes_text}. {b_name}: roast {b_roast}, notes {b_notes_text}.", ["puntang-honey-gulali", "puntang-natural-aromanis"], ["name", "roast", "notes"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PC04", "Product Comparison", "Bandingkan slowbar Kencana dengan Laras dari proses dan tasting notes.", "{a_name}: {a_process}, notes {a_notes_text}. {b_name}: {b_process}, notes {b_notes_text}.", ["ijen-yellow-bourbon-kencana", "ijen-lactic-laras"], ["name", "process", "notes"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PC05", "Product Comparison", "Bandingkan roast serta notes Brazil Santos Espresso versus Dampit Natural Robusta Espresso.", "{a_name}: roast {a_roast}, notes {a_notes_text}. {b_name}: roast {b_roast}, notes {b_notes_text}.", ["brazil-santos-espresso", "dampit-natural-espresso"], ["name", "roast", "notes"], "medium", True, "VERIFIED BY SOURCE", "Notes sama; beda roast dan origin juga bisa disebut jika ada context."),
    ("PC06", "Product Comparison", "Apa perbedaan asal dan proses Kintamani Full Wash Espresso dengan Dampit Natural Espresso?", "{a_name}: asal {a_origin}, proses {a_process}. {b_name}: asal {b_origin}, proses {b_process}.", ["kintamani-full-wash-arabica-espresso", "dampit-natural-espresso"], ["name", "origin", "process"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PC07", "Product Comparison", "Apa perbedaan varietas dan notes slowbar Wening versus Asmara?", "{a_name}: varietas {a_varietal}, notes {a_notes_text}. {b_name}: varietas {b_varietal}, notes {b_notes_text}.", ["ijen-kenyan-wening", "ijen-carbonic-maceration-asmara"], ["name", "varietal", "notes"], "hard", True, "VERIFIED BY SOURCE", ""),
    ("PC08", "Product Comparison", "Sumbing Supernova Celestia vs Sindoro Strawberry Selai: apa beda proses dan tasting notes?", "{a_name}: proses {a_process}, notes {a_notes_text}. {b_name}: proses {b_process}, notes {b_notes_text}.", ["sumbing-supernova-celestia", "sindoro-strawberry-selai"], ["name", "process", "notes"], "medium", True, "VERIFIED BY SOURCE", ""),
    ("PC09", "Product Comparison", "Bandingkan El Triunfo Geisha Aurora dengan Sudan Rume Huila Carmin dari sisi proses dan notes.", "{a_name}: proses {a_process}, notes {a_notes_text}. {b_name}: proses {b_process}, notes {b_notes_text}.", ["el-triunfo-geisha-tolima-aurora", "sudan-rume-huila-carmin"], ["name", "process", "notes"], "hard", True, "VERIFIED BY SOURCE", ""),
    ("PC10", "Product Comparison", "Apa beda origin dan profil rasa Magnum Sidra Soberano dibanding Yemen Haraz Sahara?", "{a_name}: origin {a_origin}, notes {a_notes_text}. {b_name}: origin {b_origin}, notes {b_notes_text}.", ["magnum-sidra-el-vergel-soberano", "yemen-haraz-golden-harvest-sahara"], ["name", "origin", "notes"], "hard", True, "VERIFIED BY SOURCE", ""),
    ("PC11", "Product Comparison", "Dari dua kopi yang tadi, mana yang lebih murah?", "Tidak dapat dijawab tanpa riwayat percakapan yang menunjuk dua produk dan varian yang sama.", [], [], "hard", False, "NEEDS REVIEW", "Butuh multi-turn dan varian; eksklusi dari single-turn utama."),
    ("PC12", "Product Comparison", "Bandingkan semua produk 52 Coffee dan pilih satu yang paling laris.", "Knowledge base tidak memuat data penjualan untuk menentukan produk paling laris.", [], [], "hard", False, "NEEDS REVIEW", "Jalur sales_question deterministic dan cakupan terlalu luas."),
]


def published_metadata() -> dict[str, dict]:
    with psycopg2.connect(settings.DATABASE_URL, connect_timeout=3) as connection:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT knowledge.metadata
                FROM coffee_knowledge AS knowledge
                LEFT JOIN catalog_publication_overrides AS publication
                  ON publication.slug = knowledge.metadata->>'slug'
                WHERE knowledge.embedding IS NOT NULL
                  AND COALESCE(knowledge.metadata->>'publication_status', 'published') = 'published'
                  AND COALESCE(publication.is_published, TRUE) = TRUE
            """)
            rows = [metadata for (metadata,) in cursor.fetchall()]
    return {row["slug"]: row for row in rows}


def build() -> list[dict]:
    metadata = published_metadata()
    source = {product["slug"]: product for product in PUBLISHED_COFFEE_KNOWLEDGE_BASE}
    if metadata.keys() != source.keys():
        raise RuntimeError("Published pgvector slugs do not match source snapshot")
    fields = {"name", "origin", "varietal", "process", "roast", "notes", "recipe", "description", "category", "price_100g"}
    for slug, row in metadata.items():
        for field in fields:
            if row.get(field) != source[slug].get(field):
                raise RuntimeError(f"Metadata/source mismatch: {slug}.{field}")
    if len(SPECS) != 50 or len({spec[0] for spec in SPECS}) != 50:
        raise RuntimeError("Expected 50 distinct fixture IDs")
    seen_questions: set[str] = set()
    candidates = []
    for fixture_id, category, question, template, slugs, source_fields, difficulty, proposed, status, note in SPECS:
        normalized = " ".join(question.lower().split())
        if normalized in seen_questions:
            raise RuntimeError(f"Duplicate question: {fixture_id}")
        seen_questions.add(normalized)
        if any(slug not in metadata for slug in slugs):
            raise RuntimeError(f"Unpublished slug in {fixture_id}")
        if any(field not in metadata[slug] for slug in slugs for field in source_fields):
            raise RuntimeError(f"Missing source field in {fixture_id}")
        values: dict[str, object] = {}
        for prefix, slug in zip("ab", slugs):
            row = metadata[slug]
            values.update({f"{prefix}_{key}": value for key, value in row.items()})
            values[f"{prefix}_notes_text"] = ", ".join(row["notes"])
            values[f"{prefix}_recipe_display"] = str(row["recipe"])
        answer = template.format(**values)
        if answer.endswith(".."):
            answer = answer[:-1]
        matches = find_product_candidates(question, list(source.values()))
        intent = route_chat_intent(question, catalog_match=bool(matches), has_coffee_context=False)
        state = derive_conversation_state([], question, list(source.values()))
        risk = []
        if state.needs_clarification:
            risk.append("deterministic_clarification_likely")
        if category == "Product Recommendation" and not state.catalog_query_context() and not state.referenced_product_slugs:
            risk.append("recommendation_preference_missing")
        if not slugs:
            risk.append("not_answerable_from_product_metadata")
        comparison_matches, comparison_ambiguous = _comparison_candidates(question, list(source.values())) if category == "Product Comparison" else ([], [])
        if category == "Product Comparison" and comparison_ambiguous:
            risk.append("comparison_entity_ambiguous")
        recognized = comparison_matches if category == "Product Comparison" else matches
        if category != "Product Recommendation" and not set(slugs).issubset(recognized):
            risk.append("product_name_matching_unconfirmed")
        if intent not in {"catalog_query", "product_recommendation", "product_comparison"}:
            risk.append(f"routing_{intent}")
        if any(term in question.lower() for term in ("best seller", "terlaris", "paling laris")):
            risk.append("deterministic_sales_question")
        if any(term in question.lower() for term in ("maag", "aman diminum")):
            risk.append("deterministic_health_question")
        if "yang tadi" in question.lower():
            risk.append("requires_multiturn_history")
        if category == "Product Comparison":
            risk.append("two_product_context_required")
        candidates.append({
            "id": fixture_id,
            "category": category,
            "question": question,
            "reference": answer,
            "supporting_kb_source": [
                {"table": "coffee_knowledge", "column": "metadata", "slug": slug, "fields": source_fields}
                for slug in slugs
            ],
            "expected_slugs": slugs,
            "difficulty": difficulty,
            "validation_status": status,
            "proposed_final": proposed,
            "notes": note,
            "static_intent": intent,
            "route_risks": risk,
        })
    counts = Counter(item["category"] for item in candidates if item["proposed_final"])
    if set(counts.values()) != {10} or len(counts) != 4:
        raise RuntimeError(f"Expected 10 proposed final questions per category: {counts}")
    return candidates


def main() -> None:
    dataset_path = ROOT / "dataset_candidates_3b.json"
    review_path = ROOT / "dataset_review_3b.md"
    if dataset_path.exists() or review_path.exists():
        if "--replace-draft" not in sys.argv:
            raise RuntimeError("Draft exists; use --replace-draft only before human review")
        if dataset_path.exists():
            old = json.loads(dataset_path.read_text(encoding="utf-8"))
            if old.get("dataset_id") != "52coffee-ragas-3b-draft-v1":
                raise RuntimeError("Revised dataset cannot be overwritten by the original 3B builder")
            if old.get("human_validation") != "PENDING" or any(
                item.get("validation_status") == "HUMAN VALIDATED" for item in old.get("candidates", [])
            ):
                raise RuntimeError("Human-validated dataset cannot be overwritten")
        if review_path.exists() and any(marker in review_path.read_text(encoding="utf-8") for marker in ("☑", "| HUMAN VALIDATED |")):
            raise RuntimeError("Review decisions cannot be overwritten")
    candidates = build()
    document = {
        "dataset_id": "52coffee-ragas-3b-draft-v1",
        "dataset_status": "DRAFT",
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "code_revision": code_revision(),
        "knowledge_base_fingerprint": knowledge_base_version(),
        "knowledge_base_source": "published, embedded coffee_knowledge.metadata using the runtime pgvector publication filter",
        "human_validation": "PENDING",
        "usage": "Candidate dataset only. Do not feed directly to final RAGAS before human and route validation.",
        "candidates": candidates,
    }
    dataset_path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Validasi manusia — dataset RAGAS Tahap 3B (DRAFT)", "",
        "Snapshot: `" + document["knowledge_base_fingerprint"] + "`. Status awal seluruh baris adalah verifikasi sumber kode/DB atau perlu review; **tidak ada yang HUMAN VALIDATED**.", "",
        "Peneliti dan perwakilan 52 Coffee memeriksa pertanyaan, jawaban referensi lengkap, slug, serta sumber pada `dataset_candidates_3b.json`. Tulis nama/role, tanggal, keputusan, dan alasan perubahan di kolom berikut. Jangan mengganti status menjadi HUMAN VALIDATED tanpa konfirmasi nyata.", "",
        "| ID | Pertanyaan | Reference answer | Slug sumber | Usulan 40 | Status saat ini | Review referensi / sumber | Review produk / istilah | Review jalur RAG | Validator & tanggal | Keputusan / koreksi |", "|---|---|---|---|---|---|---|---|---|---|---|",
    ]
    for item in candidates:
        question = item["question"].replace("|", "\\|")
        reference = item["reference"].replace("|", "\\|")
        slugs = ", ".join(item["expected_slugs"]) or "—"
        lines.append(f"| {item['id']} | {question} | {reference} | {slugs} | {'Ya' if item['proposed_final'] else 'Cadangan'} | {item['validation_status']} | ☐ | ☐ | ☐ | — | — |")
    lines += ["", "## Aturan keputusan", "", "- `VERIFIED BY SOURCE` berarti reference disusun dari snapshot metadata published, belum divalidasi manusia.", "- `NEEDS REVIEW` menandai ketidakcocokan desain, data yang tidak ada, atau risiko bypass RAG.", "- `HUMAN VALIDATED` hanya sesudah peneliti dan perwakilan 52 Coffee menyetujui klaim faktual dan mencatat identitas peran serta tanggal.", "- Jika ada koreksi, simpan versi dataset baru dan ulangi verifikasi fingerprint; jangan diam-diam mengubah hasil smoke test atau hasil final.", ""]
    review_path.write_text("\n".join(lines), encoding="utf-8")
    print("Generated", len(candidates), "candidates; proposed", sum(c["proposed_final"] for c in candidates))
    print("Status", Counter(c["validation_status"] for c in candidates))
    print("Static intents", Counter(c["static_intent"] for c in candidates))
    print("Fingerprint", document["knowledge_base_fingerprint"])


if __name__ == "__main__":
    main()
