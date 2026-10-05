"""Run reproducible RAGAS evaluation against the live pgvector retrieval path.

Usage (from apps/ai-backend):
    python -m evaluation.run_ragas
"""
from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path

from openai import AsyncOpenAI
from ragas.embeddings import OpenAIEmbeddings
from ragas.llms import llm_factory
from ragas.metrics.collections import AnswerRelevancy, ContextPrecisionWithReference, ContextRecall, Faithfulness

from app.config import settings
from app.rag_service import rag_service


ROOT = Path(__file__).parent
FIXTURES_PATH = ROOT / "fixtures.json"
RESULTS_DIR = ROOT / "results"


def _context(item: dict[str, object]) -> str:
    return (
        f"Kopi: {item['name']} | Slug: {item['slug']} | Origin: {item['origin']} | "
        f"Proses: {item['process']} | Tasting Notes: {', '.join(item['notes'])} | "
        f"Resep: {item['recipe']} | Deskripsi: {item['description']}"
    )


async def main() -> None:
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
    fixtures = json.loads(FIXTURES_PATH.read_text(encoding="utf-8"))
    cases = []
    totals: dict[str, list[float]] = {name: [] for name in metrics}
    retrieval_precision: list[float] = []
    retrieval_recall: list[float] = []

    for fixture in fixtures:
        retrieved = rag_service.search_similar_products(fixture["question"])
        contexts = [_context(item) for item, _ in retrieved]
        response = rag_service.generate_barista_response(fixture["question"])
        metric_inputs = {
            "faithfulness": {
                "user_input": fixture["question"],
                "response": response["reply"],
                "retrieved_contexts": contexts,
            },
            "answer_relevancy": {
                "user_input": fixture["question"],
                "response": response["reply"],
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
        scores = {}
        for name, metric in metrics.items():
            result = await metric.ascore(**metric_inputs[name])
            scores[name] = float(result.value)
            totals[name].append(scores[name])
        retrieved_slugs = [item["slug"] for item, _ in retrieved]
        expected_slugs = set(fixture["expected_slugs"])
        hits = expected_slugs.intersection(retrieved_slugs)
        precision_at_k = len(hits) / len(retrieved_slugs) if retrieved_slugs else 0.0
        recall_at_k = len(hits) / len(expected_slugs) if expected_slugs else 0.0
        retrieval_precision.append(precision_at_k)
        retrieval_recall.append(recall_at_k)
        cases.append({
            "id": fixture["id"], "question": fixture["question"], "expected_slugs": fixture["expected_slugs"],
            "retrieved_slugs": retrieved_slugs, "recommended_slugs": response["recommendedSlugs"],
            "retrieval_precision_at_k": precision_at_k, "retrieval_recall_at_k": recall_at_k, "scores": scores,
        })

    RESULTS_DIR.mkdir(exist_ok=True)
    report = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "retrieval": retrieval,
        "evaluator_model": settings.RAGAS_EVALUATOR_MODEL,
        "averages": {name: sum(values) / len(values) for name, values in totals.items()},
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
