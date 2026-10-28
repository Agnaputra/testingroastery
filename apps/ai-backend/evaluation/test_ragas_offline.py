"""Offline contract smoke for RAGAS 0.4.3; synthetic scores are not research data."""
import asyncio
import json
import os
import tempfile
import unittest
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import AsyncMock, Mock, patch

os.environ["RAGAS_DO_NOT_TRACK"] = "true"

from ragas.embeddings.base import BaseRagasEmbedding
from ragas.embeddings import OpenAIEmbeddings
from ragas.llms.base import InstructorBaseRagasLLM
from ragas.llms import llm_factory
from openai import AsyncOpenAI
from ragas.metrics.collections import (
    AnswerRelevancy, ContextPrecisionWithReference, ContextRecall, Faithfulness,
)

from evaluation.run_ragas import metric_inputs_for_fixture, score_metrics
from evaluation import run_ragas


class OfflineLLM(InstructorBaseRagasLLM):
    def __init__(self):
        self.calls = []

    def generate(self, prompt, response_model):
        raise AssertionError("Only async evaluator calls are expected")

    async def agenerate(self, prompt, response_model):
        self.calls.append(response_model.__name__)
        name = response_model.__name__
        if name == "StatementGeneratorOutput":
            return response_model(statements=["Kopi sintetis ini bercita rasa cokelat."])
        if name == "NLIStatementOutput":
            return response_model(statements=[{
                "statement": "Kopi sintetis ini bercita rasa cokelat.",
                "reason": "Ada pada konteks sintetis.", "verdict": 1,
            }])
        if name == "AnswerRelevanceOutput":
            return response_model(question="Bagaimana rasa kopi sintetis?", noncommittal=0)
        if name == "ContextPrecisionOutput":
            return response_model(reason="Konteks sintetis relevan.", verdict=1)
        if name == "ContextRecallOutput":
            return response_model(classifications=[{
                "statement": "Kopi sintetis bercita rasa cokelat.",
                "reason": "Ada pada konteks sintetis.", "attributed": 1,
            }])
        raise AssertionError(name)


class OfflineEmbeddings(BaseRagasEmbedding):
    def embed_text(self, text, **kwargs):
        return [1.0, 0.0]

    async def aembed_text(self, text, **kwargs):
        return [1.0, 0.0]


class RagasOfflineSmoke(unittest.TestCase):
    def test_runner_excludes_non_pgvector_or_non_openai_without_scoring(self):
        class FakeTrace:
            def __init__(self, retrieval_source, response_source):
                self.retrieval_source = retrieval_source
                self.response_source = response_source

            def require_complete(self):
                return {
                    "fixture_id": "synthetic", "answer": "Jawaban sintetis.",
                    "knowledge_base_version": "pgvector:test", "context_texts": [],
                    "context_ids": [], "catalog_context": "", "catalog_context_sent": False,
                    "retrieval_source": self.retrieval_source,
                    "response_source": self.response_source, "fallback_status": "none",
                    "evaluation_request_id": "synthetic-request", "timestamp_utc": "2026-10-17T00:00:00Z",
                    "code_revision": "synthetic-revision", "generation_model": "synthetic-model",
                }

        with tempfile.TemporaryDirectory() as directory:
            fixture_path = Path(directory) / "fixture.json"
            fixture_path.write_text(json.dumps([{"id": "synthetic", "question": "Pertanyaan sintetis"}]), encoding="utf-8")
            for retrieval_source, response_source in (("in_memory", "openai"), ("pgvector", "local_fallback")):
                metric = Mock(ascore=AsyncMock())

                @contextmanager
                def fake_capture(*args, **kwargs):
                    yield FakeTrace(retrieval_source, response_source)

                with (
                    patch.object(run_ragas, "enabled", return_value=True),
                    patch.object(run_ragas.settings, "OPENAI_API_KEY", "synthetic-no-network"),
                    patch.object(run_ragas.rag_service, "retrieval_status", return_value={"runtime": "pgvector"}),
                    patch.object(run_ragas.rag_service, "generate_barista_response", return_value={"reply": "Jawaban sintetis."}) as generate,
                    patch.object(run_ragas, "knowledge_base_version", return_value="pgvector:test"),
                    patch.object(run_ragas, "FIXTURES_PATH", fixture_path),
                    patch.object(run_ragas, "capture", side_effect=fake_capture),
                    patch.object(run_ragas, "AsyncOpenAI", return_value=Mock()),
                    patch("ragas.llms.llm_factory", return_value=Mock()),
                    patch("ragas.embeddings.OpenAIEmbeddings", return_value=Mock()),
                    patch("ragas.metrics.collections.Faithfulness", return_value=metric),
                    patch("ragas.metrics.collections.AnswerRelevancy", return_value=metric),
                    patch("ragas.metrics.collections.ContextPrecisionWithReference", return_value=metric),
                    patch("ragas.metrics.collections.ContextRecall", return_value=metric),
                ):
                    with self.assertRaisesRegex(RuntimeError, "Tidak ada fixture pgvector"):
                        asyncio.run(run_ragas.main())
                generate.assert_called_once()
                metric.ascore.assert_not_called()

    def test_runner_evaluator_constructors_without_network(self):
        client = AsyncOpenAI(api_key="synthetic-no-network")
        llm = llm_factory("gpt-4.1-mini", client=client, max_tokens=2048)
        embeddings = OpenAIEmbeddings(client=client, model="text-embedding-3-small")
        self.assertIsInstance(Faithfulness(llm=llm), Faithfulness)
        self.assertIsInstance(AnswerRelevancy(llm=llm, embeddings=embeddings), AnswerRelevancy)
        self.assertIsInstance(ContextPrecisionWithReference(llm=llm), ContextPrecisionWithReference)
        self.assertIsInstance(ContextRecall(llm=llm), ContextRecall)

    def test_four_real_metric_implementations_with_synthetic_evaluator(self):
        llm = OfflineLLM()
        metrics = {
            "faithfulness": Faithfulness(llm=llm),
            "answer_relevancy": AnswerRelevancy(llm=llm, embeddings=OfflineEmbeddings()),
            "context_precision": ContextPrecisionWithReference(llm=llm),
            "context_recall": ContextRecall(llm=llm),
        }
        contexts = [
            "Kopi sintetis ini bercita rasa cokelat.",
            "Kopi sintetis ini cocok untuk seduh manual.",
        ]
        trace = {"answer": "Kopi sintetis ini bercita rasa cokelat.", "context_texts": contexts}
        fixture = {"question": "Bagaimana rasa kopi sintetis?", "reference": trace["answer"]}
        inputs = metric_inputs_for_fixture(fixture, trace)
        scores, errors = asyncio.run(score_metrics(metrics, inputs))
        self.assertFalse(errors)
        for score in scores.values():
            self.assertAlmostEqual(score, 1.0)
        self.assertIs(inputs["faithfulness"]["retrieved_contexts"], contexts)
        self.assertIs(inputs["context_recall"]["retrieved_contexts"], contexts)
        self.assertEqual(len(llm.calls), 8)  # 2 + 3 + 2 contexts + 1


if __name__ == "__main__":
    unittest.main()
