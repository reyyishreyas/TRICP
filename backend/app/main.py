import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes import router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Churn prediction API and batch processing.",
)

# Allow the Vercel frontend + local dev.
# Set ALLOWED_ORIGINS in Render env vars once you have the Vercel URL,
# e.g. "https://tricp.vercel.app,http://localhost:5173"
_raw_origins = os.getenv("ALLOWED_ORIGINS", "")
_extra = [o.strip() for o in _raw_origins.split(",") if o.strip()]
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    *_extra,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # covers all Vercel preview URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.exception_handler(FileNotFoundError)
async def file_not_found_handler(_: Request, exc: FileNotFoundError) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"detail": "Required artifact or dataset missing.", "path": str(exc)},
    )


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": exc.errors()})
