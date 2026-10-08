import unittest

from .publication_service import apply_publication_overrides
from .chat_router import route_chat_intent
from .guardrail_service import NemoGuardrailService
from .rag_service import RAGService, is_contextual_followup, is_supported_question, is_website_feature_question


class ScopeTest(unittest.TestCase):
    def test_catalog_and_feature_queries_are_allowed(self) -> None:
        self.assertTrue(is_supported_question("Kopi floral untuk V60 apa yang tersedia?"))
        self.assertTrue(is_supported_question("Bagaimana memakai fitur Brewing Guidance?"))
        self.assertTrue(is_website_feature_question("Bagaimana memakai fitur Brewing Guidance?"))
        self.assertFalse(is_website_feature_question("Produk floral untuk V60 apa yang tersedia?"))
        self.assertTrue(is_supported_question("Prau Natural El Davisio Double Mosto"))
        self.assertTrue(is_supported_question("buntu lenta"))
        self.assertTrue(is_supported_question("apa saja produk yang ada disini?"))

    def test_router_keeps_web_search_inside_coffee_domain(self) -> None:
        self.assertEqual(route_chat_intent("Pink Bourbon itu apa?"), "coffee_knowledge")
        self.assertEqual(route_chat_intent("Kenapa natural process lebih fruity?"), "coffee_knowledge")
        self.assertEqual(route_chat_intent("Apa berita teknologi terbaru?"), "off_topic")
        self.assertEqual(route_chat_intent("Siapa presiden Indonesia?"), "off_topic")
        self.assertEqual(route_chat_intent("Bagaimana process scheduler Linux?"), "off_topic")
        self.assertEqual(route_chat_intent("Apa itu natural language processing?"), "off_topic")
        self.assertFalse(is_website_feature_question("Kopi floral untuk V60 apa yang tersedia?"))

    def test_router_distinguishes_catalog_feature_and_action(self) -> None:
        self.assertEqual(route_chat_intent("Jelaskan Prau Natural", catalog_match=True), "catalog_query")
        self.assertEqual(route_chat_intent("Bantu pilih kopi fruity untuk V60"), "product_recommendation")
        self.assertEqual(route_chat_intent("Jelaskan Brewing Guidance"), "website_feature")
        self.assertEqual(route_chat_intent("Tambahkan produk ini ke keranjang", has_coffee_context=True), "website_action")

    def test_conversation_and_followups_are_allowed_without_opening_general_scope(self) -> None:
        history = [{"role": "user", "content": "Rekomendasikan kopi fruity untuk V60"}]
        self.assertTrue(is_supported_question("hello"))
        self.assertTrue(is_supported_question("halo kak"))
        self.assertTrue(is_supported_question("makasih"))
        self.assertTrue(is_contextual_followup("yang kedua lebih murah?", history))
        self.assertTrue(is_supported_question("yang kedua lebih murah?", history))
        self.assertTrue(is_supported_question("apa?", history))
        self.assertTrue(is_supported_question("kok bgini jawabannya", history))
        self.assertEqual(route_chat_intent("siapa penemu telepon?", has_coffee_context=True), "off_topic")

    def test_structured_response_keeps_retrieval_and_cards_separate(self) -> None:
        response = RAGService._response(
            "Penjelasan kopi.",
            "coffee_knowledge",
            "coffee_web",
            sources=[{"title": "SCA", "url": "https://sca.coffee"}],
        )
        self.assertEqual(response["recommendedProductSlugs"], [])
        self.assertEqual(response["recommendedProducts"], [])
        self.assertEqual(response["grounding"], "coffee_web")

    def test_web_citations_are_extracted_and_internal_markers_removed(self) -> None:
        reply, sources = RAGService._extract_response({"output": [{"content": [{
            "type": "output_text",
            "text": "Jawaban. \ue200cite\ue202turn0search0\ue201",
            "annotations": [{"type": "url_citation", "url": "https://example.com", "title": "Example"}],
        }]}]})
        self.assertEqual(reply, "Jawaban.")
        self.assertEqual(sources, [{"title": "Example", "url": "https://example.com"}])

    def test_publication_overrides_only_hide_explicitly_disabled_products(self) -> None:
        products = [{"slug": "prau-natural"}, {"slug": "buntu-lenta"}]
        self.assertEqual(
            apply_publication_overrides(products, {"prau-natural": False}),
            [{"slug": "buntu-lenta"}],
        )

    def test_successful_nemo_check_clears_transient_error(self) -> None:
        class PassingRails:
            @staticmethod
            def check(*, messages):
                return {"passed": True}

        service = NemoGuardrailService()
        service._initialised = True
        service._rails = PassingRails()
        service._error = "LLMCallException"
        self.assertTrue(service._check({"role": "user", "content": "Halo"}))
        self.assertIsNone(service._error)

    def test_checkout_feature_uses_existing_route(self) -> None:
        reply = RAGService._feature_fallback("checkout")
        self.assertIn("/checkout", reply)
        self.assertNotIn("/cart", reply)


if __name__ == "__main__":
    unittest.main()
