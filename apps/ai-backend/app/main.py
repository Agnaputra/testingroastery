# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, Depends
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .models import ChatRequest, ChatResponse, SearchRequest, SearchResponse
from .rag_service import rag_service, COFFEE_KNOWLEDGE_BASE

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
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "guardrails_enabled": settings.ENABLE_GUARDRAILS,
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_barista(request: ChatRequest):
    """
    RAG-powered conversational endpoint with Gemini + NeMo Guardrails
    """
    try:
        response = rag_service.generate_barista_response(
            user_query=request.message,
            history=[{"role": m.role, "content": m.content} for m in request.history]
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Barista service error: {str(e)}")

@app.post("/api/search", response_model=SearchResponse)
async def search_coffee_catalog(request: SearchRequest):
    """
    Semantic vector search for coffee products by tasting notes or queries
    """
    try:
        results = rag_service.search_similar_products(request.query, limit=request.limit or 4)
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products")
async def get_all_products():
    """
    Returns full authentic 52 Coffee & Roastery knowledge data
    """
    return {"count": len(COFFEE_KNOWLEDGE_BASE), "data": COFFEE_KNOWLEDGE_BASE}

if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
