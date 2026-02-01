"""
Crypto Tracker Backend - Analytics Service

Service for complex financial calculations using pandas and numpy.
"""

from typing import List, Dict, Any, Optional
from decimal import Decimal
from datetime import datetime
import numpy as np
import pandas as pd


class AnalyticsService:
    """Service for portfolio analytics and financial calculations."""
    
    @staticmethod
    def calculate_portfolio_value(
        holdings: List[Dict[str, Any]],
        prices: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Calculate total portfolio value and per-holding values.
        
        Args:
            holdings: List of holdings with crypto_id and quantity
            prices: Dict mapping crypto_id to current price
            
        Returns:
            Dict with total_value and per-holding values
        """
        holding_values = []
        total_value = 0.0
        
        for holding in holdings:
            crypto_id = holding.get("crypto_id")
            quantity = float(holding.get("quantity", 0))
            price = prices.get(crypto_id, 0)
            value = quantity * price
            
            holding_values.append({
                "crypto_id": crypto_id,
                "quantity": quantity,
                "current_price": price,
                "current_value": value,
            })
            total_value += value
        
        return {
            "total_value": total_value,
            "holdings": holding_values,
        }
    
    @staticmethod
    def calculate_pnl(
        holdings: List[Dict[str, Any]],
        prices: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Calculate profit/loss for each holding and total.
        
        Args:
            holdings: List of holdings with crypto_id, quantity, purchase_price
            prices: Dict mapping crypto_id to current price
            
        Returns:
            Dict with total P&L and per-holding P&L
        """
        pnl_data = []
        total_cost = 0.0
        total_value = 0.0
        
        for holding in holdings:
            crypto_id = holding.get("crypto_id")
            quantity = float(holding.get("quantity", 0))
            purchase_price = float(holding.get("purchase_price", 0))
            current_price = prices.get(crypto_id, 0)
            
            cost = quantity * purchase_price
            value = quantity * current_price
            pnl = value - cost
            pnl_percent = ((value - cost) / cost * 100) if cost > 0 else 0
            
            pnl_data.append({
                "crypto_id": crypto_id,
                "quantity": quantity,
                "purchase_price": purchase_price,
                "current_price": current_price,
                "cost": cost,
                "current_value": value,
                "pnl": pnl,
                "pnl_percentage": pnl_percent,
            })
            
            total_cost += cost
            total_value += value
        
        total_pnl = total_value - total_cost
        total_pnl_percent = ((total_value - total_cost) / total_cost * 100) if total_cost > 0 else 0
        
        return {
            "total_cost": total_cost,
            "total_value": total_value,
            "total_pnl": total_pnl,
            "total_pnl_percentage": total_pnl_percent,
            "holdings": pnl_data,
        }
    
    @staticmethod
    def calculate_roi(initial_value: float, current_value: float) -> float:
        """
        Calculate return on investment percentage.
        
        Args:
            initial_value: Initial investment value
            current_value: Current value
            
        Returns:
            ROI percentage
        """
        if initial_value <= 0:
            return 0.0
        return ((current_value - initial_value) / initial_value) * 100
    
    @staticmethod
    def calculate_allocation(
        holdings: List[Dict[str, Any]],
        prices: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """
        Calculate percentage allocation for each holding.
        
        Args:
            holdings: List of holdings with crypto_id and quantity
            prices: Dict mapping crypto_id to current price
            
        Returns:
            List of holdings with allocation percentages
        """
        # Calculate total value first
        total_value = sum(
            float(h.get("quantity", 0)) * prices.get(h.get("crypto_id"), 0)
            for h in holdings
        )
        
        allocations = []
        for holding in holdings:
            crypto_id = holding.get("crypto_id")
            quantity = float(holding.get("quantity", 0))
            price = prices.get(crypto_id, 0)
            value = quantity * price
            allocation = (value / total_value * 100) if total_value > 0 else 0
            
            allocations.append({
                "crypto_id": crypto_id,
                "value": value,
                "allocation_percentage": allocation,
            })
        
        # Sort by allocation descending
        allocations.sort(key=lambda x: x["allocation_percentage"], reverse=True)
        return allocations
    
    @staticmethod
    def calculate_price_changes(
        history_data: Dict[str, Any]
    ) -> Dict[str, float]:
        """
        Calculate price changes from historical data.
        
        Args:
            history_data: CoinGecko history response with prices array
            
        Returns:
            Dict with price changes for different periods
        """
        prices = history_data.get("prices", [])
        if not prices or len(prices) < 2:
            return {}
        
        # Convert to numpy array for calculations
        price_array = np.array([p[1] for p in prices])
        current_price = price_array[-1]
        
        result = {}
        
        # 24h change (last 24 data points for hourly data)
        if len(price_array) >= 24:
            price_24h_ago = price_array[-24]
            result["change_24h"] = ((current_price - price_24h_ago) / price_24h_ago) * 100
        
        # 7d change
        if len(price_array) >= 168:  # 7 * 24 hours
            price_7d_ago = price_array[-168]
            result["change_7d"] = ((current_price - price_7d_ago) / price_7d_ago) * 100
        elif len(price_array) >= 7:  # Daily data
            price_7d_ago = price_array[-7]
            result["change_7d"] = ((current_price - price_7d_ago) / price_7d_ago) * 100
        
        return result
    
    @staticmethod
    def calculate_volatility(prices: List[float], period: int = 30) -> float:
        """
        Calculate price volatility (standard deviation of returns).
        
        Args:
            prices: List of historical prices
            period: Rolling period for calculation
            
        Returns:
            Annualized volatility percentage
        """
        if len(prices) < 2:
            return 0.0
        
        # Calculate daily returns
        returns = np.diff(prices) / prices[:-1]
        
        # Calculate standard deviation
        volatility = np.std(returns)
        
        # Annualize volatility (assuming daily data)
        annualized_volatility = volatility * np.sqrt(365) * 100
        
        return float(annualized_volatility)
    
    @staticmethod
    def calculate_moving_averages(
        prices: List[float],
        windows: List[int] = [7, 20, 50, 200]
    ) -> Dict[str, Optional[float]]:
        """
        Calculate simple moving averages for given windows.
        
        Args:
            prices: List of historical prices
            windows: List of window sizes for SMA
            
        Returns:
            Dict mapping window names to SMA values
        """
        if not prices:
            return {}
        
        df = pd.DataFrame({"price": prices})
        result = {}
        
        for window in windows:
            column_name = f"sma_{window}"
            if len(prices) >= window:
                sma = df["price"].rolling(window=window).mean()
                result[column_name] = float(sma.iloc[-1])
            else:
                result[column_name] = None
        
        return result
    
    @staticmethod
    def calculate_ema(
        prices: List[float],
        windows: List[int] = [12, 26]
    ) -> Dict[str, Optional[float]]:
        """
        Calculate exponential moving averages for given windows.
        
        Args:
            prices: List of historical prices
            windows: List of window sizes for EMA
            
        Returns:
            Dict mapping window names to EMA values
        """
        if not prices:
            return {}
        
        df = pd.DataFrame({"price": prices})
        result = {}
        
        for window in windows:
            column_name = f"ema_{window}"
            if len(prices) >= window:
                ema = df["price"].ewm(span=window, adjust=False).mean()
                result[column_name] = float(ema.iloc[-1])
            else:
                result[column_name] = None
        
        return result
    
    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> Optional[float]:
        """
        Calculate Relative Strength Index (RSI).
        
        Args:
            prices: List of historical prices
            period: RSI period (typically 14)
            
        Returns:
            RSI value (0-100) or None if insufficient data
        """
        if len(prices) < period + 1:
            return None
        
        # Calculate price changes
        changes = np.diff(prices)
        
        # Separate gains and losses
        gains = np.where(changes > 0, changes, 0)
        losses = np.where(changes < 0, -changes, 0)
        
        # Calculate average gain and loss
        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return float(rsi)
    
    @staticmethod
    def analyze_portfolio_performance(
        holdings: List[Dict[str, Any]],
        prices: Dict[str, float],
        historical_prices: Dict[str, List[float]] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive portfolio performance analysis.
        
        Args:
            holdings: List of portfolio holdings
            prices: Current prices
            historical_prices: Optional historical price data per crypto
            
        Returns:
            Complete portfolio analysis results
        """
        service = AnalyticsService
        
        # Basic calculations
        portfolio_value = service.calculate_portfolio_value(holdings, prices)
        pnl = service.calculate_pnl(holdings, prices)
        allocation = service.calculate_allocation(holdings, prices)
        
        result = {
            "portfolio": portfolio_value,
            "pnl": pnl,
            "allocation": allocation,
            "timestamp": datetime.now().isoformat(),
        }
        
        # Add technical analysis if historical data available
        if historical_prices:
            technicals = {}
            for crypto_id, hist_prices in historical_prices.items():
                if hist_prices:
                    technicals[crypto_id] = {
                        "sma": service.calculate_moving_averages(hist_prices),
                        "ema": service.calculate_ema(hist_prices),
                        "rsi": service.calculate_rsi(hist_prices),
                        "volatility": service.calculate_volatility(hist_prices),
                    }
            result["technicals"] = technicals
        
        return result


# Create singleton instance
analytics_service = AnalyticsService()
