"""Deterministic hybrid ranking for published 52 Coffee catalog records."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Mapping, Sequence

from .conversation_state import ConversationState


# Product facts remain in rag_service.COFFEE_KNOWLEDGE_BASE. These weights only
# describe how independent evidence is combined; eligibility never uses score.
SCORING_WEIGHTS = {
    "taste": 4.0,
    "brew": 2.0,
    "process": 1.5,
    "roast": 1.25,
    "origin": 0.75,
    "varietal": 0.75,
    "semantic": 1.0,
    "budget": 0.5,
}

TASTE_EVIDENCE = {
    "fruity": ("fruity", "fruit", "berry", "strawberry", "blueberry", "peach", "mango", "lychee", "pineapple", "jackfruit", "tropical", "red fruit", "deepberry"),
    "citrus": ("citrus", "lime", "lemon", "orange", "mandarin", "tangerine", "bergamot", "jeruk"),
    "floral": ("floral", "jasmine", "bunga"),
    "chocolate": ("chocolate", "chocolaty", "cocoa", "cokelat", "coklat"),
    "nutty": ("nutty", "almond", "cashew", "kacang"),
    "sweet": ("sweet", "honey", "caramel", "brown sugar", "palm sugar", "candy", "syrup", "manis"),
    "clean": ("clean", "crystalline", "jernih"),
    "funky": ("funky", "boozy", "winey", "wine-like", "fermented sweetness", "fermentasi intens"),
    "bright": ("bright", "crisp", "acidity", "citrus", "lime", "mandarin", "tangerine", "bergamot", "cerah"),
    "bold": ("bold", "full body", "rich taste", "body tebal"),
}


@dataclass(frozen=True)
class CatalogVariant:
    weight_grams: int
    weight_label: str
    price: int

    @property
    def price_per_gram(self) -> float:
        return self.price / self.weight_grams


@dataclass
class Recommendation:
    product: Mapping[str, Any]
    variant: CatalogVariant
    score: float
    reasons: list[str] = field(default_factory=list)
    trade_offs: list[str] = field(default_factory=list)


@dataclass
class RecommendationResult:
    recommendations: list[Recommendation]
    rejection_reason: str | None = None


def _normalise(value: object) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", str(value).lower()))


def catalog_variants(product: Mapping[str, Any]) -> list[CatalogVariant]:
    variants: list[CatalogVariant] = []
    raw_variants = product.get("variants")
    if isinstance(raw_variants, Sequence) and not isinstance(raw_variants, (str, bytes)):
        for raw in raw_variants:
            if not isinstance(raw, Mapping) or raw.get("inStock") is False:
                continue
            weight, price = raw.get("weightGrams"), raw.get("price")
            if isinstance(weight, (int, float)) and isinstance(price, (int, float)) and weight > 0 and price > 0:
                variants.append(CatalogVariant(int(weight), str(raw.get("weightLabel") or f"{int(weight)}g"), int(price)))
    else:
        for key, price in product.items():
            match = re.fullmatch(r"price_(\d+)g", str(key))
            if match and isinstance(price, (int, float)) and price > 0:
                weight = int(match.group(1))
                variants.append(CatalogVariant(weight, "1kg" if weight == 1000 else f"{weight}g", int(price)))
    return sorted(variants, key=lambda variant: (variant.weight_grams, variant.price))


def _product_text(product: Mapping[str, Any]) -> str:
    values = [
        product.get("description", ""),
        *(product.get("notes") or []),
        *(product.get("flavor_category") or []),
    ]
    return _normalise(" ".join(str(value) for value in values))


def _taste_matches(product: Mapping[str, Any], taste: str) -> bool:
    text = _product_text(product)
    return any(term in text for term in TASTE_EVIDENCE.get(taste, (taste,)))


def _process_signals(product: Mapping[str, Any]) -> set[str]:
    process = _normalise(product.get("process", ""))
    aliases = {
        "wash": ("wash", "washed"),
        "natural": ("natural",),
        "honey": ("honey",),
        "anaerobic": ("anaerob",),
        "wine": ("wine",),
        "carbonic": ("carbonic",),
        "lactic": ("lactic",),
    }
    return {name for name, terms in aliases.items() if any(term in process for term in terms)}


def _brew_evidence(product: Mapping[str, Any], method: str | None) -> str:
    if not method:
        return "none"
    normalised_method = _normalise(method)
    recipe = _normalise(product.get("recipe", ""))
    if normalised_method in recipe or (normalised_method == "espresso" and product.get("category") == "espresso"):
        return "explicit"
    if product.get("category") == "filter" and normalised_method in {"v60", "kalita", "aeropress", "french press"}:
        return "inferred"
    return "unknown"


def _select_variant(
    variants: Sequence[CatalogVariant],
    state: ConversationState,
    reference_variant: CatalogVariant | None,
) -> CatalogVariant | None:
    eligible = list(variants)
    if state.requested_weight_grams is not None:
        eligible = [variant for variant in eligible if variant.weight_grams == state.requested_weight_grams]
    elif reference_variant and state.relative_price_direction:
        same_weight = [variant for variant in eligible if variant.weight_grams == reference_variant.weight_grams]
        if same_weight:
            eligible = same_weight
    if state.budget_max is not None:
        eligible = [variant for variant in eligible if variant.price <= state.budget_max]
    if not eligible:
        return None
    if state.budget_target is not None:
        return min(eligible, key=lambda variant: (abs(variant.price - state.budget_target), variant.price))
    if state.budget_max is not None:
        return min(
            eligible,
            key=lambda variant: (variant.price_per_gram, variant.price, -variant.weight_grams),
        )
    return eligible[0]


def _reference_variant(products: Mapping[str, Mapping[str, Any]], state: ConversationState) -> CatalogVariant | None:
    reference_slug = state.focus_product_slug or (state.referenced_product_slugs[-1] if state.referenced_product_slugs else None)
    if not reference_slug or reference_slug not in products:
        return None
    variants = catalog_variants(products[reference_slug])
    if state.requested_weight_grams is not None:
        return next((variant for variant in variants if variant.weight_grams == state.requested_weight_grams), None)
    return variants[0] if variants else None


def recommend_products(
    products: Sequence[Mapping[str, Any]],
    state: ConversationState,
    semantic_results: Sequence[tuple[Mapping[str, Any], float]],
    *,
    limit: int = 3,
) -> RecommendationResult:
    """Filter hard constraints first, then rank current catalog facts."""
    active = {
        str(product.get("slug")): product
        for product in products
        if product.get("slug")
        and product.get("name")
        and product.get("publication_status", "published") == "published"
        and catalog_variants(product)
    }
    semantic_scores: dict[str, float] = {}
    for semantic_product, score in semantic_results:
        slug = str(semantic_product.get("slug", ""))
        if slug in active and slug not in semantic_scores:
            semantic_scores[slug] = max(0.0, min(float(score), 1.0))

    reference_variant = _reference_variant(active, state)
    ranked: list[Recommendation] = []
    missing_requested_weight = bool(state.requested_weight_grams)
    for slug, product in active.items():
        variants = catalog_variants(product)
        if state.requested_weight_grams and any(
            variant.weight_grams == state.requested_weight_grams for variant in variants
        ):
            missing_requested_weight = False

        process_signals = _process_signals(product)
        if any(exclusion in process_signals for exclusion in state.process_exclusions):
            continue
        if state.required_processes and not all(required in process_signals for required in state.required_processes):
            continue
        if state.required_tastes and not all(_taste_matches(product, taste) for taste in state.required_tastes):
            continue
        if state.required_roasts and _normalise(product.get("roast", "")) not in {
            _normalise(roast) for roast in state.required_roasts
        }:
            continue
        if any(_taste_matches(product, taste) for taste in state.taste_exclusions):
            continue

        variant = _select_variant(variants, state, reference_variant)
        if variant is None:
            continue
        different_weight_comparison = False
        if reference_variant and state.relative_price_direction:
            same_weight = variant.weight_grams == reference_variant.weight_grams
            different_weight_comparison = not same_weight
            candidate_price = variant.price if same_weight else variant.price_per_gram
            reference_price = reference_variant.price if same_weight else reference_variant.price_per_gram
            if state.relative_price_direction == "cheaper" and candidate_price >= reference_price:
                continue
            if state.relative_price_direction == "more_expensive" and candidate_price <= reference_price:
                continue
            if slug in state.referenced_product_slugs:
                continue

        score = semantic_scores.get(slug, 0.0) * SCORING_WEIGHTS["semantic"]
        reasons: list[str] = []
        trade_offs: list[str] = []
        matched_tastes = [taste for taste in state.taste_preferences if _taste_matches(product, taste)]
        if state.taste_preferences:
            score += SCORING_WEIGHTS["taste"] * len(matched_tastes) / len(state.taste_preferences)
            if matched_tastes:
                reasons.append(f"karakter {', '.join(matched_tastes)} didukung tasting notes/deskripsi")
            missing = [taste for taste in state.taste_preferences if taste not in matched_tastes]
            if missing:
                trade_offs.append(f"bukti {', '.join(missing)} tidak tercatat")

        brew_evidence = _brew_evidence(product, state.brew_method)
        if brew_evidence == "explicit":
            score += SCORING_WEIGHTS["brew"]
            reasons.append(f"resep katalog mencantumkan {state.brew_method}")
        elif brew_evidence == "inferred":
            score += SCORING_WEIGHTS["brew"] / 2
            trade_offs.append(f"kecocokan {state.brew_method} merupakan inferensi filter roast, bukan klaim resmi katalog")
        elif state.brew_method:
            trade_offs.append(f"kecocokan {state.brew_method} belum terdokumentasi")

        matched_processes = [process for process in state.process_preferences if process in process_signals]
        if state.process_preferences:
            score += SCORING_WEIGHTS["process"] * len(matched_processes) / len(state.process_preferences)
            if matched_processes:
                reasons.append(f"proses {product.get('process')}")

        product_roast = _normalise(product.get("roast", ""))
        if state.roast_preferences and product_roast in {_normalise(roast) for roast in state.roast_preferences}:
            score += SCORING_WEIGHTS["roast"]
            reasons.append(f"profil roast {product.get('roast')}")

        origin = _normalise(product.get("origin", ""))
        matched_origins = [value for value in state.origin_preferences if _normalise(value) in origin]
        if matched_origins:
            score += SCORING_WEIGHTS["origin"] * len(matched_origins) / len(state.origin_preferences)
            reasons.append(f"origin {product.get('origin')}")
        varietal = _normalise(product.get("varietal", ""))
        matched_varietals = [value for value in state.varietal_preferences if _normalise(value) in varietal]
        if matched_varietals:
            score += SCORING_WEIGHTS["varietal"] * len(matched_varietals) / len(state.varietal_preferences)
            reasons.append(f"varietal {product.get('varietal')}")

        if state.budget_max is not None:
            score += SCORING_WEIGHTS["budget"]
            reasons.append(f"variant {variant.weight_label} berada di bawah batas budget")
        elif state.budget_target:
            fit = max(0.0, 1 - abs(variant.price - state.budget_target) / state.budget_target)
            score += SCORING_WEIGHTS["budget"] * fit
            reasons.append(f"variant {variant.weight_label} mendekati target budget")
        if reference_variant and state.relative_price_direction:
            direction = "lebih murah" if state.relative_price_direction == "cheaper" else "lebih mahal"
            if different_weight_comparison:
                trade_offs.append(
                    f"perbandingan {direction} memakai harga per gram karena berat paket berbeda; harga checkout tetap {variant.weight_label}"
                )
            else:
                reasons.append(f"{direction} pada gramasi {variant.weight_label} yang setara")
        ranked.append(Recommendation(product, variant, score, reasons, trade_offs))

    if not ranked:
        if missing_requested_weight:
            return RecommendationResult([], f"Variant {state.requested_weight_grams}g tidak tersedia pada katalog aktif.")
        if state.budget_max is not None:
            return RecommendationResult([], "Belum ada variant katalog aktif yang memenuhi batas budget tersebut.")
        if state.relative_price_direction:
            direction = "lebih murah" if state.relative_price_direction == "cheaper" else "lebih mahal"
            return RecommendationResult([], f"Belum ada alternatif aktif yang {direction} pada basis berat yang dapat dibandingkan.")
        return RecommendationResult([], "Belum ada produk katalog aktif yang memenuhi semua hard constraint.")

    # Price-per-gram only breaks equal recommendation scores. The package price
    # above remains the hard budget check and is always shown to the customer.
    ranked.sort(
        key=lambda item: (-item.score, item.variant.price_per_gram, item.variant.price, str(item.product.get("name", "")))
    )
    return RecommendationResult(ranked[: max(1, min(limit, 3))])


def format_recommendation_reply(result: RecommendationResult) -> str:
    if not result.recommendations:
        return result.rejection_reason or "Belum ada produk katalog aktif yang cocok."
    lines = ["Pilihan paling relevan dari katalog aktif:"]
    for index, recommendation in enumerate(result.recommendations, 1):
        product, variant = recommendation.product, recommendation.variant
        price = f"Rp{variant.price:,}".replace(",", ".")
        notes = ", ".join(str(note) for note in product.get("notes", [])[:4]) or "tasting notes belum tercatat"
        reasons = "; ".join(recommendation.reasons[:3]) or f"proses {product.get('process', 'belum tercatat')}"
        lines.append(
            f"{index}. {product['name']} - {variant.weight_label} {price}. "
            f"{reasons}. Tasting notes: {notes}."
        )
        if recommendation.trade_offs:
            lines.append(f"   Catatan: {recommendation.trade_offs[0]}.")
    return "\n".join(lines)


def format_product_comparison(products: Sequence[Mapping[str, Any]]) -> str:
    lines = ["Perbandingan berdasarkan record katalog aktif:"]
    for product in products:
        variants = ", ".join(
            f"{variant.weight_label} Rp{variant.price:,}".replace(",", ".")
            for variant in catalog_variants(product)
        ) or "variant harga belum tercatat"
        notes = ", ".join(str(note) for note in product.get("notes", [])) or "belum tercatat"
        lines.append(
            f"- {product.get('name')}: proses {product.get('process', 'belum tercatat')}; "
            f"roast {product.get('roast', 'belum tercatat')}; tasting notes {notes}; variant {variants}."
        )
    lines.append("Bandingkan harga pada gramasi yang sama; harga per gram hanya alat pembanding, bukan harga checkout.")
    return "\n".join(lines)
