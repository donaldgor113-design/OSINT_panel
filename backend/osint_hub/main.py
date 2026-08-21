from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from osint_hub.api.middleware.error_handler import register_error_handlers
from osint_hub.api.routes import auth, cases, entities, queries, registries
from osint_hub.config import get_settings

settings = get_settings()

app = FastAPI(title="OSINT HUB API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(registries.router, prefix=settings.api_v1_prefix)
app.include_router(queries.router, prefix=settings.api_v1_prefix)
app.include_router(cases.router, prefix=settings.api_v1_prefix)
app.include_router(entities.router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "environment": settings.environment}
