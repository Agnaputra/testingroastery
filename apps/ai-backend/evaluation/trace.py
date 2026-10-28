"""Local, fixture-only traces for evaluating the actual chat generation request."""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import time
import uuid
from contextlib import contextmanager
from contextvars import ContextVar
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Iterator

import psycopg2

from app.config import settings


ROOT = Path(__file__).parent
FIXTURES_PATH = ROOT / "fixtures.json"
TRACE_PATH = ROOT / "results" / "evaluation-traces.jsonl"
_active_trace: ContextVar[EvaluationTrace | None] = ContextVar("evaluation_trace", default=None)
_write_lock = Lock()
_PRIVATE_PATTERN = re.compile(
    r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b(?:\+62|62|0)8\d{8,12}\b|"
    r"\b(?:OPENAI_API_KEY|DATABASE_URL|ADMIN_API_KEY)\s*[:=]|\b(?:sk-[A-Za-z0-9_-]{10,})\b",
    re.IGNORECASE,
)


def enabled() -> bool:
    return (
        settings.EVALUATION_TRACE_ENABLED
        and settings.ENVIRONMENT.lower() == "test"
        and not any(os.getenv(name) for name in ("VERCEL", "VERCEL_ENV", "RAILWAY_ENVIRONMENT", "K_SERVICE"))
    )


def fixture_id_for(query: str) -> str | None:
    if not enabled():
        return None
    try:
        fixtures = json.loads(FIXTURES_PATH.read_text(encoding="utf-8"))
        return next(item["id"] for item in fixtures if item["question"] == query)
    except (OSError, ValueError, KeyError, TypeError, StopIteration):
        return None


def code_revision() -> str:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True, stderr=subprocess.DEVNULL, timeout=2
        ).strip()
    except (OSError, subprocess.SubprocessError):
        return "unknown"


def code_version() -> str:
    files = [
        ROOT / "trace.py", ROOT / "run_ragas.py",
        ROOT.parent / "app" / "rag_service.py", ROOT.parent / "app" / "guardrail_service.py",
        ROOT.parent / "app" / "recommendation_service.py", ROOT.parent / "app" / "config.py",
    ]
    digest = hashlib.sha256()
    for path in files:
        digest.update(path.relative_to(ROOT.parent).as_posix().encode("utf-8"))
        digest.update(path.read_bytes())
    return digest.hexdigest()


