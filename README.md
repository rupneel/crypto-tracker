# 🚀 Crypto Tracker

A full-stack cryptocurrency tracking application with real-time updates, portfolio management, and analytics.

![Crypto Tracker](https://img.shields.io/badge/Made%20with-❤️-red) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)

## ✨ Features

- 📊 **Dashboard** - Market overview with trending coins and top gainers/losers
- 💰 **Cryptocurrency List** - Search, sort, and filter all cryptocurrencies
- 📈 **Price Charts** - Interactive charts with multiple time ranges
- 💼 **Portfolio Tracker** - Track holdings, P&L, and allocation
- 🔔 **Price Alerts** - Get notified when prices hit targets
- ⚡ **Real-time Updates** - WebSocket-powered live prices

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework
- **Recharts** - Interactive charts
- **Zustand** - State management
- **CSS Modules** - Scoped styling

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - Database ORM
- **WebSocket** - Real-time updates
- **CoinGecko API** - Crypto data

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend/crypto-tracker-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
crypto-tracker/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes & WebSocket
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── main.py        # FastAPI app
│   └── requirements.txt
├── frontend/
│   └── crypto-tracker-frontend/
│       ├── src/
│       │   ├── app/       # Next.js pages
│       │   ├── components/# React components
│       │   ├── lib/       # Utilities & API client
│       │   └── store/     # Zustand stores
│       └── package.json
└── README.md
```

## 📸 Screenshots

### Dashboard
Market overview with trending coins and price changes

### Cryptocurrency List
Sortable table with search and sparkline charts

### Crypto Detail
Interactive price charts and market statistics

### Portfolio
Holdings tracker with P&L and allocation chart

## 🔗 API Documentation

See [backend/README.md](backend/README.md) for full API documentation.

## 📄 License

MIT License - feel free to use this project for learning or personal projects.

---

Made with ❤️ for crypto enthusiasts
