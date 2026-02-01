/**
 * Crypto Store - Zustand State Management
 * 
 * Global state for cryptocurrency data and real-time updates
 */

import { create } from 'zustand';
import { wsClient } from '@/lib/websocket';
import { cryptoApi } from '@/lib/api';

export const useCryptoStore = create((set, get) => ({
    // Cryptocurrency data
    cryptos: [],
    trendingCryptos: [],
    marketStats: null,
    selectedCrypto: null,

    // Loading states
    loading: false,
    error: null,

    // WebSocket connection status
    wsConnected: false,
    lastUpdate: null,

    // Actions
    setCryptos: (cryptos) => set({ cryptos }),
    setTrending: (trendingCryptos) => set({ trendingCryptos }),
    setMarketStats: (marketStats) => set({ marketStats }),
    setSelectedCrypto: (selectedCrypto) => set({ selectedCrypto }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Fetch all cryptocurrencies
    fetchCryptos: async (params = {}) => {
        try {
            set({ loading: true, error: null });
            const response = await cryptoApi.getAll(params);
            set({ cryptos: response.data || [], loading: false });
        } catch (error) {
            console.error('Failed to fetch cryptos:', error);
            set({ error: 'Failed to load cryptocurrencies', loading: false });
        }
    },

    // Fetch trending cryptocurrencies
    fetchTrending: async () => {
        try {
            const response = await cryptoApi.getTrending();
            set({ trendingCryptos: response.coins || [] });
        } catch (error) {
            console.error('Failed to fetch trending:', error);
        }
    },

    // Fetch market stats
    fetchMarketStats: async () => {
        try {
            const response = await cryptoApi.getGlobalStats();
            set({ marketStats: response.data || null });
        } catch (error) {
            console.error('Failed to fetch market stats:', error);
        }
    },

    // Fetch single cryptocurrency
    fetchCryptoById: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await cryptoApi.getById(id);
            set({ selectedCrypto: response, loading: false });
            return response;
        } catch (error) {
            console.error('Failed to fetch crypto:', error);
            set({ error: 'Failed to load cryptocurrency', loading: false });
            return null;
        }
    },

    // Update crypto prices from WebSocket
    updatePrices: (priceData) => {
        const { cryptos } = get();
        if (!priceData || !cryptos.length) return;

        const priceMap = new Map(priceData.map(p => [p.id, p]));

        const updatedCryptos = cryptos.map(crypto => {
            const update = priceMap.get(crypto.id);
            if (update) {
                return {
                    ...crypto,
                    current_price: update.current_price,
                    price_change_percentage_24h: update.price_change_24h,
                    market_cap: update.market_cap || crypto.market_cap,
                };
            }
            return crypto;
        });

        set({
            cryptos: updatedCryptos,
            lastUpdate: new Date().toISOString(),
        });
    },

    // WebSocket connection
    connectWebSocket: () => {
        wsClient.connect();

        wsClient.on('connected', () => {
            set({ wsConnected: true });
        });

        wsClient.on('disconnected', () => {
            set({ wsConnected: false });
        });

        wsClient.on('priceUpdate', (data) => {
            get().updatePrices(data);
        });

        wsClient.on('coinUpdate', (data) => {
            const { selectedCrypto } = get();
            if (selectedCrypto && selectedCrypto.id === data.id) {
                set({
                    selectedCrypto: {
                        ...selectedCrypto,
                        market_data: {
                            ...selectedCrypto.market_data,
                            current_price: {
                                ...selectedCrypto.market_data?.current_price,
                                usd: data.current_price,
                            },
                        },
                    },
                });
            }
        });
    },

    disconnectWebSocket: () => {
        wsClient.disconnect();
        set({ wsConnected: false });
    },

    // Subscribe to specific coins
    subscribeToCoin: (cryptoId) => {
        wsClient.subscribe([cryptoId]);
    },

    unsubscribeFromCoin: (cryptoId) => {
        wsClient.unsubscribe([cryptoId]);
    },
}));

// Portfolio store
export const usePortfolioStore = create((set, get) => ({
    holdings: [],
    analytics: null,
    loading: false,
    error: null,

    setHoldings: (holdings) => set({ holdings }),
    setAnalytics: (analytics) => set({ analytics }),

    // Calculate totals
    get totalValue() {
        return get().holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    },

    get totalPnL() {
        return get().holdings.reduce((sum, h) => sum + (h.pnl || 0), 0);
    },

    // Update holding values from price updates
    updateHoldingPrices: (priceData) => {
        const { holdings } = get();
        if (!priceData || !holdings.length) return;

        const priceMap = new Map(priceData.map(p => [p.id, p]));

        const updatedHoldings = holdings.map(holding => {
            const update = priceMap.get(holding.crypto_id);
            if (update) {
                const currentValue = holding.quantity * update.current_price;
                const costBasis = holding.quantity * holding.average_buy_price;
                const pnl = currentValue - costBasis;
                const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

                return {
                    ...holding,
                    current_price: update.current_price,
                    current_value: currentValue,
                    pnl,
                    pnl_percent: pnlPercent,
                    price_change_24h: update.price_change_24h,
                };
            }
            return holding;
        });

        set({ holdings: updatedHoldings });
    },
}));