def catalog_version() -> str:
    from app.rag_service import PUBLISHED_COFFEE_KNOWLEDGE_BASE

    payload = json.dumps(PUBLISHED_COFFEE_KNOWLEDGE_BASE, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def knowledge_base_version() -> str:
    """Hash the published DB snapshot; this is metadata auditing, not semantic retrieval."""
    try:
        with psycopg2.connect(settings.DATABASE_URL, connect_timeout=3) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT knowledge.metadata, knowledge.document_chunk, knowledge.embedding::text
                    FROM coffee_knowledge AS knowledge
                    LEFT JOIN catalog_publication_overrides AS publication
                      ON publication.slug = knowledge.metadata->>'slug'
                    WHERE knowledge.embedding IS NOT NULL
                      AND COALESCE(knowledge.metadata->>'publication_status', 'published') = 'published'
                      AND COALESCE(publication.is_published, TRUE) = TRUE
                    ORDER BY knowledge.metadata->>'slug', knowledge.id
                """)
                rows = cursor.fetchall()
        if not rows:
            return "unavailable"
        payload = json.dumps(rows, ensure_ascii=False, sort_keys=True, default=str)
        return "pgvector:" + hashlib.sha256(payload.encode("utf-8")).hexdigest()
    except (psycopg2.Error, TypeError, ValueError):
        return "unavailable"


class EvaluationTrace:
    def __init__(self, query: str, fixture_id: str, kb_version: str | None = None):
        self.write_error: str | None = None
        self.capture_error: str | None = None
        source_version = catalog_version()
        self.data: dict[str, Any] = {
            "schema_version": 1,
            "evaluation_request_id": str(uuid.uuid4()),
            "fixture_id": fixture_id,
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "query": query,
            "retrieval_source": "none",
            "retrieval_fallback_reason": None,
            "context_ids": [],
            "context_texts": [],
            "catalog_context": "",
            "catalog_context_sent": False,
            "web_source_urls": [],
            "input_guardrail": {"status": "not_executed", "decision_component": "not_executed"},
            "output_guardrail": {"status": "not_executed", "decision_component": "not_executed"},
            "fallback_status": "none",
            "fallback_reason": None,
            "generation_model": settings.OPENAI_MODEL,
            "embedding_model": settings.OPENAI_EMBEDDING_MODEL,
            "evaluator_model": settings.RAGAS_EVALUATOR_MODEL,
            "knowledge_base_version": kb_version or f"source_catalog:{source_version}",
            "source_catalog_version": source_version,
            "code_revision": code_revision(),
            "code_version": code_version(),
        }
        self.started = time.perf_counter()

    def update(self, **values: Any) -> None:
        self.data.update(values)

    def context(self, ids: list[str], texts: list[str], final_text: str) -> None:
        if len(ids) != len(texts) or final_text != "\n---\n".join(texts):
            raise ValueError("Evaluation context IDs and final text differ")
        self.update(context_ids=ids[:], context_texts=texts[:], catalog_context=final_text)

    def guardrail(self, stage: str, status: str) -> None:
        if "_nemo" in status or status == "passed_nemo":
            component = "nemo"
        elif status.endswith("_policy"):
            component = "deterministic_policy"
        elif status.startswith("degraded_custom"):
            component = "application_policy"
        else:
            component = "application_policy"
        self.data[f"{stage}_guardrail"] = {"status": status, "decision_component": component}

    def finish(self, response: dict[str, Any]) -> None:
        route = self.data.get("response_route")
        if route is None:
            route = ("web_search" if self.data["retrieval_source"] == "web_search"
                     else f"{self.data['retrieval_source']}+{response['responseSource']}")
        self.update(
            intent=response["intent"],
            answer=response["reply"],
            response_source=response["responseSource"],
            response_route=route,
            guardrail_status=response["guardrailStatus"],
            latency_ms=round((time.perf_counter() - self.started) * 1000, 2),
        )
        if response["responseSource"] == "local_fallback":
            self.update(fallback_status="used", fallback_reason=self.data.get("fallback_reason") or "generation_unavailable_or_invalid")
        elif self.data["retrieval_source"] == "in_memory":
            self.update(fallback_status="used", fallback_reason=self.data["retrieval_fallback_reason"])
        elif response["guardrailStatus"] in {"provider_unavailable", "health_policy_fallback"}:
            self.update(fallback_status="used", fallback_reason=response["guardrailStatus"])
        if response["guardrailStatus"] == "health_policy_fallback":
            self.guardrail("output", "health_policy_fallback")

    def write(self) -> None:
        try:
            if any(_PRIVATE_PATTERN.search(str(self.data.get(field, ""))) for field in ("query", "answer", "catalog_context")):
                self.write_error = "privacy_filter"
                return
            TRACE_PATH.parent.mkdir(parents=True, exist_ok=True)
            with _write_lock, TRACE_PATH.open("a", encoding="utf-8") as output:
                output.write(json.dumps(self.data, ensure_ascii=False, sort_keys=True) + "\n")
        except (OSError, TypeError, ValueError) as error:
            self.write_error = type(error).__name__

    def require_complete(self) -> dict[str, Any]:
        if self.capture_error:
            raise RuntimeError(f"Evaluation trace could not be captured: {self.capture_error}")
        if self.write_error:
            raise RuntimeError(f"Evaluation trace could not be written: {self.write_error}")
        if "answer" not in self.data or "latency_ms" not in self.data:
            raise RuntimeError("Evaluation trace is incomplete")
        return self.data


def current_trace() -> EvaluationTrace | None:
    return _active_trace.get()


def record(**values: Any) -> None:
    trace = current_trace()
    if trace is not None:
        try:
            trace.update(**values)
        except Exception as error:
            trace.capture_error = type(error).__name__


def record_guardrail(stage: str, status: str) -> None:
    trace = current_trace()
    if trace is not None:
        try:
            trace.guardrail(stage, status)
        except Exception as error:
            trace.capture_error = type(error).__name__


@contextmanager
def capture(query: str, *, kb_version: str | None = None) -> Iterator[EvaluationTrace | None]:
    fixture_id = fixture_id_for(query)
    if fixture_id is None:
        yield None
        return
    try:
        trace = EvaluationTrace(query, fixture_id, kb_version)
    except Exception:
        yield None
        return
    token = _active_trace.set(trace)
    try:
        yield trace
    finally:
        _active_trace.reset(token)
        trace.write()
