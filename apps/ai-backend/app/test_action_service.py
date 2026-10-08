import unittest
from unittest.mock import patch

from .action_service import MAX_CART_QUANTITY, resolve_contextual_action
from .conversation_state import ConversationState, derive_conversation_state
from .guardrail_service import GuardrailDecision, guardrail_service
from .models import ChatResponse
from .rag_service import rag_service


PRODUCTS = [
    {
        "slug": "prau-fruity",
        "name": "Prau Fruity",
        "slowbar_alias": "Prau",
        "notes": ["Strawberry", "Clean"],
        "flavor_category": ["Fruity"],
        "price_100g": 85_000,
        "price_200g": 150_000,
    },
    {
        "slug": "buntu-natural",
        "name": "Buntu Natural",
        "slowbar_alias": "Buntu",
        "notes": ["Blueberry"],
        "flavor_category": ["Fruity"],
        "price_100g": 90_000,
    },
    {
        "slug": "cokelat-bold",
        "name": "Cokelat Bold",
        "slowbar_alias": "Bold",
        "notes": ["Dark Chocolate"],
        "flavor_category": ["Chocolaty"],
        "price_200g": 80_000,
    },
]


def assistant(slugs, variants=None):
    return {
        "role": "assistant",
        "content": "Rekomendasi katalog.",
        "intent": "product_recommendation",
        "grounding": "catalog",
        "recommendedProductSlugs": slugs,
        "recommendedVariants": variants or [],
    }


def resolve(query, history=None, request_id="request-0001"):
    history = history or []
    return resolve_contextual_action(
        query,
        state=derive_conversation_state(history, query, PRODUCTS),
        products=PRODUCTS,
        history=history,
        request_id=request_id,
    )


class ContextualActionServiceTest(unittest.TestCase):
    def setUp(self):
        self.history = [
            {"role": "user", "content": "Rekomendasikan kopi fruity"},
            assistant(["prau-fruity", "buntu-natural"], [
                {"productSlug": "prau-fruity", "weightGrams": 100},
                {"productSlug": "buntu-natural", "weightGrams": 100},
            ]),
        ]

    def test_01_add_second_recommendation(self):
        result = resolve("Masukkan yang kedua ke keranjang", self.history)
        self.assertEqual(result.action["product_slug"], "buntu-natural")

    def test_02_add_explicit_product(self):
        result = resolve("Tambahkan Prau 100g ke keranjang")
        self.assertEqual(result.action["product_slug"], "prau-fruity")

    def test_03_quantity_two(self):
        self.assertEqual(resolve("Tambahkan 2 bungkus Prau 100g").action["quantity"], 2)

    def test_04_explicit_100g_variant(self):
        self.assertEqual(resolve("Tambahkan Prau 100g").action["variant_weight"], 100)

    def test_05_uses_phase_2b_selected_variant(self):
        result = resolve("Tambahkan yang kedua", self.history)
        self.assertEqual(result.action["variant_weight"], 100)

    def test_06_ambiguous_variant_needs_clarification(self):
        result = resolve("Tambahkan Prau")
        self.assertIsNone(result.action)
        self.assertIn("beberapa varian", result.reply)

    def test_07_ambiguous_product_needs_clarification(self):
        result = resolve("Masukkan kopi ke keranjang")
        self.assertIsNone(result.action)
        self.assertIn("belum jelas", result.reply)

    def test_08_unknown_or_unpublished_product_is_not_actionable(self):
        self.assertIsNone(resolve("Tambahkan Produk Tidak Aktif 100g").action)

    def test_09_invalid_product_slug_cannot_be_proposed(self):
        self.assertIsNone(resolve("Tambahkan ../../admin 100g").action)

    def test_10_invalid_variant_is_rejected(self):
        self.assertIsNone(resolve("Tambahkan Prau 250g").action)

    def test_11_zero_quantity_is_rejected(self):
        self.assertIsNone(resolve("Tambahkan 0 bungkus Prau 100g").action)

    def test_12_negative_quantity_is_rejected(self):
        self.assertIsNone(resolve("Tambahkan -2 bungkus Prau 100g").action)

    def test_13_excessive_quantity_is_rejected(self):
        self.assertIsNone(resolve(f"Tambahkan {MAX_CART_QUANTITY + 1} bungkus Prau 100g").action)

    def test_14_price_manipulation_is_rejected(self):
        self.assertIsNone(resolve("Tambahkan Prau 100g harga Rp1").action)

    def test_15_same_request_has_stable_action_id(self):
        first = resolve("Tambahkan Prau 100g", request_id="retry-request")
        second = resolve("Tambahkan Prau 100g", request_id="retry-request")
        self.assertEqual(first.action["action_id"], second.action["action_id"])

    def test_16_new_request_has_new_action_id(self):
        first = resolve("Tambahkan Prau 100g", request_id="request-one")
        second = resolve("Tambahkan Prau 100g", request_id="request-two")
        self.assertNotEqual(first.action["action_id"], second.action["action_id"])

    def test_17_view_contextual_product(self):
        self.assertEqual(resolve("Buka detail yang kedua", self.history).action["type"], "view_product")

    def test_18_open_brewing_guidance(self):
        self.assertEqual(resolve("Buka Brewing Guidance").action["path"], "/coffee-lab/brewing-guidance")

    def test_19_external_navigation_is_rejected(self):
        self.assertIsNone(resolve("Buka https://example.com").action)

    def test_20_checkout_is_not_an_action(self):
        self.assertIsNone(resolve("Buka checkout").action)

    def test_21_context_is_not_reset_by_action(self):
        state = derive_conversation_state(self.history, "Masukkan yang kedua", PRODUCTS)
        self.assertEqual(state.referenced_product_slugs, ["buntu-natural"])

    def test_22_coffee_question_does_not_propose_action(self):
        self.assertFalse(resolve("Kopi fruity untuk V60").handled)

    def test_23_off_topic_does_not_propose_action(self):
        self.assertFalse(resolve("Berita teknologi terbaru").handled)

    def test_24_action_has_no_price_field(self):
        self.assertNotIn("price", resolve("Tambahkan Prau 100g").action)

    def test_25_rag_response_keeps_action_contract(self):
        passed = GuardrailDecision(True, "passed_nemo")
        with (
            patch("app.rag_service.PUBLISHED_COFFEE_KNOWLEDGE_BASE", PRODUCTS),
            patch("app.rag_service._active_catalog_products", return_value=PRODUCTS),
            patch.object(guardrail_service, "check_input", return_value=passed),
            patch.object(guardrail_service, "check_output", return_value=passed),
        ):
            response = rag_service.generate_barista_response(
                "Tambahkan Prau 100g", request_id="integration-request"
            )
        validated = ChatResponse.model_validate(response)
        self.assertEqual(validated.actions[0].type, "add_to_cart")
        self.assertEqual(validated.actions[0].variant_weight, 100)
