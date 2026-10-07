from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routes.ai import router as ai_router


app = FastAPI(
    title="Unified Public Grievance System API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    ai_router,
    prefix="/api/ai",
    tags=["AI"],
)


@app.get("/")
def root():
    return {
        "message": "Unified Public Grievance System API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok"
    }