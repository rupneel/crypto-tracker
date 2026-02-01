"""
Crypto Tracker Backend - WebSocket Handler

WebSocket connection manager for real-time price updates.
"""

import asyncio
import json
from typing import Dict, Set, List, Any
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

from app.services.crypto_service import crypto_service


class ConnectionManager:
    """Manages WebSocket connections and message broadcasting."""
    
    def __init__(self):
        # Active connections mapped by client ID
        self.active_connections: Dict[str, WebSocket] = {}
        # Subscriptions: crypto_id -> set of client IDs
        self.subscriptions: Dict[str, Set[str]] = {}
        # Price update task
        self._price_update_task: asyncio.Task = None
        self._running = False
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")
        
        # Start price updates if not running
        if not self._running:
            self._running = True
            self._price_update_task = asyncio.create_task(self._broadcast_price_updates())
    
    def disconnect(self, client_id: str):
        """Remove a WebSocket connection."""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        
        # Remove from all subscriptions
        for crypto_id in list(self.subscriptions.keys()):
            self.subscriptions[crypto_id].discard(client_id)
            if not self.subscriptions[crypto_id]:
                del self.subscriptions[crypto_id]
        
        print(f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}")
        
        # Stop price updates if no connections
        if not self.active_connections:
            self._running = False
            if self._price_update_task:
                self._price_update_task.cancel()
    
    def subscribe(self, client_id: str, crypto_ids: List[str]):
        """Subscribe a client to specific cryptocurrencies."""
        for crypto_id in crypto_ids:
            if crypto_id not in self.subscriptions:
                self.subscriptions[crypto_id] = set()
            self.subscriptions[crypto_id].add(client_id)
    
    def unsubscribe(self, client_id: str, crypto_ids: List[str]):
        """Unsubscribe a client from specific cryptocurrencies."""
        for crypto_id in crypto_ids:
            if crypto_id in self.subscriptions:
                self.subscriptions[crypto_id].discard(client_id)
    
    async def send_personal_message(self, message: dict, client_id: str):
        """Send a message to a specific client."""
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error sending to {client_id}: {e}")
                self.disconnect(client_id)
    
    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients."""
        disconnected = []
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to {client_id}: {e}")
                disconnected.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected:
            self.disconnect(client_id)
    
    async def broadcast_to_subscribers(self, crypto_id: str, message: dict):
        """Broadcast a message to clients subscribed to a specific crypto."""
        if crypto_id not in self.subscriptions:
            return
        
        disconnected = []
        for client_id in self.subscriptions[crypto_id]:
            if client_id in self.active_connections:
                try:
                    await self.active_connections[client_id].send_json(message)
                except Exception as e:
                    print(f"Error sending to subscriber {client_id}: {e}")
                    disconnected.append(client_id)
        
        for client_id in disconnected:
            self.disconnect(client_id)
    
    async def _broadcast_price_updates(self):
        """Background task to broadcast price updates periodically."""
        while self._running:
            try:
                # Fetch top cryptocurrencies
                cryptos = await crypto_service.get_all_cryptos(per_page=50)
                
                # Create price update message
                price_data = [
                    {
                        "id": c["id"],
                        "symbol": c["symbol"],
                        "name": c["name"],
                        "current_price": c["current_price"],
                        "price_change_24h": c.get("price_change_percentage_24h"),
                        "market_cap": c.get("market_cap"),
                    }
                    for c in cryptos
                ]
                
                message = {
                    "type": "price_update",
                    "data": price_data,
                    "timestamp": datetime.utcnow().isoformat(),
                }
                
                # Broadcast to all connected clients
                await self.broadcast(message)
                
                # Also send targeted updates to subscribers
                for crypto in cryptos:
                    if crypto["id"] in self.subscriptions:
                        await self.broadcast_to_subscribers(
                            crypto["id"],
                            {
                                "type": "coin_update",
                                "data": {
                                    "id": crypto["id"],
                                    "symbol": crypto["symbol"],
                                    "current_price": crypto["current_price"],
                                    "price_change_24h": crypto.get("price_change_percentage_24h"),
                                },
                                "timestamp": datetime.utcnow().isoformat(),
                            }
                        )
                
                # Wait 10 seconds before next update
                await asyncio.sleep(10)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Error in price update task: {e}")
                await asyncio.sleep(5)


# Global connection manager
manager = ConnectionManager()


async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint handler."""
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            # Receive and process client messages
            data = await websocket.receive_json()
            
            action = data.get("action")
            
            if action == "subscribe":
                crypto_ids = data.get("crypto_ids", [])
                manager.subscribe(client_id, crypto_ids)
                await manager.send_personal_message(
                    {
                        "type": "subscribed",
                        "crypto_ids": crypto_ids,
                    },
                    client_id
                )
            
            elif action == "unsubscribe":
                crypto_ids = data.get("crypto_ids", [])
                manager.unsubscribe(client_id, crypto_ids)
                await manager.send_personal_message(
                    {
                        "type": "unsubscribed",
                        "crypto_ids": crypto_ids,
                    },
                    client_id
                )
            
            elif action == "ping":
                await manager.send_personal_message(
                    {"type": "pong", "timestamp": datetime.utcnow().isoformat()},
                    client_id
                )
    
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error for {client_id}: {e}")
        manager.disconnect(client_id)
