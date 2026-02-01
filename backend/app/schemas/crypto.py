"""
Crypto Tracker Backend - Cryptocurrency Schemas

Pydantic models for cryptocurrency data validation and serialization.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class CryptoPriceChange(BaseModel):
    """Price change percentages for different time periods."""
    
    price_change_1h: Optional[float] = Field(None, alias="price_change_percentage_1h_in_currency")
    price_change_24h: Optional[float] = Field(None, alias="price_change_percentage_24h_in_currency")
    price_change_7d: Optional[float] = Field(None, alias="price_change_percentage_7d_in_currency")
    price_change_30d: Optional[float] = Field(None, alias="price_change_percentage_30d_in_currency")


class CryptoListItem(BaseModel):
    """Cryptocurrency item in list response."""
    
    id: str
    symbol: str
    name: str
    image: Optional[str] = None
    current_price: Optional[float] = None
    market_cap: Optional[float] = None
    market_cap_rank: Optional[int] = None
    fully_diluted_valuation: Optional[float] = None
    total_volume: Optional[float] = None
    high_24h: Optional[float] = None
    low_24h: Optional[float] = None
    price_change_24h: Optional[float] = None
    price_change_percentage_24h: Optional[float] = None
    market_cap_change_24h: Optional[float] = None
    market_cap_change_percentage_24h: Optional[float] = None
    circulating_supply: Optional[float] = None
    total_supply: Optional[float] = None
    max_supply: Optional[float] = None
    ath: Optional[float] = None
    ath_change_percentage: Optional[float] = None
    ath_date: Optional[str] = None
    atl: Optional[float] = None
    atl_change_percentage: Optional[float] = None
    atl_date: Optional[str] = None
    last_updated: Optional[str] = None
    sparkline_in_7d: Optional[Dict[str, List[float]]] = None
    price_change_percentage_1h_in_currency: Optional[float] = None
    price_change_percentage_24h_in_currency: Optional[float] = None
    price_change_percentage_7d_in_currency: Optional[float] = None
    
    class Config:
        populate_by_name = True


class CryptoListResponse(BaseModel):
    """Response model for cryptocurrency list endpoint."""
    
    data: List[CryptoListItem]
    page: int
    per_page: int
    total_count: Optional[int] = None


class CryptoMarketData(BaseModel):
    """Market data for a cryptocurrency."""
    
    current_price: Optional[Dict[str, float]] = None
    total_value_locked: Optional[float] = None
    market_cap: Optional[Dict[str, float]] = None
    market_cap_rank: Optional[int] = None
    fully_diluted_valuation: Optional[Dict[str, float]] = None
    total_volume: Optional[Dict[str, float]] = None
    high_24h: Optional[Dict[str, float]] = None
    low_24h: Optional[Dict[str, float]] = None
    price_change_24h: Optional[float] = None
    price_change_percentage_24h: Optional[float] = None
    price_change_percentage_7d: Optional[float] = None
    price_change_percentage_14d: Optional[float] = None
    price_change_percentage_30d: Optional[float] = None
    price_change_percentage_60d: Optional[float] = None
    price_change_percentage_200d: Optional[float] = None
    price_change_percentage_1y: Optional[float] = None
    market_cap_change_24h: Optional[float] = None
    market_cap_change_percentage_24h: Optional[float] = None
    circulating_supply: Optional[float] = None
    total_supply: Optional[float] = None
    max_supply: Optional[float] = None
    ath: Optional[Dict[str, float]] = None
    ath_change_percentage: Optional[Dict[str, float]] = None
    ath_date: Optional[Dict[str, str]] = None
    atl: Optional[Dict[str, float]] = None
    atl_change_percentage: Optional[Dict[str, float]] = None
    atl_date: Optional[Dict[str, str]] = None
    sparkline_7d: Optional[Dict[str, List[float]]] = None


class CryptoDetail(BaseModel):
    """Detailed cryptocurrency information."""
    
    id: str
    symbol: str
    name: str
    web_slug: Optional[str] = None
    asset_platform_id: Optional[str] = None
    block_time_in_minutes: Optional[int] = None
    hashing_algorithm: Optional[str] = None
    categories: Optional[List[str]] = None
    description: Optional[Dict[str, str]] = None
    links: Optional[Dict[str, Any]] = None
    image: Optional[Dict[str, str]] = None
    country_origin: Optional[str] = None
    genesis_date: Optional[str] = None
    sentiment_votes_up_percentage: Optional[float] = None
    sentiment_votes_down_percentage: Optional[float] = None
    market_cap_rank: Optional[int] = None
    market_data: Optional[CryptoMarketData] = None
    last_updated: Optional[str] = None


class CryptoHistoryPoint(BaseModel):
    """Single point in price history."""
    
    timestamp: int
    value: float


class CryptoHistoryResponse(BaseModel):
    """Response model for cryptocurrency history endpoint."""
    
    prices: List[List[float]]
    market_caps: List[List[float]]
    total_volumes: List[List[float]]


class GlobalMarketData(BaseModel):
    """Global cryptocurrency market statistics."""
    
    active_cryptocurrencies: Optional[int] = None
    upcoming_icos: Optional[int] = None
    ongoing_icos: Optional[int] = None
    ended_icos: Optional[int] = None
    markets: Optional[int] = None
    total_market_cap: Optional[Dict[str, float]] = None
    total_volume: Optional[Dict[str, float]] = None
    market_cap_percentage: Optional[Dict[str, float]] = None
    market_cap_change_percentage_24h_usd: Optional[float] = None
    updated_at: Optional[int] = None


class GlobalMarketResponse(BaseModel):
    """Response model for global market stats endpoint."""
    
    data: GlobalMarketData


class TrendingCoin(BaseModel):
    """Trending cryptocurrency item."""
    
    id: str
    coin_id: Optional[int] = None
    name: str
    symbol: str
    market_cap_rank: Optional[int] = None
    thumb: Optional[str] = None
    small: Optional[str] = None
    large: Optional[str] = None
    slug: Optional[str] = None
    price_btc: Optional[float] = None
    score: Optional[int] = None


class TrendingCoinItem(BaseModel):
    """Wrapper for trending coin."""
    
    item: TrendingCoin


class TrendingResponse(BaseModel):
    """Response model for trending endpoint."""
    
    coins: List[TrendingCoinItem]
    nfts: Optional[List[Dict[str, Any]]] = None
    categories: Optional[List[Dict[str, Any]]] = None


class SearchCoin(BaseModel):
    """Coin search result item."""
    
    id: str
    name: str
    api_symbol: Optional[str] = None
    symbol: str
    market_cap_rank: Optional[int] = None
    thumb: Optional[str] = None
    large: Optional[str] = None


class SearchResponse(BaseModel):
    """Response model for search endpoint."""
    
    coins: List[SearchCoin]
    exchanges: Optional[List[Dict[str, Any]]] = None
    categories: Optional[List[Dict[str, Any]]] = None
    nfts: Optional[List[Dict[str, Any]]] = None
