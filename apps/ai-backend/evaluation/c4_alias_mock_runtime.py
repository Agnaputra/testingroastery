"""Local C4 alias probe; extends the C3 mock without paid OpenAI calls."""

import uvicorn

from evaluation import c3_mock_runtime as c3


def mock_alias_or_ijen(url, **kwargs):
    payload = kwargs["json"]
    if payload["text"]["format"]["name"] == "barista_intent":
        return c3.mock_openai_post(url, **kwargs)
    user_content = payload["input"][-1]["content"]
    question = user_content.split("<user_message>\n", 1)[1].split("\n</user_message>", 1)[0]
    if question != "Berapa harga Prau Natural El Davisio 100g?":
        return c3.mock_openai_post(url, **kwargs)
    context = user_content.split("<catalog_context>\n", 1)[1].split("\n</catalog_context>", 1)[0]
    if "Slug: prau-natural-el-davisio-surya" not in context:
        raise AssertionError("Alias mock requires the published KB context")
    return c3.MockResponse({
        "intent": "catalog_question",
        "reply": "Prau Natural El Davisio 100g Rp139.000.",
        "recommendedProductSlugs": ["prau-natural-el-davisio-surya"],
        "needsClarification": False,
        "clarifyingQuestion": None,
        "safetyNote": None,
        "followUpSuggestions": [],
    })


c3.rag_module.httpx.post = mock_alias_or_ijen

if __name__ == "__main__":
    uvicorn.run(c3.app, host="127.0.0.1", port=8014)
