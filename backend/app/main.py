from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import triage, cases, audio

app = FastAPI(
    title="TriageIQ API",
    description="AI-Powered Intelligent Triage & Decision Support System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(triage.router, prefix="/api/triage", tags=["Triage"])
app.include_router(cases.router, prefix="/api/cases", tags=["Cases"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio"])

@app.get("/")
async def root():
    return {"message": "TriageIQ API is running", "version": "1.0.0"}

@app.get("/health")
async def health():
    has_key = bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "sk-your-openai-key-here")
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "openai_configured": has_key,
        "cors_origins": settings.CORS_ORIGINS,
    }
