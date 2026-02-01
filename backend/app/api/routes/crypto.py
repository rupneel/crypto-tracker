"""
Crypto Tracker Backend - Cryptocurrency Routes

REST API endpoints for cryptocurrency data.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.services.crypto_service import crypto_service

router = APIRouter()


@router.get("/")
async def get_cryptos(
    vs_currency: str = Query("usd", description="Target currency for prices"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=250, description="Results per page"),
    order: str = Query("market_cap_desc", description="Sort order"),
    sparkline: bool = Query(True, description="Include sparkline data"),
):
    """
    Get list of cryptocurrencies with market data.
    
    Returns paginated list of cryptocurrencies sorted by market cap.
    """
    try:
        data = await crypto_service.get_all_cryptos(
            vs_currency=vs_currency,
            page=page,
            per_page=per_page,
            order=order,
            sparkline=sparkline,
        )
        return {
            "data": data,
            "page": page,
            "per_page": per_page,
            "count": len(data),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search_cryptos(
    query: str = Query(..., min_length=1, description="Search query"),
):
    """
    Search for cryptocurrencies by name or symbol.
    """
    try:
        data = await crypto_service.search_cryptos(query)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trending")
async def get_trending():
    """
    Get trending cryptocurrencies.
    
    Returns top 7 trending coins in the last 24 hours.
    """
    try:
        data = await crypto_service.get_trending()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/market/global")
async def get_global_stats():
    """
    Get global cryptocurrency market statistics.
    
    Returns total market cap, volume, BTC dominance, etc.
    """
    try:
        data = await crypto_service.get_market_stats()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{crypto_id}")
async def get_crypto_detail(
    crypto_id: str,
    localization: bool = Query(False, description="Include localized names"),
    tickers: bool = Query(False, description="Include ticker data"),
    market_data: bool = Query(True, description="Include market data"),
    sparkline: bool = Query(True, description="Include sparkline data"),
):
    """
    Get detailed information for a specific cryptocurrency.
    
    Returns comprehensive data including market stats, description, links, etc.
    """
    try:
        data = await crypto_service.get_crypto_by_id(
            crypto_id=crypto_id,
            localization=localization,
            tickers=tickers,
            market_data=market_data,
            sparkline=sparkline,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{crypto_id}/history")
async def get_crypto_history(
    crypto_id: str,
    vs_currency: str = Query("usd", description="Target currency"),
    days: str = Query("7", description="Days of history (1, 7, 14, 30, 90, 180, 365, max)"),
    interval: Optional[str] = Query(None, description="Data interval (daily for 90+ days)"),
):
    """
    Get historical price, market cap, and volume data.
    
    Returns arrays of [timestamp, value] pairs for charting.
    """
    try:
        data = await crypto_service.get_crypto_history(
            crypto_id=crypto_id,
            vs_currency=vs_currency,
            days=days,
            interval=interval,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
