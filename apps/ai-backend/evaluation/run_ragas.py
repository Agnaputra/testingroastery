"""Run reproducible RAGAS evaluation against the live pgvector retrieval path.

Usage (from apps/ai-backend):
    python -m evaluation.run_ragas
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import math
import os
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path

from openai import AsyncOpenAI
from app.config import settings
from app.rag_service import rag_service
from evaluation.trace import FIXTURES_PATH, capture, enabled, knowledge_base_version


ROOT = Path(__file__).parent
RESULTS_DIR = ROOT / "results"


def metric_inputs_for_fixture(fixture: dict, trace: dict) -> dict:
    contexts = trace["context_texts"]
    return {
        "faithfulness": {
            "user_input": fixture["question"],
            "response": trace["answer"],
            "retrieved_contexts": contexts,
        },
        "answer_relevancy": {
            "user_input": fixture["question"],
            "response": trace["answer"],
        },
        "context_precision": {
            "user_input": fixture["question"],
            "reference": fixture["reference"],
            "retrieved_contexts": contexts,
        },
        "context_recall": {
            "user_input": fixture["question"],
            "reference": fixture["reference"],
            "retrieved_contexts": contexts,
        },
    }


async def score_metrics(metrics: dict, metric_inputs: dict) -> tuple[dict, dict]:
    """Keep failed evaluator calls visible instead of treating them as zero."""
    scores = {}
    errors = {}
    for name, metric in metrics.items():
        try:
            result = await metric.ascore(**metric_inputs[name])
            value = float(result.value)
            lower_bound = -1 if name == "answer_relevancy" else 0
            if not math.isfinite(value) or not lower_bound <= value <= 1:
                raise ValueError("invalid_metric_value")
            scores[name] = value
        except Exception as error:
            scores[name] = None
            errors[name] = type(error).__name__
    return scores, errors


async def main() -> None:
    if not enabled():
        raise RuntimeError("Set EVALUATION_TRACE_ENABLED=true dan ENVIRONMENT=test pada runtime lokal.")
    os.environ["RAGAS_DO_NOT_TRACK"] = "true"
    from ragas.embeddings import OpenAIEmbeddings
    from ragas.llms import llm_factory
    from ragas.metrics.collections import AnswerRelevancy, ContextPrecisionWithReference, ContextRecall, Faithfulness
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY wajib diisi untuk RAGAS evaluator.")
    retrieval = rag_service.retrieval_status()
    if retrieval["runtime"] != "pgvector":
        raise RuntimeError("pgvector belum siap. Jalankan python -m app.seed_data sebelum evaluasi RAGAS.")

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    # Faithfulness returns structured statements and verdicts; RAGAS's default
    # completion budget can truncate those results for longer catalog answers.
    evaluator_llm = llm_factory(
        settings.RAGAS_EVALUATOR_MODEL,
        client=client,
        max_tokens=2048,
    )
    evaluator_embeddings = OpenAIEmbeddings(client=client, model=settings.OPENAI_EMBEDDING_MODEL)
    metrics = {
        "faithfulness": Faithfulness(llm=evaluator_llm),
        "answer_relevancy": AnswerRelevancy(llm=evaluator_llm, embeddings=evaluator_embeddings),
        "context_precision": ContextPrecisionWithReference(llm=evaluator_llm),
        "context_recall": ContextRecall(llm=evaluator_llm),
    }
    fixture_bytes = FIXTURES_PATH.read_bytes()
    fixtures = json.loads(fixture_bytes)
    kb_version_before = knowledge_base_version()
    if kb_version_before == "unavailable":
        raise RuntimeError("Snapshot knowledge base tidak dapat diverifikasi.")
    cases = []
    totals: dict[str, list[float]] = {name: [] for name in metrics}
    retrieval_precision: list[float] = []
    retrieval_recall: list[float] = []

    for fixture in fixtures:
        with capture(fixture["question"], kb_version=kb_version_before) as active_trace:
            response = rag_service.generate_barista_response(fixture["question"])
        if active_trace is None:
            raise RuntimeError(f"Fixture tidak diizinkan untuk trace: {fixture['id']}")
        trace = active_trace.require_complete()
        case_metadata = {
            "id": fixture["id"],
            "evaluation_request_id": trace["evaluation_request_id"],
            "timestamp_utc": trace["timestamp_utc"],
            "code_revision": trace["code_revision"],
            "knowledge_base_version": trace["knowledge_base_version"],
            "ragas_version": version("ragas"),
            "generation_model": trace["generation_model"],
            "evaluator_model": settings.RAGAS_EVALUATOR_MODEL,
            "embedding_model": settings.OPENAI_EMBEDDING_MODEL,
        }
        if trace["fixture_id"] != fixture["id"] or trace["answer"] != response["reply"]:
            raise RuntimeError(f"Trace tidak sesuai dengan respons fixture: {fixture['id']}")
        if trace["knowledge_base_version"] != kb_version_before:
            raise RuntimeError(f"Knowledge base berubah sebelum fixture: {fixture['id']}")
        contexts = trace["context_texts"]
        context_valid = (
            trace["catalog_context_sent"] and bool(contexts)
            and len(trace["context_ids"]) == len(contexts)
            and trace["catalog_context"] == "\n---\n".join(contexts)
        )
        if trace["retrieval_source"] == "pgvector" and trace["response_source"] == "openai" and not context_valid:
            raise RuntimeError(f"Context generation tidak lengkap untuk fixture: {fixture['id']}")
        included = (
            trace["retrieval_source"] == "pgvector"
            and trace["response_source"] == "openai"
            and context_valid
        )
        if not included:
            cases.append({
                **case_metadata,
                "included": False, "retrieval_source": trace["retrieval_source"],
                "response_source": trace["response_source"], "fallback_status": trace["fallback_status"],
                "exclusion_reason": "not_pgvector_openai_with_complete_context",
            })
            continue
        metric_inputs = metric_inputs_for_fixture(fixture, trace)
        scores, score_errors = await score_metrics(metrics, metric_inputs)
        for name, value in scores.items():
            if value is not None:
                totals[name].append(value)
        retrieved_slugs = trace["context_ids"]
        expected_slugs = set(fixture["expected_slugs"])
        hits = expected_slugs.intersection(retrieved_slugs)
        precision_at_k = len(hits) / len(retrieved_slugs) if retrieved_slugs else 0.0
        recall_at_k = len(hits) / len(expected_slugs) if expected_slugs else 0.0
        retrieval_precision.append(precision_at_k)
        retrieval_recall.append(recall_at_k)
        cases.append({
            **case_metadata, "question": fixture["question"], "expected_slugs": fixture["expected_slugs"],
            "retrieved_slugs": retrieved_slugs, "recommended_slugs": response["recommendedSlugs"],
            "evaluation_request_id": trace["evaluation_request_id"], "included": True,
            "context_hash": hashlib.sha256(trace["catalog_context"].encode("utf-8")).hexdigest(),
            "retrieval_precision_at_k": precision_at_k, "retrieval_recall_at_k": recall_at_k,
            "scores": scores, "score_errors": score_errors,
        })

    kb_version_after = knowledge_base_version()
    if kb_version_after != kb_version_before:
        raise RuntimeError("Knowledge base berubah selama evaluasi; hasil dibatalkan.")
    if not retrieval_precision:
        raise RuntimeError("Tidak ada fixture pgvector + OpenAI yang layak dinilai RAGAS.")
    RESULTS_DIR.mkdir(exist_ok=True)
    report = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "retrieval": retrieval,
        "evaluator_model": settings.RAGAS_EVALUATOR_MODEL,
        "embedding_model": settings.OPENAI_EMBEDDING_MODEL,
        "ragas_version": version("ragas"),
        "generation_model": settings.OPENAI_MODEL,
        "fixture_sha256": hashlib.sha256(fixture_bytes).hexdigest(),
        "knowledge_base_version": kb_version_before,
        "code_revision": active_trace.data["code_revision"],
        "code_version": active_trace.data["code_version"],
        "included_count": len(retrieval_precision),
        "excluded_count": len(cases) - len(retrieval_precision),
        "averages": {name: sum(values) / len(values) if values else None for name, values in totals.items()},
        "retrieval_averages": {
            "precision_at_k": sum(retrieval_precision) / len(retrieval_precision),
            "recall_at_k": sum(retrieval_recall) / len(retrieval_recall),
        },
        "cases": cases,
    }
    output = RESULTS_DIR / f"ragas-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report["averages"], ensure_ascii=False, indent=2))
    print(f"RAGAS report written to {output}")


if __name__ == "__main__":
    asyncio.run(main())
