"""
Crypto Tracker Backend - FastAPI Application

Main entry point for the FastAPI application.
"""

from uuid import uuid4
from fastapi import FastAPI, WebSocket
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


# Import and include routers
from app.api.routes import crypto, portfolio
app.include_router(crypto.router, prefix="/api/v1/cryptos", tags=["Cryptocurrencies"])
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["Portfolio"])

# TODO: Enable additional routers as they are implemented
# from app.api.routes import alerts, auth
# app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])


# WebSocket endpoint for real-time price updates
from app.api.websocket import websocket_endpoint

@app.websocket("/ws/{client_id}")
async def websocket_route(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time cryptocurrency price updates."""
    await websocket_endpoint(websocket, client_id)


@app.websocket("/ws")
async def websocket_route_auto_id(websocket: WebSocket):
    """WebSocket endpoint with auto-generated client ID."""
    client_id = str(uuid4())
    await websocket_endpoint(websocket, client_id)

