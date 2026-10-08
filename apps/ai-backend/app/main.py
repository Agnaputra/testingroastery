# pyrefly: ignore [missing-import]
import asyncio
import re
import secrets

from fastapi import FastAPI, Header, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .models import ChatRequest, ChatResponse, PublicationUpdateRequest, SearchRequest, SearchResponse
from .guardrail_service import guardrail_service
from .rag_service import rag_service, PUBLISHED_COFFEE_KNOWLEDGE_BASE
from .publication_service import (
    apply_publication_overrides,
    ensure_publication_schema,
    get_publication_overrides,
    set_publication,
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Microservice AI Virtual Barista RAG untuk 52 Coffee & Roastery Malang",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def initialise_publication_store():
    ensure_publication_schema()

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "endpoints": {
            "health": "/health",
            "chat": "/api/chat",
            "search": "/api/search",
            "products": "/api/products",
        },
    }

@app.get("/health")
def health_check():
    guardrails = guardrail_service.status()
    retrieval = rag_service.retrieval_status()
    return {
        "status": "healthy" if guardrails["runtime_ready"] and retrieval["runtime"] == "pgvector" else "degraded",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "guardrails": guardrails,
        "retrieval": retrieval,
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_barista(request: ChatRequest):
    """
    Catalog-grounded conversational endpoint with OpenAI, local fallback, and input guardrails.
    """
    try:
        response = await asyncio.to_thread(
            rag_service.generate_barista_response,
            user_query=request.message,
            history=[message.model_dump(exclude_none=True) for message in request.history],
        )
        return response
    except Exception:
        raise HTTPException(status_code=500, detail="Barista service tidak tersedia. Silakan coba lagi.")

@app.post("/api/search", response_model=SearchResponse)
async def search_coffee_catalog(request: SearchRequest):
    """
    Semantic vector search for coffee products by tasting notes or queries
    """
    try:
        results = rag_service.search_similar_products(request.query, top_k=request.limit or 4)
        formatted_results = [
            {
                "slug": item[0]["slug"],
                "name": item[0]["name"],
                "series": item[0]["series"],
                "origin": item[0]["origin"],
                "process": item[0]["process"],
                "tasting_notes": item[0]["notes"],
                "base_price": float(item[0].get("price_100g", item[0].get("price_200g", item[0].get("price_16g", 0)))),
                "similarity_score": round(item[1], 3),
            }
            for item in results
        ]
        return {"results": formatted_results, "query": request.query}
    except Exception:
        raise HTTPException(status_code=500, detail="Pencarian katalog tidak tersedia. Silakan coba lagi.")

@app.get("/api/products")
async def get_all_products():
    """
    Returns full authentic 52 Coffee & Roastery knowledge data
    """
    products = apply_publication_overrides(PUBLISHED_COFFEE_KNOWLEDGE_BASE, get_publication_overrides())
    return {"count": len(products), "data": products}


@app.get("/api/catalog/publication")
async def get_catalog_publication():
    try:
        return {"overrides": get_publication_overrides()}
    except Exception:
        raise HTTPException(status_code=503, detail="Status katalog tidak tersedia.")


@app.patch("/api/catalog/publication")
async def update_catalog_publication(
    request: PublicationUpdateRequest,
    x_admin_key: str = Header(default=""),
):
    if not settings.ADMIN_API_KEY or not secrets.compare_digest(x_admin_key, settings.ADMIN_API_KEY):
        raise HTTPException(status_code=401, detail="Akses admin tidak valid.")
    slugs = list(dict.fromkeys(slug.strip() for slug in request.slugs))
    if any(not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) for slug in slugs):
        raise HTTPException(status_code=422, detail="Slug produk tidak valid.")
    try:
        set_publication(slugs, request.isPublished)
        return {"updated": slugs, "isPublished": request.isPublished}
    except Exception:
        raise HTTPException(status_code=503, detail="Status katalog gagal disimpan.")

if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
