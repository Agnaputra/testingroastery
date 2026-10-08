from __future__ import annotations

from typing import Literal


ChatIntent = Literal[
    "greeting",
    "social",
    "catalog_query",
    "product_recommendation",
    "product_comparison",
    "website_feature",
    "coffee_knowledge",
    "website_action",
    "off_topic",
]

GREETING_TERMS = (
    "hello", "halo", "hai", "hi", "hey", "selamat pagi", "selamat siang",
    "selamat sore", "selamat malam", "assalamualaikum", "permisi",
)
SOCIAL_TERMS = (
    "terima kasih", "makasih", "thanks", "thank you", "oke", "ok", "sip", "siap",
    "baik", "mantap", "sampai jumpa", "dadah", "bye",
)
COFFEE_KNOWLEDGE_TERMS = (
    "kopi", "coffee", "specialty", "arabika", "arabica", "robusta", "liberika",
    "varietal", "varietas", "bourbon", "typica", "geisha", "gesha", "caturra",
    "coffee processing", "natural process", "proses natural", "washed process", "washed", "honey process", "anaerobic", "fermentasi kopi",
    "roasting", "sangrai", "roast", "cupping", "ekstraksi", "grinder", "grind size",
    "espresso", "v60", "aeropress", "kalita", "origami", "moka pot", "french press",
    "seduh", "brewing", "tasting notes", "acidity kopi", "body kopi", "aftertaste kopi", "kafein kopi",
    "sca", "world coffee research", "industri kopi",
)
WEBSITE_FEATURE_TERMS = (
    "catalogue", "katalog", "brewing guidance", "panduan seduh", "coffee lab",
    "build your own blend", "byob", "coffee experiment", "cupping experiment",
    "consultation", "konsultasi", "wholesale", "partnership", "kemitraan",
    "keranjang", "cart", "checkout", "price calculator", "website 52", "fitur 52", "fitur website",
)
ACTION_TERMS = ("buka", "lihat", "tampilkan", "tambahkan", "masukkan", "add", "ke keranjang")
RECOMMENDATION_TERMS = (
    "rekomendasi", "rekomendasikan", "rekomen", "pilihkan", "cocok", "budget",
    "maksimal", "di bawah", "lebih murah", "fruity", "floral", "chocolate", "nutty",
)
COMPARISON_TERMS = ("bandingkan", "perbedaan", "dibanding", "versus", " vs ", "mana yang")
FOLLOW_UP_TERMS = (
    "yang tadi", "yang pertama", "yang kedua", "yang ketiga", "nomor 1", "nomor 2",
    "nomor 3", "coba lagi", "jelaskan lagi", "lanjut", "boleh", "apa", "kenapa",
)


def _matches_phrase(query: str, phrases: tuple[str, ...]) -> bool:
    return any(query == phrase or query.startswith(f"{phrase} ") for phrase in phrases)


def route_chat_intent(
    message: str,
    *,
    catalog_match: bool = False,
    catalog_list: bool = False,
    has_coffee_context: bool = False,
) -> ChatIntent:
    query = message.lower().strip().strip("!?.,")
    if _matches_phrase(query, GREETING_TERMS):
        return "greeting"
    if _matches_phrase(query, SOCIAL_TERMS):
        return "social"
    if any(term in query for term in ACTION_TERMS) and any(
        term in query for term in ("produk", "keranjang", "catalogue", "katalog", "fitur", "halaman")
    ):
        return "website_action"
    if any(term in query for term in WEBSITE_FEATURE_TERMS):
        return "website_feature"
    if any(term in query for term in COMPARISON_TERMS) and (catalog_match or has_coffee_context):
        return "product_comparison"
    if query.startswith(("apa itu ", "kenapa ", "mengapa ")) and any(
        term in query for term in COFFEE_KNOWLEDGE_TERMS
    ):
        return "coffee_knowledge"
    if any(term in query for term in RECOMMENDATION_TERMS) and (
        catalog_match or has_coffee_context or any(term in query for term in COFFEE_KNOWLEDGE_TERMS)
    ):
        return "product_recommendation"
    if catalog_match or catalog_list:
        return "catalog_query"
    if any(term in query for term in COFFEE_KNOWLEDGE_TERMS):
        return "coffee_knowledge"
    if has_coffee_context and _matches_phrase(query, FOLLOW_UP_TERMS):
        return "catalog_query"
    return "off_topic"
