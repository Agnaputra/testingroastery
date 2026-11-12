import json
import unittest
import psycopg2
from unittest.mock import Mock, patch

from .chat_router import route_chat_intent
from .guardrail_service import GuardrailDecision, guardrail_service
from .rag_service import PUBLISHED_COFFEE_KNOWLEDGE_BASE, rag_service


class CatalogConversationTest(unittest.TestCase):
    def test_fruity_recommendation_comparison_button_retains_all_three_products(self):
        passed = GuardrailDecision(True, 'passed_nemo')
        history = []
        with patch('app.rag_service.get_publication_overrides', return_value={}), \
                patch.object(guardrail_service, 'check_input', return_value=passed), \
                patch.object(guardrail_service, 'check_output', return_value=passed), \
                patch.object(rag_service, 'openai_api_key', ''), \
                patch.object(rag_service, '_classify_unrecognized_intent', return_value='off_topic') as classifier, \
                patch.object(rag_service, 'search_similar_products', return_value=[(p, 1.0) for p in PUBLISHED_COFFEE_KNOWLEDGE_BASE]):
            for question in ['Bantu saya memilih kopi sesuai selera', 'Manis fruity']:
                reply = rag_service.generate_barista_response(question, history)
                history.extend([{'role': 'user', 'content': question}, {'role': 'assistant', 'content': reply['reply'], 'intent': reply['intent'], 'grounding': reply['grounding'], 'recommendedProductSlugs': reply['recommendedProductSlugs']}])
            selected = reply['recommendedProductSlugs']
            self.assertEqual(len(selected), 3)
            compared = rag_service.generate_barista_response('Bandingkan pilihan ini', history)
            self.assertEqual(compared['intent'], 'product_comparison')
            self.assertEqual(set(compared['recommendedProductSlugs']), set(selected))
            self.assertEqual(compared['grounding'], 'catalog')
            for slug in selected:
                product = next(p for p in PUBLISHED_COFFEE_KNOWLEDGE_BASE if p['slug'] == slug)
                self.assertIn(product['name'], compared['reply'])
            history.extend([{'role': 'user', 'content': 'Bandingkan pilihan ini'}, {'role': 'assistant', 'content': compared['reply'], 'intent': compared['intent'], 'grounding': compared['grounding'], 'recommendedProductSlugs': compared['recommendedProductSlugs']}])
            v60 = rag_service.generate_barista_response('Mana yang cocok untuk V60?', history)
            self.assertEqual(v60['intent'], 'product_recommendation')
            self.assertNotEqual(v60['reply'], compared['reply'])
            history.extend([{'role': 'user', 'content': 'Mana yang cocok untuk V60?'}, {'role': 'assistant', 'content': v60['reply'], 'intent': v60['intent'], 'grounding': v60['grounding'], 'recommendedProductSlugs': v60['recommendedProductSlugs']}])
            repeated = rag_service.generate_barista_response('Mana yang cocok untuk V60?', history[-8:])
            self.assertEqual(repeated['intent'], 'product_recommendation')
            classifier.assert_not_called()

    def test_direct_questions(self):
        self.assertEqual(route_chat_intent('Mana yang cocok untuk V60?', has_coffee_context=True), 'product_recommendation')
        self.assertEqual(route_chat_intent("website apa ini?"), "website_feature")
        self.assertEqual(route_chat_intent("apa yang bisa saya beli di sini?"), "catalog_query")
        self.assertEqual(route_chat_intent("apa saja produknya?"), "catalog_query")
        self.assertEqual(route_chat_intent("aku suka fruity, budget 100 ribu"), "product_recommendation")

    def test_model_classifier_validates_enum_and_timeout(self):
        result = Mock()
        with patch.object(rag_service, "openai_api_key", "test"), patch("app.rag_service.httpx.post", return_value=result) as request:
            for candidate, expected in [("website_feature", "website_feature"), ("delete_database", "off_topic")]:
                result.json.return_value = {"output": [{"content": [{"type": "output_text", "text": json.dumps({"intent": candidate})}]}]}
                self.assertEqual(rag_service._classify_unrecognized_intent("ini tempat apaan?", []), expected)
            self.assertEqual(request.call_args.kwargs["timeout"], 5.0)
            self.assertFalse(request.call_args.kwargs["json"]["store"])

    def test_catalog_failure_still_blocks_model_classified_request(self):
        passed = GuardrailDecision(True, "passed_nemo")
        with patch("app.rag_service.get_publication_overrides", side_effect=psycopg2.OperationalError("offline")), patch.object(guardrail_service, "check_input", return_value=passed), patch.object(rag_service, "_classify_unrecognized_intent", return_value="catalog_query"):
            reply = rag_service.generate_barista_response("jualan apaan?")
        self.assertEqual(reply["guardrailStatus"], "catalog_authority_unavailable")
        self.assertEqual(reply["recommendedProductSlugs"], [])

    def test_requested_multiturn_conversation(self):
        passed = GuardrailDecision(True, "passed_nemo")
        history = []
        questions = ["hello", "website apa ini?", "apa yang bisa saya beli disini", "apa saja produknya?", "aku suka fruity, budget 100 ribu", "yang pertama tersedia kemasan berapa?", "tambahkan 100g ke keranjang"]
        expected = ["greeting", "website_feature", "catalog_query", "catalog_query", "product_recommendation", "catalog_query", "website_action"]
        with patch("app.rag_service.get_publication_overrides", return_value={}), patch.object(guardrail_service, "check_input", return_value=passed), patch.object(guardrail_service, "check_output", return_value=passed), patch.object(rag_service, "openai_api_key", ""), patch.object(rag_service, "search_similar_products", return_value=[(p, 1.0) for p in PUBLISHED_COFFEE_KNOWLEDGE_BASE]):
            for question, intent in zip(questions, expected):
                reply = rag_service.generate_barista_response(question, history[-8:], "test_sequence11")
                self.assertEqual(reply["intent"], intent, question)
                if question.startswith("apa"):
                    self.assertNotIn("Berdasarkan preferensimu", reply["reply"])
                    self.assertEqual(reply["responseSource"], "deterministic")
                history.extend([{"role": "user", "content": question}, {"role": "assistant", "content": reply["reply"], "intent": reply["intent"], "grounding": reply["grounding"], "recommendedProductSlugs": reply["recommendedProductSlugs"]}])
            self.assertEqual(reply["actions"][0]["type"], "add_to_cart")
            self.assertEqual(reply["actions"][0]["variant_weight"], 100)


if __name__ == "__main__":
    unittest.main()
