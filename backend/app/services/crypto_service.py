"""
Crypto Tracker Backend - Cryptocurrency Data Service

Service for fetching cryptocurrency data from CoinGecko API.
Includes caching to respect rate limits and improve performance.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import httpx

from app.config import settings


class CryptoService:
    """Service for fetching cryptocurrency data from external APIs."""
    
    def __init__(self):
        self.base_url = settings.COINGECKO_API_URL
        self.api_key = settings.COINGECKO_API_KEY
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl = settings.CACHE_TTL_SECONDS
    
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers, including API key if available."""
        headers = {
            "Accept": "application/json",
        }
        if self.api_key:
            headers["x-cg-demo-api-key"] = self.api_key
        return headers
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid."""
        if cache_key not in self._cache:
            return False
        cached = self._cache[cache_key]
        return datetime.now() < cached["expires_at"]
    
    def _get_from_cache(self, cache_key: str) -> Optional[Any]:
        """Get data from cache if valid."""
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]["data"]
        return None
    
    def _set_cache(self, cache_key: str, data: Any, ttl: Optional[int] = None) -> None:
        """Store data in cache with expiration."""
        ttl = ttl or self._cache_ttl
        self._cache[cache_key] = {
            "data": data,
            "expires_at": datetime.now() + timedelta(seconds=ttl)
        }
    
    async def get_all_cryptos(
        self,
        vs_currency: str = "usd",
        page: int = 1,
        per_page: int = 100,
        order: str = "market_cap_desc",
        sparkline: bool = True,
        price_change_percentage: str = "1h,24h,7d"
    ) -> List[Dict[str, Any]]:
        """
        Fetch list of cryptocurrencies with market data.
        
        Args:
            vs_currency: Target currency (usd, eur, btc, etc.)
            page: Page number for pagination
            per_page: Results per page (max 250)
            order: Sort order (market_cap_desc, volume_desc, etc.)
            sparkline: Include 7-day sparkline data
            price_change_percentage: Price change intervals
            
        Returns:
            List of cryptocurrency data dictionaries
        """
        cache_key = f"cryptos_{vs_currency}_{page}_{per_page}_{order}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        params = {
            "vs_currency": vs_currency,
            "order": order,
            "per_page": per_page,
            "page": page,
            "sparkline": str(sparkline).lower(),
            "price_change_percentage": price_change_percentage,
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/coins/markets",
                params=params,
                headers=self._get_headers(),
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
        
        self._set_cache(cache_key, data)
        return data
    
    async def get_crypto_by_id(
        self,
        crypto_id: str,
        localization: bool = False,
        tickers: bool = False,
        market_data: bool = True,
        community_data: bool = False,
        developer_data: bool = False,
        sparkline: bool = True
    ) -> Dict[str, Any]:
        """
        Fetch detailed information for a specific cryptocurrency.
        
        Args:
            crypto_id: Cryptocurrency ID (e.g., "bitcoin", "ethereum")
            localization: Include localized names
            tickers: Include ticker data
            market_data: Include market data
            community_data: Include community data
            developer_data: Include developer data
            sparkline: Include sparkline data
            
        Returns:
            Detailed cryptocurrency data dictionary
        """
        cache_key = f"crypto_{crypto_id}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        params = {
            "localization": str(localization).lower(),
            "tickers": str(tickers).lower(),
            "market_data": str(market_data).lower(),
            "community_data": str(community_data).lower(),
            "developer_data": str(developer_data).lower(),
            "sparkline": str(sparkline).lower(),
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/coins/{crypto_id}",
                params=params,
                headers=self._get_headers(),
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
        
        self._set_cache(cache_key, data)
        return data
    
    async def get_crypto_history(
        self,
        crypto_id: str,
        vs_currency: str = "usd",
        days: str = "7",
        interval: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Fetch historical price, market cap, and volume data.
        
        Args:
            crypto_id: Cryptocurrency ID
            vs_currency: Target currency
            days: Data up to number of days ago (1, 7, 14, 30, 90, 180, 365, max)
            interval: Data interval (daily for 90+ days)
            
        Returns:
            Historical market data with prices, market_caps, total_volumes
        """
        cache_key = f"history_{crypto_id}_{vs_currency}_{days}"
        
        # Use shorter cache for recent data
        ttl = 60 if days in ["1", "7"] else 300
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        params = {
            "vs_currency": vs_currency,
            "days": days,
        }
        if interval:
            params["interval"] = interval
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/coins/{crypto_id}/market_chart",
                params=params,
                headers=self._get_headers(),
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
        
        self._set_cache(cache_key, data, ttl)
        return data
    
    async def get_market_stats(self) -> Dict[str, Any]:
        """
        Fetch global cryptocurrency market statistics.
        
        Returns:
            Global market data including total market cap, volume, BTC dominance
        """
        cache_key = "global_stats"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/global",
                headers=self._get_headers(),
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
        
        self._set_cache(cache_key, data)
        return data
    
    async def search_cryptos(self, query: str) -> Dict[str, Any]:
        """
        Search for cryptocurrencies by name or symbol.
        
        Args:
            query: Search query string
            
        Returns:
            Search results with coins, exchanges, categories, NFTs
        """
        cache_key = f"search_{query.lower()}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/search",
                params={"query": query},
                headers=self._get_headers(),
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
        
        # Cache search results for 10 minutes
        self._set_cache(cache_key, data, 600)
        return data
    
    async def get_trending(self) -> Dict[str, Any]:
        """
        Fetch trending cryptocurrencies.
        
        Returns:
            Trending coins, NFTs, and categories
        """
        cache_key = "trending"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/search/trending",
                headers=self._get_headers(),
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
        
        # Cache trending for 5 minutes
        self._set_cache(cache_key, data, 300)
        return data


# Create a singleton instance
crypto_service = CryptoService()
