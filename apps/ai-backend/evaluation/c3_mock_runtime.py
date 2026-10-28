"""C3-only FastAPI runtime: real HTTP/pgvector with all OpenAI calls intercepted."""

import json
import re
from pathlib import Path
from threading import Lock

import uvicorn

from app.main import app
from app.price_service import require_price_test_mode
from app.rag_service import rag_service
import app.rag_service as rag_module


require_price_test_mode()
rag_service.openai_api_key = "mock"
rag_service._create_embedding = lambda _query: [1.0] + [0.0] * 1535
capture_path = Path(__file__).parent / "results" / "c3-mock-generation.jsonl"
capture_lock = Lock()


class MockResponse:
    def __init__(self, output):
        self.output = output

    def raise_for_status(self):
        pass

    def json(self):
        return {"output": [{"content": [{"type": "output_text", "text": json.dumps(self.output)}]}]}


def mock_openai_post(url, **kwargs):
    if url != "https://api.openai.com/v1/responses":
        raise AssertionError("C3 mock blocked an unexpected outbound request")
    payload = kwargs["json"]
    if payload["text"]["format"]["name"] == "barista_intent":
        return MockResponse({"intent": "catalog_query"})
    user_content = payload["input"][-1]["content"]
    context = user_content.split("<catalog_context>\n", 1)[1].split("\n</catalog_context>", 1)[0]
    question = user_content.split("<user_message>\n", 1)[1].split("\n</user_message>", 1)[0]
    if question != "Berapa harga Ijen Carbonic Maceration 100g?":
        raise AssertionError("C3 mock accepts only the synthetic Ijen price question")
    amount = re.search(r"100g - Rp ([\d.]+)", context)
    if not amount or "Slug: ijen-carbonic-maceration-asmara" not in context:
        raise AssertionError("C3 mock requires the published Ijen generation context")
    with capture_lock:
        with capture_path.open("a", encoding="utf-8") as output:
            output.write(json.dumps({"question": question, "catalog_context": context}, ensure_ascii=False) + "\n")
    return MockResponse({
        "intent": "catalog_question",
        "reply": f"Ijen Carbonic Maceration 100g Rp{amount.group(1)}.",
        "recommendedProductSlugs": ["ijen-carbonic-maceration-asmara"],
        "needsClarification": False,
        "clarifyingQuestion": None,
        "safetyNote": None,
        "followUpSuggestions": [],
    })


rag_module.httpx.post = mock_openai_post

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8014)
