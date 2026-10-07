import unittest

from .rag_service import is_supported_question, is_website_feature_question


class ScopeTest(unittest.TestCase):
    def test_catalog_and_feature_queries_are_allowed(self) -> None:
        self.assertTrue(is_supported_question("Kopi floral untuk V60 apa yang tersedia?"))
        self.assertTrue(is_supported_question("Bagaimana memakai fitur Brewing Guidance?"))
        self.assertTrue(is_website_feature_question("Bagaimana memakai fitur Brewing Guidance?"))
        self.assertFalse(is_website_feature_question("Produk floral untuk V60 apa yang tersedia?"))

    def test_medical_and_general_queries_are_rejected(self) -> None:
        self.assertFalse(is_supported_question("Apa itu maag?"))
        self.assertFalse(is_supported_question("Apa itu leukemia?"))
        self.assertFalse(is_website_feature_question("Kopi floral untuk V60 apa yang tersedia?"))


if __name__ == "__main__":
    unittest.main()
