"""
Crypto Tracker Backend - Portfolio Models

SQLAlchemy models for portfolio and holdings tracking.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Holding(Base):
    """Individual cryptocurrency holding in a portfolio."""
    
    __tablename__ = "holdings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    crypto_id = Column(String(100), nullable=False, index=True)  # e.g., "bitcoin"
    crypto_symbol = Column(String(20), nullable=False)  # e.g., "btc"
    crypto_name = Column(String(100), nullable=False)  # e.g., "Bitcoin"
    quantity = Column(Numeric(precision=20, scale=10), nullable=False)
    purchase_price = Column(Numeric(precision=20, scale=10), nullable=False)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="holdings")
    
    def __repr__(self):
        return f"<Holding {self.crypto_symbol}: {self.quantity}>"
    
    @property
    def cost_basis(self) -> Decimal:
        """Calculate total cost basis for this holding."""
        return self.quantity * self.purchase_price


class Transaction(Base):
    """Transaction history for portfolio changes."""
    
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    holding_id = Column(UUID(as_uuid=True), ForeignKey("holdings.id", ondelete="SET NULL"), nullable=True)
    crypto_id = Column(String(100), nullable=False)
    transaction_type = Column(String(20), nullable=False)  # "buy", "sell", "transfer"
    quantity = Column(Numeric(precision=20, scale=10), nullable=False)
    price_at_transaction = Column(Numeric(precision=20, scale=10), nullable=False)
    fee = Column(Numeric(precision=20, scale=10), default=0)
    notes = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Transaction {self.transaction_type} {self.quantity} {self.crypto_id}>"
