import asyncio
import json
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Barrier
from unittest.mock import Mock, patch

import httpx

from app.guardrail_service import GuardrailDecision, guardrail_service
from app.main import app, chat_with_barista
from app.models import ChatRequest
from app.rag_service import PUBLISHED_COFFEE_KNOWLEDGE_BASE, rag_service
from evaluation import trace as evaluation_trace
from evaluation.run_ragas import metric_inputs_for_fixture, score_metrics


QUESTION = "Saya ingin kopi filter yang fruity dan wangi melati untuk V60."


class EvaluationTraceTest(unittest.TestCase):
    def test_metric_scores_preserve_missing_and_errors(self) -> None:
        class Metric:
            def __init__(self, value=None, error=None):
                self.value = value
                self.error = error

            async def ascore(self, **kwargs):
                if self.error:
                    raise self.error
                return Mock(value=self.value)

        metrics = {
            "faithfulness": Metric(.75),
            "answer_relevancy": Metric(float("nan")),
            "context_precision": Metric(error=RuntimeError("synthetic evaluator failure")),
            "context_recall": Metric(1.0),
        }
        inputs = {name: {} for name in metrics}
        scores, errors = asyncio.run(score_metrics(metrics, inputs))
        self.assertEqual(scores, {
            "faithfulness": .75, "answer_relevancy": None,
            "context_precision": None, "context_recall": 1.0,
        })
        self.assertEqual(errors, {
            "answer_relevancy": "ValueError", "context_precision": "RuntimeError",
        })

    def test_context_is_exact_payload_and_ordered_without_extra_retrieval(self) -> None:
        products = PUBLISHED_COFFEE_KNOWLEDGE_BASE[:2]
        payloads = []

        def openai_post(url, **kwargs):
            payloads.append(kwargs["json"])
            answer = {
                "intent": "product_recommendation", "reply": "Dua pilihan kopi floral dan fruity.",
                "recommendedProductSlugs": [], "needsClarification": False,
                "clarifyingQuestion": None, "safetyNote": None, "followUpSuggestions": [],
            }
            return Mock(status_code=200, json=lambda: {
                "output": [{"content": [{"type": "output_text", "text": json.dumps(answer)}]}]
            })

        with (
            tempfile.TemporaryDirectory() as directory,
            patch.object(evaluation_trace.settings, "EVALUATION_TRACE_ENABLED", True),
            patch.object(evaluation_trace.settings, "ENVIRONMENT", "test"),
            patch.object(evaluation_trace, "TRACE_PATH", Path(directory) / "traces.jsonl"),
            patch.object(evaluation_trace, "knowledge_base_version", return_value="pgvector:test"),
            patch.object(evaluation_trace, "code_revision", return_value="test-revision"),
            patch.object(rag_service, "_search_pgvector", return_value=[(products[0], .9), (products[1], .8)]) as vector,
            patch.object(rag_service, "_search_in_memory") as memory,
            patch.object(guardrail_service, "check_input", return_value=GuardrailDecision(True, "passed_nemo")),
            patch.object(guardrail_service, "check_output", return_value=GuardrailDecision(True, "passed_nemo")),
            patch("app.rag_service.httpx.post", side_effect=openai_post),
        ):
            with evaluation_trace.capture(QUESTION) as active:
                response = rag_service.generate_barista_response(QUESTION)
            self.assertIsNotNone(active)
            data = active.require_complete()
            written = json.loads((Path(directory) / "traces.jsonl").read_text(encoding="utf-8"))

        vector.assert_called_once()
        memory.assert_not_called()
        self.assertEqual(len(payloads), 1)
        self.assertEqual(data, written)
        self.assertEqual(data["answer"], response["reply"])
        self.assertEqual(data["retrieval_source"], "pgvector")
        self.assertEqual(data["response_source"], "openai")
        self.assertEqual(data["context_ids"][:2], [product["slug"] for product in products])
        self.assertEqual(len(data["context_ids"]), len(data["context_texts"]))
        self.assertEqual(data["catalog_context"], "\n---\n".join(data["context_texts"]))
        user_content = payloads[0]["input"][-1]["content"]
        self.assertEqual(data["catalog_context"], user_content.split("<catalog_context>\n", 1)[1].split("\n</catalog_context>", 1)[0])
        metric_inputs = metric_inputs_for_fixture({"question": QUESTION, "reference": "Jawaban rujukan sintetis"}, data)
        self.assertIs(metric_inputs["faithfulness"]["retrieved_contexts"], data["context_texts"])
        self.assertIs(metric_inputs["context_recall"]["retrieved_contexts"], data["context_texts"])

    def test_trace_is_off_by_default_and_for_unapproved_query(self) -> None:
        with (
            tempfile.TemporaryDirectory() as directory,
            patch.object(evaluation_trace, "TRACE_PATH", Path(directory) / "traces.jsonl"),
            patch.object(evaluation_trace.settings, "EVALUATION_TRACE_ENABLED", False),
        ):
            with evaluation_trace.capture(QUESTION) as active:
                self.assertIsNone(active)
            self.assertFalse(evaluation_trace.TRACE_PATH.exists())
        with (
            patch.object(evaluation_trace.settings, "EVALUATION_TRACE_ENABLED", True),
            patch.object(evaluation_trace.settings, "ENVIRONMENT", "production"),
        ):
            self.assertFalse(evaluation_trace.enabled())
        with (
            patch.object(evaluation_trace.settings, "EVALUATION_TRACE_ENABLED", True),
            patch.object(evaluation_trace.settings, "ENVIRONMENT", "test"),
            patch.dict("os.environ", {"VERCEL_ENV": "production"}),
        ):
            self.assertFalse(evaluation_trace.enabled())
        with (
            patch.object(evaluation_trace.settings, "EVALUATION_TRACE_ENABLED", True),
            patch.object(evaluation_trace.settings, "ENVIRONMENT", "test"),
        ):
            self.assertIsNone(evaluation_trace.fixture_id_for("Nomor saya 081234567890"))

    def test_concurrent_requests_do_not_mix_traces_and_write_failure_is_isolated(self) -> None:
        questions = ["Pertanyaan sintetis A", "Pertanyaan sintetis B"]
        barrier = Barrier(2)

        def run(query):
            with evaluation_trace.capture(query) as active:
                if query in questions:
                    barrier.wait(timeout=5)
                evaluation_trace.record(retrieval_source=query)
                active.finish({"intent": "off_topic", "reply": query, "responseSource": "deterministic", "grounding": "none", "guardrailStatus": "passed_nemo"})
            return active

        with (
            tempfile.TemporaryDirectory() as directory,
            patch.object(evaluation_trace.settings, "EVALUATION_TRACE_ENABLED", True),
            patch.object(evaluation_trace.settings, "ENVIRONMENT", "test"),
            patch.object(evaluation_trace, "fixture_id_for", side_effect=lambda query: query),
            patch.object(evaluation_trace, "knowledge_base_version", return_value="pgvector:test"),
            patch.object(evaluation_trace, "code_revision", return_value="test-revision"),
            patch.object(evaluation_trace, "TRACE_PATH", Path(directory) / "traces.jsonl"),
        ):
            with ThreadPoolExecutor(max_workers=2) as pool:
                traces = list(pool.map(run, questions))
            for active in traces:
                data = active.require_complete()
                self.assertEqual(data["query"], data["answer"])
                self.assertEqual(data["query"], data["retrieval_source"])
            self.assertEqual(len({active.data["evaluation_request_id"] for active in traces}), 2)
            with patch.object(evaluation_trace, "TRACE_PATH", Path(directory)):
                failed = run("Pertanyaan sintetis C")
                self.assertEqual(failed.data["answer"], "Pertanyaan sintetis C")
                with self.assertRaises(RuntimeError):
                    failed.require_complete()
            private = run("Hubungi 081234567890")
            self.assertEqual(private.write_error, "privacy_filter")
            with self.assertRaises(RuntimeError):
                private.require_complete()

    def test_fastapi_thread_keeps_same_trace_and_response(self) -> None:
        with (
            tempfile.TemporaryDirectory() as directory,
            patch.object(evaluation_trace.settings, "EVALUATION_TRACE_ENABLED", True),
            patch.object(evaluation_trace.settings, "ENVIRONMENT", "test"),
            patch.object(evaluation_trace, "TRACE_PATH", Path(directory) / "traces.jsonl"),
            patch.object(evaluation_trace, "knowledge_base_version", return_value="pgvector:test"),
            patch.object(evaluation_trace, "code_revision", return_value="test-revision"),
            patch.object(rag_service, "generate_barista_response") as generate,
        ):
            def response(*args, **kwargs):
                evaluation_trace.record(retrieval_source="pgvector")
                active = evaluation_trace.current_trace()
                result = {"reply": "Jawaban sintetis", "intent": "catalog_query", "grounding": "catalog", "responseSource": "deterministic", "guardrailStatus": "passed_nemo"}
                active.finish(result)
                return result

            generate.side_effect = response
            result = asyncio.run(chat_with_barista(ChatRequest(message=QUESTION)))
            stored = json.loads((Path(directory) / "traces.jsonl").read_text(encoding="utf-8"))
        self.assertEqual(result["reply"], "Jawaban sintetis")
        self.assertEqual(stored["answer"], result["reply"])
        self.assertEqual(stored["retrieval_source"], "pgvector")

    def test_http_response_is_unchanged_and_trace_is_server_side(self) -> None:
        response_data = {"reply": "Jawaban sintetis", "intent": "catalog_query", "grounding": "catalog", "responseSource": "deterministic", "guardrailStatus": "passed_nemo"}

        def generate(*args, **kwargs):
            active = evaluation_trace.current_trace()
            active.finish(response_data)
            return response_data

        async def request():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                return await client.post("/api/chat", json={"message": QUESTION})

        with (
            tempfile.TemporaryDirectory() as directory,
            patch.object(evaluation_trace.settings, "EVALUATION_TRACE_ENABLED", True),
            patch.object(evaluation_trace.settings, "ENVIRONMENT", "test"),
            patch.object(evaluation_trace, "TRACE_PATH", Path(directory) / "traces.jsonl"),
            patch.object(evaluation_trace, "knowledge_base_version", return_value="pgvector:test"),
            patch.object(evaluation_trace, "code_revision", return_value="test-revision"),
            patch.object(rag_service, "generate_barista_response", side_effect=generate),
        ):
            result = asyncio.run(request())
            stored = json.loads((Path(directory) / "traces.jsonl").read_text(encoding="utf-8"))
            with patch.object(evaluation_trace, "TRACE_PATH", Path(directory)):
                failed_write_response = asyncio.run(request())
        self.assertEqual(result.status_code, 200)
        self.assertEqual(failed_write_response.status_code, 200)
        self.assertEqual(failed_write_response.json(), result.json())
        self.assertEqual(result.json()["reply"], stored["answer"])
        self.assertNotIn("evaluation_request_id", result.json())

    def test_retrieval_fallback_and_deterministic_routes_are_distinct(self) -> None:
        product = PUBLISHED_COFFEE_KNOWLEDGE_BASE[0]
        with (
            tempfile.TemporaryDirectory() as directory,
            patch.object(evaluation_trace.settings, "EVALUATION_TRACE_ENABLED", True),
            patch.object(evaluation_trace.settings, "ENVIRONMENT", "test"),
            patch.object(evaluation_trace, "TRACE_PATH", Path(directory) / "traces.jsonl"),
            patch.object(evaluation_trace, "fixture_id_for", side_effect=lambda query: query),
            patch.object(evaluation_trace, "knowledge_base_version", return_value="pgvector:test"),
            patch.object(evaluation_trace, "code_revision", return_value="test-revision"),
            patch.object(rag_service, "_search_pgvector", return_value=[]),
            patch.object(rag_service, "_search_in_memory", return_value=[(product, .5)]),
            patch.object(guardrail_service, "check_input", return_value=GuardrailDecision(True, "passed_nemo")),
            patch.object(guardrail_service, "check_output", return_value=GuardrailDecision(True, "passed_nemo")),
            patch("app.rag_service.httpx.post", side_effect=httpx.ConnectError("synthetic failure")),
        ):
            with evaluation_trace.capture(QUESTION) as active:
                response = rag_service.generate_barista_response(QUESTION)
            fallback = active.require_complete()
            with evaluation_trace.capture("apa yang paling best seller") as active:
                sales = rag_service.generate_barista_response("apa yang paling best seller")
            deterministic = active.require_complete()
        self.assertEqual(response["responseSource"], "local_fallback")
        self.assertEqual(fallback["retrieval_source"], "in_memory")
        self.assertEqual(fallback["fallback_status"], "used")
        self.assertEqual(sales["responseSource"], "deterministic")
        self.assertEqual(deterministic["retrieval_source"], "none")
        self.assertEqual(deterministic["output_guardrail"]["status"], "not_executed")

    def test_in_memory_openai_and_web_search_have_separate_routes(self) -> None:
        product = PUBLISHED_COFFEE_KNOWLEDGE_BASE[0]
        answer = {
            "intent": "product_recommendation", "reply": "Coba kopi yang fruity.",
            "recommendedProductSlugs": [], "needsClarification": False,
            "clarifyingQuestion": None, "safetyNote": None, "followUpSuggestions": [],
        }

        def post(url, **kwargs):
            if kwargs["json"].get("tools"):
                return Mock(json=lambda: {"output": [{"content": [{"type": "output_text", "text": "Proses natural mengeringkan ceri utuh."}]}]}, raise_for_status=lambda: None)
            return Mock(json=lambda: {"output": [{"content": [{"type": "output_text", "text": json.dumps(answer)}]}]}, raise_for_status=lambda: None)

        with (
            tempfile.TemporaryDirectory() as directory,
            patch.object(evaluation_trace.settings, "EVALUATION_TRACE_ENABLED", True),
            patch.object(evaluation_trace.settings, "ENVIRONMENT", "test"),
            patch.object(evaluation_trace, "TRACE_PATH", Path(directory) / "traces.jsonl"),
            patch.object(evaluation_trace, "fixture_id_for", side_effect=lambda query: query),
            patch.object(evaluation_trace, "knowledge_base_version", return_value="pgvector:test"),
            patch.object(evaluation_trace, "code_revision", return_value="test-revision"),
            patch.object(rag_service, "_search_pgvector", return_value=[]),
            patch.object(rag_service, "_search_in_memory", return_value=[(product, .5)]),
            patch.object(guardrail_service, "check_input", return_value=GuardrailDecision(True, "passed_nemo")),
            patch.object(guardrail_service, "check_output", return_value=GuardrailDecision(True, "passed_nemo")),
            patch("app.rag_service.httpx.post", side_effect=post),
        ):
            with evaluation_trace.capture(QUESTION) as active:
                rag_service.generate_barista_response(QUESTION)
            catalog = active.require_complete()
            with evaluation_trace.capture("Jelaskan proses natural pada kopi") as active:
                rag_service.generate_barista_response("Jelaskan proses natural pada kopi")
            web = active.require_complete()
        self.assertEqual((catalog["retrieval_source"], catalog["response_source"]), ("in_memory", "openai"))
        self.assertEqual(web["retrieval_source"], "web_search")
        self.assertEqual(web["catalog_context"], "")
        self.assertFalse(web["catalog_context_sent"])

    def test_trace_does_not_change_deterministic_response(self) -> None:
        question = "apa yang paling best seller"
        with (
            tempfile.TemporaryDirectory() as directory,
            patch.object(evaluation_trace, "TRACE_PATH", Path(directory) / "traces.jsonl"),
            patch.object(evaluation_trace, "fixture_id_for", return_value="synthetic-sales"),
            patch.object(evaluation_trace, "knowledge_base_version", return_value="pgvector:test"),
            patch.object(evaluation_trace, "code_revision", return_value="test-revision"),
            patch.object(guardrail_service, "check_input", return_value=GuardrailDecision(True, "passed_nemo")),
        ):
            without_trace = rag_service.generate_barista_response(question)
            with evaluation_trace.capture(question) as active:
                with_trace = rag_service.generate_barista_response(question)
            active.require_complete()
        self.assertEqual(without_trace, with_trace)


if __name__ == "__main__":
    unittest.main()
