"""
Crypto Tracker Backend - Portfolio Routes

REST API endpoints for portfolio management.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.database import get_db
from app.models.portfolio import Holding, Transaction
from app.schemas.portfolio import (
    HoldingCreate,
    HoldingUpdate,
    HoldingResponse,
    PortfolioSummary,
    PortfolioAllocation,
    PortfolioResponse,
    TransactionCreate,
    TransactionResponse,
)
from app.services.crypto_service import crypto_service
from app.services.analytics_service import analytics_service

router = APIRouter()


# Temporary user ID for testing (will be replaced with auth)
TEMP_USER_ID = UUID("00000000-0000-0000-0000-000000000001")


@router.get("/", response_model=PortfolioResponse)
async def get_portfolio(
    db: AsyncSession = Depends(get_db),
):
    """
    Get user's complete portfolio with summary and holdings.
    """
    try:
        # Get all holdings for user
        result = await db.execute(
            select(Holding).where(Holding.user_id == TEMP_USER_ID)
        )
        holdings = result.scalars().all()
        
        if not holdings:
            return PortfolioResponse(
                summary=PortfolioSummary(
                    total_value=0,
                    total_cost=0,
                    total_pnl=0,
                    total_pnl_percentage=0,
                    holdings_count=0,
                    last_updated=datetime.utcnow(),
                ),
                allocations=[],
                holdings=[],
            )
        
        # Get current prices for all crypto IDs
        crypto_ids = list(set(h.crypto_id for h in holdings))
        prices = {}
        
        # Fetch prices from service
        all_cryptos = await crypto_service.get_all_cryptos(per_page=250)
        for crypto in all_cryptos:
            if crypto["id"] in crypto_ids:
                prices[crypto["id"]] = crypto["current_price"]
        
        # Convert holdings to dict format for analytics
        holdings_data = [
            {
                "crypto_id": h.crypto_id,
                "quantity": float(h.quantity),
                "purchase_price": float(h.purchase_price),
            }
            for h in holdings
        ]
        
        # Calculate analytics
        pnl_data = analytics_service.calculate_pnl(holdings_data, prices)
        allocations = analytics_service.calculate_allocation(holdings_data, prices)
        
        # Build response
        holding_responses = []
        for i, h in enumerate(holdings):
            current_price = prices.get(h.crypto_id, 0)
            current_value = float(h.quantity) * current_price
            cost = float(h.quantity) * float(h.purchase_price)
            pnl = current_value - cost
            pnl_pct = (pnl / cost * 100) if cost > 0 else 0
            
            holding_responses.append(HoldingResponse(
                id=h.id,
                user_id=h.user_id,
                crypto_id=h.crypto_id,
                crypto_symbol=h.crypto_symbol,
                crypto_name=h.crypto_name,
                quantity=h.quantity,
                purchase_price=h.purchase_price,
                purchase_date=h.purchase_date,
                notes=h.notes,
                created_at=h.created_at,
                updated_at=h.updated_at,
                current_price=current_price,
                current_value=current_value,
                pnl=pnl,
                pnl_percentage=pnl_pct,
            ))
        
        allocation_responses = [
            PortfolioAllocation(
                crypto_id=a["crypto_id"],
                crypto_name=next((h.crypto_name for h in holdings if h.crypto_id == a["crypto_id"]), ""),
                crypto_symbol=next((h.crypto_symbol for h in holdings if h.crypto_id == a["crypto_id"]), ""),
                value=a["value"],
                allocation_percentage=a["allocation_percentage"],
            )
            for a in allocations
        ]
        
        return PortfolioResponse(
            summary=PortfolioSummary(
                total_value=pnl_data["total_value"],
                total_cost=pnl_data["total_cost"],
                total_pnl=pnl_data["total_pnl"],
                total_pnl_percentage=pnl_data["total_pnl_percentage"],
                holdings_count=len(holdings),
                last_updated=datetime.utcnow(),
            ),
            allocations=allocation_responses,
            holdings=holding_responses,
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/holdings", response_model=List[HoldingResponse])
async def get_holdings(
    db: AsyncSession = Depends(get_db),
):
    """
    Get all holdings for the current user.
    """
    result = await db.execute(
        select(Holding).where(Holding.user_id == TEMP_USER_ID)
    )
    holdings = result.scalars().all()
    return holdings


@router.post("/holdings", response_model=HoldingResponse)
async def create_holding(
    holding: HoldingCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Add a new cryptocurrency holding to portfolio.
    """
    try:
        new_holding = Holding(
            user_id=TEMP_USER_ID,
            crypto_id=holding.crypto_id,
            crypto_symbol=holding.crypto_symbol,
            crypto_name=holding.crypto_name,
            quantity=holding.quantity,
            purchase_price=holding.purchase_price,
            purchase_date=holding.purchase_date or datetime.utcnow(),
            notes=holding.notes,
        )
        db.add(new_holding)
        await db.commit()
        await db.refresh(new_holding)
        return new_holding
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/holdings/{holding_id}", response_model=HoldingResponse)
async def get_holding(
    holding_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific holding by ID.
    """
    result = await db.execute(
        select(Holding).where(
            Holding.id == holding_id,
            Holding.user_id == TEMP_USER_ID
        )
    )
    holding = result.scalar_one_or_none()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    return holding


@router.put("/holdings/{holding_id}", response_model=HoldingResponse)
async def update_holding(
    holding_id: UUID,
    holding_update: HoldingUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Update an existing holding.
    """
    result = await db.execute(
        select(Holding).where(
            Holding.id == holding_id,
            Holding.user_id == TEMP_USER_ID
        )
    )
    holding = result.scalar_one_or_none()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    # Update fields if provided
    update_data = holding_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(holding, field, value)
    
    holding.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(holding)
    
    return holding


@router.delete("/holdings/{holding_id}")
async def delete_holding(
    holding_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a holding from portfolio.
    """
    result = await db.execute(
        select(Holding).where(
            Holding.id == holding_id,
            Holding.user_id == TEMP_USER_ID
        )
    )
    holding = result.scalar_one_or_none()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    await db.delete(holding)
    await db.commit()
    
    return {"message": "Holding deleted successfully"}


@router.get("/analytics")
async def get_portfolio_analytics(
    db: AsyncSession = Depends(get_db),
):
    """
    Get detailed portfolio analytics including technical indicators.
    """
    try:
        # Get holdings
        result = await db.execute(
            select(Holding).where(Holding.user_id == TEMP_USER_ID)
        )
        holdings = result.scalars().all()
        
        if not holdings:
            return {"message": "No holdings found"}
        
        # Get prices and historical data
        crypto_ids = list(set(h.crypto_id for h in holdings))
        prices = {}
        historical_prices = {}
        
        all_cryptos = await crypto_service.get_all_cryptos(per_page=250)
        for crypto in all_cryptos:
            if crypto["id"] in crypto_ids:
                prices[crypto["id"]] = crypto["current_price"]
                if "sparkline_in_7d" in crypto and crypto["sparkline_in_7d"]:
                    historical_prices[crypto["id"]] = crypto["sparkline_in_7d"].get("price", [])
        
        # Convert holdings to dict format
        holdings_data = [
            {
                "crypto_id": h.crypto_id,
                "quantity": float(h.quantity),
                "purchase_price": float(h.purchase_price),
            }
            for h in holdings
        ]
        
        # Get comprehensive analysis
        analysis = analytics_service.analyze_portfolio_performance(
            holdings_data,
            prices,
            historical_prices
        )
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
