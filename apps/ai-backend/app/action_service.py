"""Deterministic proposals for Virtual Barista website actions."""
from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from typing import Any, Mapping, Sequence

from .conversation_state import ConversationState, find_product_candidates
from .recommendation_service import catalog_variants
from .website_features import resolve_feature_path

MAX_CART_QUANTITY = 10
_ADD_TERMS = ("tambahkan", "masukkan", "add", "ke keranjang")
_VIEW_TERMS = ("buka", "lihat", "tampilkan", "detail")
_PRICE_OVERRIDE = re.compile(r"(?:rp\.?\s*|harga\s+)[0-9][0-9.,]*(?:\s*(?:ribu|rb|k))?", re.IGNORECASE)


@dataclass(frozen=True)
class ActionResolution:
    handled: bool
    reply: str = ""
    action: dict[str, Any] | None = None
    product_slug: str | None = None
    grounding: str = "conversation"


def _action_id(request_id: str | None, kind: str, value: str) -> str:
    seed = f"{request_id or 'legacy'}:{kind}:{value}"
    return f"vb-{hashlib.sha256(seed.encode()).hexdigest()[:20]}"


def _requested_quantity(query: str) -> int:
    negative = re.search(r"(?:^|\s)-\s*([0-9]+)\b", query)
    if negative:
        return -int(negative.group(1))
    match = re.search(r"\b([0-9]+)\b\s*(?:bungkus|pack|paket|pcs|x)?", query.lower())
    if match:
        return int(match.group(1))
    words = {"satu": 1, "dua": 2, "tiga": 3, "empat": 4, "lima": 5}
    return next((value for word, value in words.items() if re.search(rf"\b{word}\b", query.lower())), 1)


def _selected_weight(history: Sequence[Mapping[str, Any]], product_slug: str) -> int | None:
    for message in reversed(history):
        if message.get("role") != "assistant":
            continue
        variants = message.get("recommendedVariants", message.get("recommended_variants", []))
        if not isinstance(variants, list):
            continue
        for variant in variants:
            if isinstance(variant, Mapping) and variant.get("productSlug") == product_slug:
                weight = variant.get("weightGrams")
                if isinstance(weight, int) and weight > 0:
                    return weight
    return None


def _resolve_product(
    query: str,
    state: ConversationState,
    products: Sequence[Mapping[str, Any]],
) -> tuple[Mapping[str, Any] | None, str | None]:
    by_slug = {str(product["slug"]): product for product in products}
    direct = [slug for slug in find_product_candidates(query, products) if slug in by_slug]
    candidates = direct or [slug for slug in state.referenced_product_slugs if slug in by_slug]
    if not candidates and state.focus_product_slug in by_slug:
        candidates = [state.focus_product_slug]
    candidates = list(dict.fromkeys(candidates))
    if len(candidates) == 1:
        return by_slug[candidates[0]], None
    if len(candidates) > 1:
        names = ", ".join(str(by_slug[slug]["name"]) for slug in candidates[:3])
        return None, f"Produk yang dimaksud belum jelas. Pilih salah satu: {names}."
    return None, "Produk yang ingin diproses belum jelas. Sebutkan nama kopi atau nomor rekomendasinya."


def resolve_contextual_action(
    query: str,
    *,
    state: ConversationState,
    products: Sequence[Mapping[str, Any]],
    history: Sequence[Mapping[str, Any]],
    request_id: str | None,
) -> ActionResolution:
    """Return an untrusted proposal; the frontend validates before execution."""
    normalized = query.lower()
    wants_add = any(term in normalized for term in _ADD_TERMS)
    wants_view = any(term in normalized for term in _VIEW_TERMS)
    if not wants_add and not wants_view:
        return ActionResolution(False)
    if re.search(r"https?://|www\.", normalized):
        return ActionResolution(True, "Saya hanya dapat membuka rute internal 52 Coffee yang tersedia.")

    feature_path = resolve_feature_path(query)
    if wants_view and feature_path:
        return ActionResolution(
            True,
            "Saya menyiapkan halaman fitur tersebut.",
            {"action_id": _action_id(request_id, "feature", feature_path), "type": "open_feature", "path": feature_path},
            grounding="website",
        )
    if wants_add:
        if _PRICE_OVERRIDE.search(query):
            return ActionResolution(True, "Harga dari pesan tidak dapat dipakai. Saya hanya dapat memakai harga katalog saat ini.")
        quantity = _requested_quantity(query)
        if quantity < 1 or quantity > MAX_CART_QUANTITY:
            return ActionResolution(True, f"Jumlah harus berupa bilangan bulat antara 1 dan {MAX_CART_QUANTITY} bungkus.")
        product, clarification = _resolve_product(query, state, products)
        if product is None:
            return ActionResolution(True, clarification or "Produk belum jelas.")
        variants = catalog_variants(product)
        explicit_weight = state.requested_weight_grams if re.search(r"\b\d+\s*g\b", normalized) else None
        selected_weight = explicit_weight or _selected_weight(history, str(product["slug"]))
        if selected_weight is None and len(variants) == 1:
            selected_weight = variants[0].weight_grams
        if selected_weight is None:
            labels = ", ".join(variant.weight_label for variant in variants)
            return ActionResolution(True, f"{product['name']} memiliki beberapa varian. Pilih beratnya: {labels}.")
        variant = next((item for item in variants if item.weight_grams == selected_weight), None)
        if variant is None:
            return ActionResolution(True, f"Varian {selected_weight}g untuk {product['name']} tidak tersedia di katalog saat ini.")
        return ActionResolution(
            True,
            f"Saya menyiapkan {product['name']} {variant.weight_label} sebanyak {quantity} bungkus untuk keranjang.",
            {
                "action_id": _action_id(request_id, "cart", f"{product['slug']}:{variant.weight_grams}:{quantity}"),
                "type": "add_to_cart",
                "product_slug": product["slug"],
                "variant_weight": variant.weight_grams,
                "quantity": quantity,
            },
            str(product["slug"]),
            "catalog",
        )
    if wants_view:
        product, clarification = _resolve_product(query, state, products)
        if product is None:
            return ActionResolution(True, clarification or "Produk belum jelas.")
        slug = str(product["slug"])
        return ActionResolution(
            True,
            "Saya menyiapkan detail produk tersebut.",
            {"action_id": _action_id(request_id, "product", slug), "type": "view_product", "product_slug": slug},
            slug,
            "catalog",
        )
    return ActionResolution(False)
