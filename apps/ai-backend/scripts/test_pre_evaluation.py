import unittest

from scripts.run_pre_evaluation import verify_target, assess_smoke


class PreEvaluationTargetTest(unittest.TestCase):
    def test_smoke_rejects_budget_overflow_and_false_action_claims(self):
        cases = [{"id": identifier, "http_status": 200, "response": {}} for identifier in
                 ["BT01", "BT02", "BT05", "BT03", "BT03-supported", "BT04", "BT06", "BT07", "BT08"]]
        next(case for case in cases if case["id"] == "BT02")["response"] = {
            "recommendedProducts": [{"selectedVariant": {"price": 109_000}}]}
        checks = assess_smoke(cases)
        self.assertFalse(checks["BT02_all_selected_variants_within_budget"])
        self.assertFalse(checks["BT06_action_only_not_browser_execution"])

    def test_only_the_isolated_loopback_database_is_accepted(self):
        verify_target("postgresql://test:test@127.0.0.1:55434/testingroastery")
        for target in ["postgresql://prod.example.com/testingroastery",
                       "postgresql://127.0.0.1:5432/testingroastery",
                       "postgresql://127.0.0.1:55434/other_database", ""]:
            with self.subTest(target=target), self.assertRaises(RuntimeError):
                verify_target(target)


if __name__ == "__main__":
    unittest.main()
