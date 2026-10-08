"""Existing website features shared by grounded replies and safe actions."""
from __future__ import annotations

WEBSITE_FEATURES = (
    {"name": "Catalogue", "path": "/catalog", "description": "Retail Beans, Slowbar Beverages, Glassware, serta Machine & Tools dengan pencarian, filter, dan detail produk."},
    {"name": "Brewing Guidance", "path": "/coffee-lab/brewing-guidance", "description": "Panduan, kalkulator rasio, dan timer seduh."},
    {"name": "Build Your Own Blend", "path": "/blend-builder", "description": "Simulator edukasional untuk merancang komposisi blend."},
    {"name": "Coffee Experiments", "path": "/coffee-lab/coffee-experiments", "description": "Eksperimen dan pembelajaran sensorik kopi."},
    {"name": "Consultation", "path": "/work-with-us/consultations", "description": "Konsultasi kebutuhan kopi dan bisnis."},
    {"name": "Wholesale & Partnership", "path": "/work-with-us#wholesale-partnership", "description": "Kebutuhan pasokan, kemitraan, dan custom blend bisnis."},
    {"name": "Cart & Checkout", "path": "/checkout", "description": "Keranjang tampil sebagai drawer dan checkout masih berupa simulasi; tidak memproses pembayaran atau pengiriman nyata."},
)

WEBSITE_FEATURE_CONTEXT = "Fitur website 52 Coffee:\n" + "\n".join(
    f"- {feature['name']} ({feature['path']}): {feature['description']}" for feature in WEBSITE_FEATURES
)

# Checkout stays descriptive only: it is never an automatically executable action.
ACTIONABLE_FEATURE_PATHS = frozenset(feature["path"] for feature in WEBSITE_FEATURES if feature["path"] != "/checkout")

_FEATURE_TERMS = (
    (("catalogue", "katalog", "catalog"), "/catalog"),
    (("brewing guidance", "panduan seduh"), "/coffee-lab/brewing-guidance"),
    (("build your own blend", "byob"), "/blend-builder"),
    (("coffee experiments", "coffee experiment", "cupping experiment"), "/coffee-lab/coffee-experiments"),
    (("consultation", "konsultasi"), "/work-with-us/consultations"),
    (("wholesale", "partnership", "kemitraan"), "/work-with-us#wholesale-partnership"),
)


def resolve_feature_path(message: str) -> str | None:
    query = message.lower()
    for terms, path in _FEATURE_TERMS:
        if any(term in query for term in terms):
            return path
    return None
