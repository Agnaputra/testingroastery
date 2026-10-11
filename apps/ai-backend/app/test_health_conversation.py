import unittest
from unittest.mock import patch

from .conversation_state import derive_conversation_state
from .guardrail_service import GuardrailDecision, guardrail_service
from .rag_service import PUBLISHED_COFFEE_KNOWLEDGE_BASE, rag_service


class HealthConversationTest(unittest.TestCase):
    history = [{"role": "user", "content": "namun saya ada maag"}]

    def test_milk_replaces_espresso(self):
        history = [*self.history, {"role": "user", "content": "espresso"}]
        state = derive_conversation_state(history, "kalau coffee susu bagaimana?", PUBLISHED_COFFEE_KNOWLEDGE_BASE)
        self.assertEqual(state.brew_method, "Kopi Susu")
        with patch("app.rag_service.get_publication_overrides", return_value={}), patch.object(guardrail_service, "check_input", return_value=GuardrailDecision(True, "passed")), patch.object(rag_service, "_generate_coffee_knowledge_response") as web:
            result = rag_service.generate_barista_response("kalau coffee susu bagaimana?", history)
        web.assert_not_called()
        self.assertIn("tidak bisa memastikan", result["reply"])
        self.assertNotIn("espresso", result["reply"])
        self.assertTrue(result["safetyNote"])

    def test_unsafe_web_reply_is_replaced_without_products_or_sources(self):
        unsafe = rag_service._response("Susu menetralkan asam dan lebih baik untuk maag.", "coffee_knowledge", "coffee_web", response_source="openai", sources=[{"title": "test", "url": "https://example.com"}])
        with patch.object(rag_service, "_generate_barista_response", return_value=unsafe):
            result = rag_service.generate_barista_response("bagaimana dengan susu?", self.history)
        self.assertEqual(result["guardrailStatus"], "health_policy_fallback")
        self.assertEqual(result["sources"], [])
        self.assertEqual(result["recommendedProductSlugs"], [])

    def test_buttons_and_question_checked_even_when_reply_is_safe(self):
        reply = rag_service._response("Profilnya floral sesuai katalog.", "product_recommendation", "catalog", response_source="openai", follow_ups=["Tips espresso untuk maag", "Kopi susu yang nyaman untuk maag", "Lihat kemasan"], clarifying_question="Mau yang aman untuk lambung?")
        with patch.object(rag_service, "_generate_barista_response", return_value=reply):
            result = rag_service.generate_barista_response("yang floral", self.history)
        self.assertEqual(result["followUpSuggestions"], ["Lihat kemasan"])
        self.assertNotIn("lambung", result["clarifyingQuestion"])
        self.assertTrue(result["safetyNote"])

    def test_health_policy_does_not_affect_unrelated_conversation(self):
        reply = rag_service._response("Bahas acidity kopi?", "coffee_knowledge", "coffee_web", response_source="openai")
        with patch.object(rag_service, "_generate_barista_response", return_value=reply):
            result = rag_service.generate_barista_response("apa itu acidity?")
        self.assertIsNone(result["safetyNote"])


if __name__ == "__main__":
    unittest.main()
