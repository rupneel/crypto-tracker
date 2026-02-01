# Crypto Tracker Backend

A FastAPI-based backend for cryptocurrency tracking with real-time updates, portfolio management, and analytics.

## Features

- 📈 **Real-time Crypto Data**: Fetches data from CoinGecko API
- 🔄 **WebSocket Support**: Real-time price updates every 10 seconds
- 💼 **Portfolio Management**: Track holdings, P&L, and allocations
- 📊 **Analytics**: Financial calculations (ROI, SMA, EMA, RSI, volatility)
- 🔔 **Price Alerts**: Create alerts for price targets
- 🗃️ **PostgreSQL Database**: Persistent storage with SQLAlchemy ORM

## Tech Stack

- **FastAPI** - Modern, high-performance web framework
- **SQLAlchemy** - Database ORM
- **Pydantic** - Data validation
- **httpx** - Async HTTP client
- **pandas/numpy** - Data analysis and calculations

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Cryptocurrencies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cryptos/` | List all cryptocurrencies |
| GET | `/api/v1/cryptos/{id}` | Get cryptocurrency details |
| GET | `/api/v1/cryptos/{id}/history` | Get price history |
| GET | `/api/v1/cryptos/search` | Search cryptocurrencies |
| GET | `/api/v1/cryptos/trending` | Get trending coins |
| GET | `/api/v1/cryptos/market/global` | Get global market stats |

### Portfolio

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/portfolio/` | Get portfolio with summary |
| GET | `/api/v1/portfolio/holdings` | List all holdings |
| POST | `/api/v1/portfolio/holdings` | Add new holding |
| PUT | `/api/v1/portfolio/holdings/{id}` | Update holding |
| DELETE | `/api/v1/portfolio/holdings/{id}` | Delete holding |
| GET | `/api/v1/portfolio/analytics` | Get portfolio analytics |

### WebSocket

Connect to `/ws/{client_id}` or `/ws` for real-time price updates.

**Messages:**

```json
// Subscribe to specific coins
{ "action": "subscribe", "crypto_ids": ["bitcoin", "ethereum"] }

// Unsubscribe
{ "action": "unsubscribe", "crypto_ids": ["bitcoin"] }

// Ping
{ "action": "ping" }
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── crypto.py      # Crypto API routes
│   │   │   └── portfolio.py   # Portfolio API routes
│   │   └── websocket.py       # WebSocket handler
│   ├── models/
│   │   └── database.py        # SQLAlchemy models
│   ├── schemas/
│   │   ├── crypto.py          # Crypto Pydantic schemas
│   │   └── portfolio.py       # Portfolio Pydantic schemas
│   ├── services/
│   │   ├── crypto_service.py  # CoinGecko API client
│   │   └── analytics_service.py # Financial calculations
│   ├── config.py              # App configuration
│   └── main.py                # FastAPI application
├── requirements.txt
├── .env.example
└── README.md
```

## Configuration

Environment variables (`.env`):

```env
APP_NAME="Crypto Tracker API"
DEBUG=false
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=["http://localhost:3000"]
DATABASE_URL=postgresql://user:pass@localhost:5432/cryptotracker
REDIS_URL=redis://localhost:6379/0
COINGECKO_API_KEY=your_api_key (optional)
```

## License

MIT
