"""
Crypto Tracker Backend - FastAPI Application

Main entry point for the FastAPI application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="A comprehensive cryptocurrency tracking API with real-time updates, portfolio management, and analytics.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected",  # TODO: Add actual DB check
        "cache": "connected",     # TODO: Add actual Redis check
    }


# Import and include routers (will be added as we build them)
# from app.api.routes import crypto, portfolio, alerts, auth
# app.include_router(crypto.router, prefix="/api/v1/cryptos", tags=["Cryptocurrencies"])
# app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["Portfolio"])
# app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
