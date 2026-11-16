# pyrefly: ignore [missing-import]

from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.openapi import preserve_schema_names
from app.services.catalog.publication_service import ensure_publication_schema
from app.api.routers.events import router as events_router
from app.api.routers.customer_auth import router as customer_router
from app.api.routers.customer_account import router as customer_account_router
from app.api.routers.customer_orders import router as customer_orders_router
from app.api.routers.customer_payments import router as customer_payments_router
from app.api.routers.customer_operations import router as customer_operations_router
from app.api.routers.catalog_management import router as catalog_management_router
from app.core.postgres_pool import pool as request_database_pool

from app.api.routers.public_api import router as public_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Microservice AI Virtual Barista RAG untuk 52 Coffee & Roastery Malang",
)
app.include_router(events_router)
app.include_router(customer_router)
app.include_router(customer_account_router)
app.include_router(customer_orders_router)
app.include_router(customer_payments_router)
app.include_router(customer_operations_router)
app.include_router(catalog_management_router)
app.include_router(public_router)
preserve_schema_names(app)

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


@app.on_event("shutdown")
def close_request_database_pool():
    request_database_pool.dispose()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
