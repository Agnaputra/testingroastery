import unittest

from .rag_service import is_contextual_followup, is_supported_question, is_website_feature_question


class ScopeTest(unittest.TestCase):
    def test_catalog_and_feature_queries_are_allowed(self) -> None:
        self.assertTrue(is_supported_question("Kopi floral untuk V60 apa yang tersedia?"))
        self.assertTrue(is_supported_question("Bagaimana memakai fitur Brewing Guidance?"))
        self.assertTrue(is_website_feature_question("Bagaimana memakai fitur Brewing Guidance?"))
        self.assertFalse(is_website_feature_question("Produk floral untuk V60 apa yang tersedia?"))

    def test_medical_and_general_queries_are_rejected(self) -> None:
        self.assertFalse(is_supported_question("Apa itu maag?"))
        self.assertFalse(is_supported_question("Apa itu leukemia?"))
        self.assertFalse(is_supported_question("Siapa presiden Indonesia?"))
        self.assertFalse(is_website_feature_question("Kopi floral untuk V60 apa yang tersedia?"))

    def test_conversation_and_followups_are_allowed_without_opening_general_scope(self) -> None:
        history = [{"role": "user", "content": "Rekomendasikan kopi fruity untuk V60"}]
        self.assertTrue(is_supported_question("hello"))
        self.assertTrue(is_supported_question("halo kak"))
        self.assertTrue(is_supported_question("makasih"))
        self.assertTrue(is_contextual_followup("yang kedua lebih murah?", history))
        self.assertTrue(is_supported_question("yang kedua lebih murah?", history))
        self.assertFalse(is_supported_question("siapa penemu telepon?", history))


if __name__ == "__main__":
    unittest.main()
