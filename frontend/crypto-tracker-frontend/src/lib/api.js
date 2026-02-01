/**
 * Crypto Tracker - API Client
 * 
 * Axios client configured for backend communication
 */

import axios from 'axios';

// Base API URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for auth token
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
            // Token expired or invalid
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

// Crypto API endpoints
export const cryptoApi = {
    // Get list of cryptocurrencies
    getAll: async (params = {}) => {
        const { page = 1, perPage = 50, vsCurrency = 'usd', order = 'market_cap_desc' } = params;
        const response = await api.get('/api/v1/cryptos/', {
            params: { page, per_page: perPage, vs_currency: vsCurrency, order },
        });
        return response.data;
    },

    // Get single cryptocurrency details
    getById: async (id) => {
        const response = await api.get(`/api/v1/cryptos/${id}`);
        return response.data;
    },

    // Get price history for charts
    getHistory: async (id, days = '7', vsCurrency = 'usd') => {
        const response = await api.get(`/api/v1/cryptos/${id}/history`, {
            params: { days, vs_currency: vsCurrency },
        });
        return response.data;
    },

    // Search cryptocurrencies
    search: async (query) => {
        const response = await api.get('/api/v1/cryptos/search', {
            params: { query },
        });
        return response.data;
    },

    // Get trending cryptocurrencies
    getTrending: async () => {
        const response = await api.get('/api/v1/cryptos/trending');
        return response.data;
    },

    // Get global market stats
    getGlobalStats: async () => {
        const response = await api.get('/api/v1/cryptos/market/global');
        return response.data;
    },
};

// Portfolio API endpoints
export const portfolioApi = {
    // Get user's portfolio
    get: async () => {
        const response = await api.get('/api/v1/portfolio/');
        return response.data;
    },

    // Get all holdings
    getHoldings: async () => {
        const response = await api.get('/api/v1/portfolio/holdings');
        return response.data;
    },

    // Add new holding
    addHolding: async (data) => {
        const response = await api.post('/api/v1/portfolio/holdings', data);
        return response.data;
    },

    // Update holding
    updateHolding: async (id, data) => {
        const response = await api.put(`/api/v1/portfolio/holdings/${id}`, data);
        return response.data;
    },

    // Delete holding
    deleteHolding: async (id) => {
        const response = await api.delete(`/api/v1/portfolio/holdings/${id}`);
        return response.data;
    },

    // Get portfolio analytics
    getAnalytics: async () => {
        const response = await api.get('/api/v1/portfolio/analytics');
        return response.data;
    },
};

export default api;
