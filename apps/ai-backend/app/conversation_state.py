"""Deterministic, request-scoped conversation context for Virtual Barista."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Literal, Mapping, Sequence

from .chat_router import WEBSITE_FEATURE_TERMS


ConversationTopic = Literal["coffee", "coffee_knowledge", "website", "conversation", "off_topic"]

TASTE_TERMS = {
    "fruity": ("fruity", "buah"),
    "clean": ("clean", "bersih"),
    "floral": ("floral", "bunga"),
    "sweet": ("sweet", "manis"),
    "chocolate": ("chocolate", "cokelat", "coklat"),
    "nutty": ("nutty", "kacang"),
    "citrus": ("citrus", "jeruk"),
    "bold": ("bold", "tebal"),
    "funky": ("funky", "fermentasi intens", "boozy", "winey"),
    "bright": ("bright", "cerah"),
}
BREW_METHODS = {
    "V60": ("v60", "v-60"),
    "Aeropress": ("aeropress",),
    "Kalita": ("kalita",),
    "Espresso": ("espresso",),
    "French Press": ("french press",),
    "Moka Pot": ("moka pot",),
    "Tubruk": ("tubruk",),
}
ATTRIBUTE_TERMS = {
    "process": ("proses", "process"),
    "taste": ("rasa", "rasanya", "tasting note"),
    "price": ("harga", "budget", "lebih murah", "lebih mahal"),
    "origin": ("asal", "origin"),
    "recipe": ("resep", "cara seduh", "seduhnya"),
}
ORDINALS = {
    "pertama": 0,
    "kesatu": 0,
    "1": 0,
    "kedua": 1,
    "2": 1,
    "ketiga": 2,
    "3": 2,
}
GENERIC_PRODUCT_REFERENCES = (
    "yang tadi",
    "yang itu",
    "produk tadi",
    "produk itu",
    "kopi tadi",
    "kopi itu",
    "yang satunya",
    "prosesnya",
    "rasanya",
    "harganya",
    "asalnya",
    "seduhnya",
    "bedanya",
    "lebih murah",
    "lebih mahal",
)
RETURN_TO_COFFEE_TERMS = ("balik ke kopi", "kembali ke kopi")
PROCESS_TERMS = {
    "wash": ("washed", "wash process", "full wash", "proses wash"),
    "natural": ("natural process", "proses natural"),
    "honey": ("honey process", "proses honey"),
    "anaerobic": ("anaerobic", "anaerob"),
    "wine": ("wine process", "wine processed", "proses wine", "winey"),
    "carbonic": ("carbonic maceration",),
    "lactic": ("lactic process", "proses lactic"),
}
ROAST_TERMS = {
    "Light": ("light roast", "roast ringan", "sangrai ringan"),
    "Light-Medium": ("light medium", "light-medium"),
    "Medium-Light": ("medium light", "medium-light"),
    "Medium": ("medium roast", "roast medium", "sangrai medium"),
    "Medium-Dark": ("medium dark", "medium-dark", "roast gelap"),
}


@dataclass(frozen=True)
class ConversationMessage:
    role: Literal["user", "assistant"]
    content: str
    intent: str | None = None
    grounding: str | None = None
    recommended_product_slugs: tuple[str, ...] = ()

    @classmethod
    def from_mapping(cls, message: Mapping[str, Any]) -> "ConversationMessage | None":
        role = message.get("role")
        content = message.get("content")
        if role not in {"user", "assistant"} or not isinstance(content, str):
            return None
        slugs = message.get("recommendedProductSlugs", message.get("recommended_product_slugs", ()))
        return cls(
            role=role,
            content=content[:500],
            intent=message.get("intent") if isinstance(message.get("intent"), str) else None,
            grounding=message.get("grounding") if isinstance(message.get("grounding"), str) else None,
            recommended_product_slugs=tuple(slug for slug in slugs if isinstance(slug, str))
            if isinstance(slugs, (list, tuple))
            else (),
        )


@dataclass
class ConversationState:
    active_topic: ConversationTopic = "conversation"
    active_intent: str | None = None
    referenced_product_slugs: list[str] = field(default_factory=list)
    focus_product_slug: str | None = None
    last_recommended_product_slugs: list[str] = field(default_factory=list)
    taste_preferences: list[str] = field(default_factory=list)
    brew_method: str | None = None
    budget_max: int | None = None
    budget_target: int | None = None
    requested_weight_grams: int | None = None
    taste_exclusions: list[str] = field(default_factory=list)
    required_tastes: list[str] = field(default_factory=list)
    process_preferences: list[str] = field(default_factory=list)
    process_exclusions: list[str] = field(default_factory=list)
    required_processes: list[str] = field(default_factory=list)
    roast_preferences: list[str] = field(default_factory=list)
    required_roasts: list[str] = field(default_factory=list)
    origin_preferences: list[str] = field(default_factory=list)
    varietal_preferences: list[str] = field(default_factory=list)
    requested_attributes: list[str] = field(default_factory=list)
    comparison_product_slugs: list[str] = field(default_factory=list)
    relative_price_direction: Literal["cheaper", "more_expensive"] | None = None
    needs_clarification: bool = False
    clarification_candidates: list[str] = field(default_factory=list)
    used_history: bool = False
    current_constraints_changed: bool = False

    def catalog_query_context(self) -> str:
        parts: list[str] = []
        if self.taste_preferences:
            parts.append(f"preferensi rasa: {', '.join(self.taste_preferences)}")
        if self.brew_method:
            parts.append(f"metode seduh: {self.brew_method}")
        if self.budget_max is not None:
            parts.append(f"budget maksimal: Rp {self.budget_max:,}".replace(",", "."))
        elif self.budget_target is not None:
            parts.append(f"target budget: Rp {self.budget_target:,}".replace(",", "."))
        if self.requested_weight_grams is not None:
            parts.append(f"gramasi wajib: {self.requested_weight_grams}g")
        if self.process_preferences:
            parts.append(f"preferensi proses: {', '.join(self.process_preferences)}")
        if self.process_exclusions:
            parts.append(f"proses dikecualikan: {', '.join(self.process_exclusions)}")
        if self.roast_preferences:
            parts.append(f"preferensi roast: {', '.join(self.roast_preferences)}")
        if self.origin_preferences:
            parts.append(f"preferensi origin: {', '.join(self.origin_preferences)}")
        if self.varietal_preferences:
            parts.append(f"preferensi varietal: {', '.join(self.varietal_preferences)}")
        if self.relative_price_direction == "cheaper":
            parts.append("mencari alternatif yang lebih murah dari produk yang sedang dibahas")
        if self.requested_attributes:
            parts.append(f"atribut yang ditanyakan: {', '.join(self.requested_attributes)}")
        return "; ".join(parts)


def _normalise(value: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", value.lower()))


def _append_unique(values: list[str], value: str) -> None:
    if value not in values:
        values.append(value)


def _extract_budget(message: str) -> int | None:
    match = re.search(
        r"(?:budget\s+maksimal|maksimal|maximal|max|di bawah|kurang dari|tidak lebih dari)\s*(?:rp\.?\s*)?([0-9][0-9.,]*)\s*(ribu|rb|k|juta|jt)?",
        message.lower(),
    )
    if not match:
        return None
    raw_number = match.group(1)
    suffix = match.group(2)
    if suffix:
        value = float(raw_number.replace(",", "."))
    else:
        value = int(re.sub(r"[.,]", "", raw_number))
    multiplier = 1_000_000 if suffix in {"juta", "jt"} else 1_000 if suffix else 1
    return int(value * multiplier)


def _extract_budget_target(message: str) -> int | None:
    match = re.search(
        r"(?:budget|sekitar)\s*(?:rp\.?\s*)?([0-9][0-9.,]*)\s*(ribu|rb|k|juta|jt)?",
        message.lower(),
    )
    if not match:
        return None
    raw_number, suffix = match.groups()
    value = float(raw_number.replace(",", ".")) if suffix else int(re.sub(r"[.,]", "", raw_number))
    return int(value * (1_000_000 if suffix in {"juta", "jt"} else 1_000 if suffix else 1))


def _extract_weight(message: str) -> int | None:
    query = message.lower()
    match = re.search(r"\b(\d+(?:[.,]\d+)?)\s*(kg|g|gram)\b", query)
    if not match:
        return None
    value = float(match.group(1).replace(",", "."))
    grams = int(value * 1000) if match.group(2) == "kg" else int(value)
    package_cue = any(term in query for term in ("kemasan", "paket", "berat", "gramasi", "ukuran", "variant", "varian"))
    return grams if grams >= 50 or package_cue else None


def _extract_constraints(
    message: str,
    state: ConversationState,
    products: Sequence[Mapping[str, Any]],
    *,
    current: bool,
) -> None:
    query = message.lower()
    mentioned = False

    def has_nearby_intent(terms: Sequence[str], markers: Sequence[str]) -> bool:
        return any(
            marker in query[max(0, query.find(term) - 24):query.find(term)]
            for term in terms if term in query
            for marker in markers
        )

    for taste, terms in TASTE_TERMS.items():
        if any(term in query for term in terms):
            exclusion_intent = has_nearby_intent(terms, ("jangan", "tanpa", "hindari", "bukan yang"))
            required_intent = has_nearby_intent(terms, ("harus",))
            target = state.taste_exclusions if exclusion_intent else state.taste_preferences
            _append_unique(target, taste)
            if required_intent and not exclusion_intent:
                _append_unique(state.required_tastes, taste)
            mentioned = True
    for method, terms in BREW_METHODS.items():
        if any(term in query for term in terms):
            state.brew_method = method
            mentioned = True
            break
    budget = _extract_budget(query)
    if budget is not None:
        state.budget_max = budget
        state.budget_target = None
        mentioned = True
    elif (budget_target := _extract_budget_target(query)) is not None:
        state.budget_target = budget_target
        mentioned = True
    if (weight := _extract_weight(query)) is not None:
        state.requested_weight_grams = weight
        mentioned = True
    for process, terms in PROCESS_TERMS.items():
        if any(term in query for term in terms):
            exclusion_intent = has_nearby_intent(terms, ("jangan", "tanpa", "hindari", "bukan yang"))
            required_intent = has_nearby_intent(terms, ("harus",))
            target = state.process_exclusions if exclusion_intent else state.process_preferences
            _append_unique(target, process)
            if required_intent and not exclusion_intent:
                _append_unique(state.required_processes, process)
            mentioned = True
    for roast, terms in ROAST_TERMS.items():
        if any(term in query for term in terms):
            _append_unique(state.roast_preferences, roast)
            if has_nearby_intent(terms, ("harus",)):
                _append_unique(state.required_roasts, roast)
            mentioned = True
    for product in products:
        identity = _normalise(str(product.get("origin", "")))
        varietal = _normalise(str(product.get("varietal", "")))
        for token in set(identity.split()):
            if len(token) >= 4 and re.search(rf"\b{re.escape(token)}\b", _normalise(query)):
                _append_unique(state.origin_preferences, token)
                mentioned = True
        for token in set(varietal.split()):
            if len(token) >= 4 and re.search(rf"\b{re.escape(token)}\b", _normalise(query)):
                _append_unique(state.varietal_preferences, token)
                mentioned = True
    for attribute, terms in ATTRIBUTE_TERMS.items():
        if any(term in query for term in terms):
            _append_unique(state.requested_attributes, attribute)
    if "lebih murah" in query:
        state.relative_price_direction = "cheaper"
        mentioned = True
    elif "lebih mahal" in query:
        state.relative_price_direction = "more_expensive"
        mentioned = True
    if current:
        state.current_constraints_changed = mentioned


def _identity_phrases(product: Mapping[str, Any]) -> list[str]:
    base_name = re.sub(r"\s*\([^)]*\)\s*$", "", str(product.get("name", "")))
    phrases = [_normalise(base_name), _normalise(str(product.get("slowbar_alias", "")))]
    words = phrases[0].split()
    phrases.extend(" ".join(words[:length]) for length in range(1, len(words) + 1))
    return [phrase for phrase in phrases if len(phrase) >= 4]


def find_product_candidates(message: str, products: Sequence[Mapping[str, Any]]) -> list[str]:
    query = _normalise(message)
    scored: list[tuple[str, int]] = []
    for product in products:
        matches = [len(phrase.split()) for phrase in _identity_phrases(product) if re.search(rf"\b{re.escape(phrase)}\b", query)]
        if matches:
            scored.append((str(product["slug"]), max(matches)))
    if not scored:
        return []
    best = max(score for _, score in scored)
    return [slug for slug, score in scored if score == best]


def _comparison_candidates(
    message: str,
    products: Sequence[Mapping[str, Any]],
) -> tuple[list[str], list[str]]:
    query = _normalise(message)
    groups: dict[str, list[tuple[str, int]]] = {}
    for product in products:
        matches = [len(phrase.split()) for phrase in _identity_phrases(product) if re.search(rf"\b{re.escape(phrase)}\b", query)]
        if not matches:
            continue
        base_name = _normalise(re.sub(r"\s*\([^)]*\)\s*$", "", str(product.get("name", ""))))
        group = " ".join(base_name.split()[:2])
        groups.setdefault(group, []).append((str(product["slug"]), max(matches)))
    selected: list[str] = []
    ambiguous: list[str] = []
    for matches in groups.values():
        best = max(score for _, score in matches)
        winners = [slug for slug, score in matches if score == best]
        if len(winners) == 1:
            selected.extend(winners)
        else:
            ambiguous.extend(winners)
    return selected, ambiguous


def _is_website_message(message: str) -> bool:
    query = message.lower()
    return any(term in query for term in WEBSITE_FEATURE_TERMS)


def _ordinal_index(message: str) -> int | None:
    query = _normalise(message)
    match = re.search(r"\b(?:yang|nomor|produk)\s+(pertama|kesatu|kedua|ketiga|[123])\b", query)
    return ORDINALS.get(match.group(1)) if match else None


def _has_generic_product_reference(message: str) -> bool:
    query = message.lower()
    return any(term in query for term in GENERIC_PRODUCT_REFERENCES)


def _is_comparison(message: str) -> bool:
    query = message.lower()
    return any(term in query for term in ("bandingkan", "dibanding", "perbedaan", " versus ", " vs ", "bedanya"))


def _reset_active_coffee_context(state: ConversationState) -> None:
    state.referenced_product_slugs.clear()
    state.focus_product_slug = None
    state.last_recommended_product_slugs.clear()
    state.taste_preferences.clear()
    state.brew_method = None
    state.budget_max = None
    state.budget_target = None
    state.requested_weight_grams = None
    state.taste_exclusions.clear()
    state.required_tastes.clear()
    state.process_preferences.clear()
    state.process_exclusions.clear()
    state.required_processes.clear()
    state.roast_preferences.clear()
    state.required_roasts.clear()
    state.origin_preferences.clear()
    state.varietal_preferences.clear()
    state.requested_attributes.clear()
    state.comparison_product_slugs.clear()
    state.relative_price_direction = None


def _coffee_snapshot(state: ConversationState) -> ConversationState:
    return ConversationState(
        active_topic="coffee",
        active_intent=state.active_intent,
        referenced_product_slugs=state.referenced_product_slugs.copy(),
        focus_product_slug=state.focus_product_slug,
        last_recommended_product_slugs=state.last_recommended_product_slugs.copy(),
        taste_preferences=state.taste_preferences.copy(),
        brew_method=state.brew_method,
        budget_max=state.budget_max,
        budget_target=state.budget_target,
        requested_weight_grams=state.requested_weight_grams,
        taste_exclusions=state.taste_exclusions.copy(),
        required_tastes=state.required_tastes.copy(),
        process_preferences=state.process_preferences.copy(),
        process_exclusions=state.process_exclusions.copy(),
        required_processes=state.required_processes.copy(),
        roast_preferences=state.roast_preferences.copy(),
        required_roasts=state.required_roasts.copy(),
        origin_preferences=state.origin_preferences.copy(),
        varietal_preferences=state.varietal_preferences.copy(),
        requested_attributes=state.requested_attributes.copy(),
        comparison_product_slugs=state.comparison_product_slugs.copy(),
    )


def derive_conversation_state(
    history: Sequence[Mapping[str, Any]],
    current_message: str,
    products: Sequence[Mapping[str, Any]],
) -> ConversationState:
    """Rebuild the useful coffee context from recent messages; nothing is persisted."""
    valid_slugs = {str(product["slug"]) for product in products}
    product_by_slug = {str(product["slug"]): product for product in products}
    state = ConversationState()
    previous_coffee: ConversationState | None = None

    parsed_history = [message for raw in history[-8:] if (message := ConversationMessage.from_mapping(raw))]
    messages = [*parsed_history, ConversationMessage("user", current_message)]
    for index, message in enumerate(messages):
        is_current = index == len(messages) - 1

        if message.role == "assistant":
            safe_slugs = [slug for slug in message.recommended_product_slugs if slug in valid_slugs]
            if safe_slugs and (
                len(safe_slugs) > 1
                or message.intent in {"product_recommendation", "product_comparison"}
                or not state.last_recommended_product_slugs
            ):
                state.last_recommended_product_slugs = safe_slugs
            if message.intent in {"website_feature", "website_action", "off_topic"}:
                if state.active_topic in {"coffee", "coffee_knowledge"}:
                    previous_coffee = _coffee_snapshot(state)
                _reset_active_coffee_context(state)
                state.active_topic = "website" if message.intent != "off_topic" else "off_topic"
                state.active_intent = message.intent
            elif message.intent == "coffee_knowledge":
                state.active_topic = "coffee_knowledge"
                state.active_intent = message.intent
            elif message.intent in {"catalog_query", "product_recommendation", "product_comparison"}:
                state.active_topic = "coffee"
                state.active_intent = message.intent
            continue

        query = message.content.lower()
        if is_current:
            state.used_history = False
            state.current_constraints_changed = False
        state.needs_clarification = False
        state.clarification_candidates.clear()
        if any(term in query for term in RETURN_TO_COFFEE_TERMS) and previous_coffee:
            state = previous_coffee
            state.used_history = True
            if not state.referenced_product_slugs:
                if len(state.last_recommended_product_slugs) == 1:
                    state.referenced_product_slugs = state.last_recommended_product_slugs.copy()
                    state.focus_product_slug = state.referenced_product_slugs[0]
                elif state.last_recommended_product_slugs:
                    state.needs_clarification = True
                    state.clarification_candidates = state.last_recommended_product_slugs.copy()
        if _is_website_message(message.content):
            if state.active_topic in {"coffee", "coffee_knowledge"}:
                previous_coffee = _coffee_snapshot(state)
            _reset_active_coffee_context(state)
            state.active_topic = "website"
            state.active_intent = "website_feature"
            continue

        had_coffee_context = bool(
            state.referenced_product_slugs
            or state.last_recommended_product_slugs
            or state.taste_preferences
            or state.active_intent in {"catalog_query", "product_recommendation", "product_comparison", "coffee_knowledge"}
        )
        _extract_constraints(message.content, state, products, current=is_current)
        if is_current and state.current_constraints_changed and had_coffee_context:
            state.used_history = True
        candidates = find_product_candidates(message.content, products)
        previous_refs = state.referenced_product_slugs.copy()
        ordinal = _ordinal_index(message.content)
        generic_reference = _has_generic_product_reference(message.content)
        direct_comparison, ambiguous_comparison = (
            _comparison_candidates(message.content, products) if _is_comparison(message.content) else ([], [])
        )

        if ambiguous_comparison:
            state.needs_clarification = True
            state.clarification_candidates = ambiguous_comparison
        elif len(direct_comparison) >= 2:
            state.comparison_product_slugs = direct_comparison
            state.referenced_product_slugs = direct_comparison
            state.focus_product_slug = direct_comparison[-1]
            state.active_topic = "coffee"
        elif ordinal is not None:
            if ordinal < len(state.last_recommended_product_slugs):
                state.referenced_product_slugs = [state.last_recommended_product_slugs[ordinal]]
                state.focus_product_slug = state.referenced_product_slugs[0]
                state.needs_clarification = False
                state.clarification_candidates.clear()
                state.used_history = True
            else:
                state.needs_clarification = True
        elif candidates:
            if len(candidates) > 1:
                state.needs_clarification = True
                state.clarification_candidates = candidates
            else:
                selected = candidates[0]
                state.needs_clarification = False
                state.clarification_candidates.clear()
                if _is_comparison(message.content) and previous_refs and selected not in previous_refs:
                    state.comparison_product_slugs = [previous_refs[-1], selected]
                    state.referenced_product_slugs = state.comparison_product_slugs.copy()
                    state.focus_product_slug = selected
                    state.used_history = True
                else:
                    state.referenced_product_slugs = [selected]
                    state.focus_product_slug = selected
                state.active_topic = "coffee"
        elif generic_reference:
            if "yang satunya" in query and state.focus_product_slug:
                alternatives = [
                    slug for slug in state.last_recommended_product_slugs
                    if slug != state.focus_product_slug
                ]
                if len(alternatives) == 1:
                    state.referenced_product_slugs = alternatives
                    state.focus_product_slug = alternatives[0]
                    state.used_history = True
                else:
                    state.needs_clarification = True
                    state.clarification_candidates = alternatives
            elif _is_comparison(message.content) and len(state.comparison_product_slugs) == 2:
                state.referenced_product_slugs = state.comparison_product_slugs.copy()
                state.used_history = True
            elif len(state.referenced_product_slugs) == 1:
                state.used_history = True
            elif len(state.last_recommended_product_slugs) == 1:
                state.referenced_product_slugs = state.last_recommended_product_slugs.copy()
                state.focus_product_slug = state.referenced_product_slugs[0]
                state.used_history = True
            elif state.active_intent == "coffee_knowledge":
                state.used_history = True
            else:
                state.needs_clarification = True
                state.clarification_candidates = state.last_recommended_product_slugs.copy()

        if "yang fruity tadi" in query and state.last_recommended_product_slugs:
            fruity = [
                slug for slug in state.last_recommended_product_slugs
                if "fruity" in " ".join(
                    [*product_by_slug[slug].get("notes", []), *product_by_slug[slug].get("flavor_category", [])]
                ).lower()
            ]
            if len(fruity) == 1:
                state.referenced_product_slugs = fruity
                state.focus_product_slug = fruity[0]
                state.needs_clarification = False
                state.clarification_candidates.clear()
                state.used_history = True
            elif len(fruity) > 1:
                state.needs_clarification = True
                state.clarification_candidates = fruity

    return state


def is_contextual_knowledge_followup(message: str, state: ConversationState) -> bool:
    if state.active_intent != "coffee_knowledge" or not state.used_history:
        return False
    query = message.lower()
    return any(term in query for term in ("prosesnya", "rasanya", "varietalnya", "fermentasinya", "seduhnya"))
