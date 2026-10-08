from typing import List, Literal, Optional
from pydantic import BaseModel, Field

# --- Pydantic Schemas for API ---

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"] = Field(..., description="Role of the sender")
    content: str = Field(..., max_length=4000, description="Text content of the message")
    intent: Optional[str] = None
    grounding: Optional[Literal["catalog", "website", "coffee_web", "conversation", "none"]] = None
    recommendedProductSlugs: List[str] = Field(default_factory=list, max_length=10)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500, description="User query / question to the barista")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Recent conversation history")
    temperature: Optional[float] = Field(default=0.4, description="Sampling temperature")

class RecommendedVariant(BaseModel):
    weightGrams: int
    weightLabel: str
    price: int
    pricePerGram: float

class ProductSearchResult(BaseModel):
    slug: str
    name: str
    series: str
    origin: str
    process: str
    tasting_notes: List[str]
    base_price: float
    similarity_score: Optional[float] = None
    selectedVariant: Optional[RecommendedVariant] = None

class SourceLink(BaseModel):
    title: str
    url: str

class ChatAction(BaseModel):
    type: Literal["view_product", "add_to_cart", "open_feature"]
    product_slug: Optional[str] = None
    path: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    intent: str = "off_topic"
    grounding: Literal["catalog", "website", "coffee_web", "conversation", "none"] = "none"
    recommendedProductSlugs: List[str] = Field(default_factory=list)
    actions: List[ChatAction] = Field(default_factory=list)
    followUpSuggestions: List[str] = Field(default_factory=list)
    # Backward-compatible fields while the frontend migrates to the structured contract.
    recommendedSlugs: List[str] = Field(default_factory=list)
    recommendedProducts: List[ProductSearchResult] = Field(default_factory=list)
    sources: List[SourceLink] = Field(default_factory=list)
    groundedInCatalog: bool = True
    guardrailStatus: str = "passed"

class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 4

class SearchResponse(BaseModel):
    results: List[ProductSearchResult]
    query: str

class PublicationUpdateRequest(BaseModel):
    slugs: List[str] = Field(..., min_length=1, max_length=10)
    isPublished: bool
