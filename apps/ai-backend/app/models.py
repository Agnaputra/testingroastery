from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Pydantic Schemas for API ---

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the sender ('user' or 'assistant')")
    content: str = Field(..., description="Text content of the message")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User query / question to the barista")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Recent conversation history")
    temperature: Optional[float] = Field(default=0.4, description="Sampling temperature")

class ProductSearchResult(BaseModel):
    slug: str
    name: str
    series: str
    origin: str
    process: str
    tasting_notes: List[str]
    base_price: float
    similarity_score: Optional[float] = None

class ChatResponse(BaseModel):
    reply: str
    recommendedSlugs: List[str] = []
    recommendedProducts: List[ProductSearchResult] = []
    groundedInCatalog: bool = True
    guardrailStatus: str = "passed"

class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 4

class SearchResponse(BaseModel):
    results: List[ProductSearchResult]
    query: str
