"""
Crypto Tracker Backend - Portfolio Schemas

Pydantic models for portfolio data validation and serialization.
"""

from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field


class HoldingBase(BaseModel):
    """Base schema for holdings."""
    
    crypto_id: str = Field(..., description="Cryptocurrency ID (e.g., 'bitcoin')")
    crypto_symbol: str = Field(..., description="Cryptocurrency symbol (e.g., 'btc')")
    crypto_name: str = Field(..., description="Cryptocurrency name (e.g., 'Bitcoin')")
    quantity: Decimal = Field(..., gt=0, description="Amount of cryptocurrency")
    purchase_price: Decimal = Field(..., gt=0, description="Price per unit at purchase")
    purchase_date: Optional[datetime] = Field(None, description="Date of purchase")
    notes: Optional[str] = Field(None, description="Optional notes")


class HoldingCreate(HoldingBase):
    """Schema for creating a new holding."""
    pass


class HoldingUpdate(BaseModel):
    """Schema for updating a holding."""
    
    quantity: Optional[Decimal] = Field(None, gt=0)
    purchase_price: Optional[Decimal] = Field(None, gt=0)
    purchase_date: Optional[datetime] = None
    notes: Optional[str] = None


class HoldingResponse(HoldingBase):
    """Schema for holding response with computed fields."""
    
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    pnl: Optional[float] = None
    pnl_percentage: Optional[float] = None
    
    class Config:
        from_attributes = True


class PortfolioSummary(BaseModel):
    """Summary of user's portfolio."""
    
    total_value: float
    total_cost: float
    total_pnl: float
    total_pnl_percentage: float
    holdings_count: int
    last_updated: datetime


class PortfolioAllocation(BaseModel):
    """Allocation breakdown for a cryptocurrency."""
    
    crypto_id: str
    crypto_name: str
    crypto_symbol: str
    value: float
    allocation_percentage: float


class PortfolioResponse(BaseModel):
    """Complete portfolio response."""
    
    summary: PortfolioSummary
    allocations: List[PortfolioAllocation]
    holdings: List[HoldingResponse]


class TransactionBase(BaseModel):
    """Base schema for transactions."""
    
    crypto_id: str
    transaction_type: str = Field(..., pattern="^(buy|sell|transfer)$")
    quantity: Decimal = Field(..., gt=0)
    price_at_transaction: Decimal = Field(..., gt=0)
    fee: Optional[Decimal] = Field(0, ge=0)
    notes: Optional[str] = None
    executed_at: Optional[datetime] = None


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    pass


class TransactionResponse(TransactionBase):
    """Schema for transaction response."""
    
    id: UUID
    user_id: UUID
    holding_id: Optional[UUID] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
