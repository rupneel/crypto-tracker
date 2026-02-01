"""
Crypto Tracker Backend - Price Alert Model

SQLAlchemy model for price alerts.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class PriceAlert(Base):
    """Price alert for cryptocurrency."""
    
    __tablename__ = "price_alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    crypto_id = Column(String(100), nullable=False, index=True)
    crypto_symbol = Column(String(20), nullable=False)
    target_price = Column(Numeric(precision=20, scale=10), nullable=False)
    condition = Column(String(10), nullable=False)  # "above" or "below"
    is_active = Column(Boolean, default=True)
    is_triggered = Column(Boolean, default=False)
    triggered_at = Column(DateTime, nullable=True)
    triggered_price = Column(Numeric(precision=20, scale=10), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="alerts")
    
    def __repr__(self):
        return f"<PriceAlert {self.crypto_symbol} {self.condition} {self.target_price}>"
    
    def check_trigger(self, current_price: Decimal) -> bool:
        """Check if alert should be triggered based on current price."""
        if not self.is_active or self.is_triggered:
            return False
        
        if self.condition == "above":
            return current_price >= self.target_price
        elif self.condition == "below":
            return current_price <= self.target_price
        return False
