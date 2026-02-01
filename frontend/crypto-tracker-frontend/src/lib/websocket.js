/**
 * Crypto Tracker - WebSocket Client
 * 
 * Real-time price updates via WebSocket connection
 */

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.listeners = new Map();
        this.isConnected = false;
    }

    connect(url = null) {
        const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.emit('connected', null);
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e);
                }
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.emit('disconnected', null);
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay);
        } else {
            console.log('Max reconnection attempts reached');
            this.emit('maxReconnectAttemptsReached', null);
        }
    }

    handleMessage(message) {
        const { type, data } = message;

        switch (type) {
            case 'price_update':
                this.emit('priceUpdate', data);
                break;
            case 'coin_update':
                this.emit('coinUpdate', data);
                break;
            case 'subscribed':
                this.emit('subscribed', data);
                break;
            case 'unsubscribed':
                this.emit('unsubscribed', data);
                break;
            case 'pong':
                this.emit('pong', data);
                break;
            default:
                this.emit('message', message);
        }
    }

    send(action, data = {}) {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({ action, ...data }));
        } else {
            console.warn('WebSocket not connected, cannot send message');
        }
    }

    subscribe(cryptoIds) {
        this.send('subscribe', { crypto_ids: cryptoIds });
    }

    unsubscribe(cryptoIds) {
        this.send('unsubscribe', { crypto_ids: cryptoIds });
    }

    ping() {
        this.send('ping');
    }

    // Event listener management
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach((callback) => {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`Error in WebSocket listener for ${event}:`, e);
                }
            });
        }
    }
}

// Export singleton instance
export const wsClient = new WebSocketClient();
export default WebSocketClient;
