'use client';

/**
 * Alerts Page
 * 
 * Price alerts management with create/edit/delete
 */

import { useState, useEffect } from 'react';
import { cryptoApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import styles from './page.module.css';

// Force dynamic rendering - skip static prerendering
export const dynamic = 'force-dynamic';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);

    useEffect(() => {
        fetchAlerts();
    }, []);

    async function fetchAlerts() {
        try {
            setLoading(true);
            // TODO: Implement alerts API
            // const response = await alertsApi.getAll();
            // setAlerts(response.data || []);

            // Demo data
            setAlerts([
                {
                    id: 1,
                    crypto_id: 'bitcoin',
                    crypto_name: 'Bitcoin',
                    crypto_symbol: 'BTC',
                    crypto_image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
                    condition: 'above',
                    target_price: 100000,
                    current_price: 85432,
                    is_active: true,
                    created_at: new Date().toISOString(),
                },
                {
                    id: 2,
                    crypto_id: 'ethereum',
                    crypto_name: 'Ethereum',
                    crypto_symbol: 'ETH',
                    crypto_image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
                    condition: 'below',
                    target_price: 3000,
                    current_price: 3245,
                    is_active: true,
                    created_at: new Date().toISOString(),
                },
            ]);
        } catch (err) {
            console.error('Failed to fetch alerts:', err);
        } finally {
            setLoading(false);
        }
    }

    function handleEdit(alert) {
        setEditingAlert(alert);
        setShowModal(true);
    }

    function handleDelete(id) {
        if (confirm('Are you sure you want to delete this alert?')) {
            setAlerts(alerts.filter(a => a.id !== id));
        }
    }

    function toggleAlert(id) {
        setAlerts(alerts.map(a =>
            a.id === id ? { ...a, is_active: !a.is_active } : a
        ));
    }

    if (loading) {
        return <AlertsSkeleton />;
    }

    return (
        <div className={styles.alertsPage}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1>Price Alerts</h1>
                    <p>Get notified when cryptocurrencies reach your target prices</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditingAlert(null); setShowModal(true); }}
                >
                    + Create Alert
                </button>
            </div>

            {/* Active Alerts */}
            <section className={`card ${styles.alertsSection}`}>
                <div className="card-header">
                    <h2 className="card-title">Your Alerts ({alerts.length})</h2>
                </div>

                {alerts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>🔔</span>
                        <h3>No alerts yet</h3>
                        <p>Create your first price alert to get notified about market movements</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            Create Your First Alert
                        </button>
                    </div>
                ) : (
                    <div className={styles.alertsList}>
                        {alerts.map((alert) => (
                            <div key={alert.id} className={`${styles.alertCard} ${!alert.is_active ? styles.inactive : ''}`}>
                                <div className={styles.alertInfo}>
                                    <img src={alert.crypto_image} alt="" className={styles.alertLogo} />
                                    <div className={styles.alertDetails}>
                                        <div className={styles.alertName}>
                                            <span>{alert.crypto_name}</span>
                                            <span className={styles.alertSymbol}>{alert.crypto_symbol}</span>
                                        </div>
                                        <div className={styles.alertCondition}>
                                            Alert when price goes{' '}
                                            <span className={alert.condition === 'above' ? 'text-up' : 'text-down'}>
                                                {alert.condition}
                                            </span>{' '}
                                            <strong>{formatCurrency(alert.target_price)}</strong>
                                        </div>
                                        <div className={styles.alertMeta}>
                                            Current: {formatCurrency(alert.current_price)} •
                                            Created {formatDate(alert.created_at, 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.alertProgress}>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={`${styles.progressFill} ${alert.condition === 'above' ? styles.above : styles.below}`}
                                            style={{
                                                width: alert.condition === 'above'
                                                    ? `${Math.min(100, (alert.current_price / alert.target_price) * 100)}%`
                                                    : `${Math.min(100, (alert.target_price / alert.current_price) * 100)}%`
                                            }}
                                        />
                                    </div>
                                    <span className={styles.progressLabel}>
                                        {alert.condition === 'above'
                                            ? `${((alert.target_price - alert.current_price) / alert.current_price * 100).toFixed(1)}% to target`
                                            : `${((alert.current_price - alert.target_price) / alert.current_price * 100).toFixed(1)}% above target`
                                        }
                                    </span>
                                </div>

                                <div className={styles.alertActions}>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={alert.is_active}
                                            onChange={() => toggleAlert(alert.id)}
                                        />
                                        <span className={styles.toggleSlider}></span>
                                    </label>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => handleEdit(alert)}
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => handleDelete(alert.id)}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Create/Edit Modal */}
            {showModal && (
                <AlertModal
                    alert={editingAlert}
                    onClose={() => {
                        setShowModal(false);
                        setEditingAlert(null);
                    }}
                    onSave={(newAlert) => {
                        if (editingAlert) {
                            setAlerts(alerts.map(a => a.id === editingAlert.id ? { ...a, ...newAlert } : a));
                        } else {
                            setAlerts([...alerts, { ...newAlert, id: Date.now(), is_active: true, created_at: new Date().toISOString() }]);
                        }
                        setShowModal(false);
                        setEditingAlert(null);
                    }}
                />
            )}
        </div>
    );
}

// Alert Modal
function AlertModal({ alert, onClose, onSave }) {
    const [searchQuery, setSearchQuery] = useState(alert?.crypto_name || '');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCrypto, setSelectedCrypto] = useState(alert ? {
        id: alert.crypto_id,
        name: alert.crypto_name,
        symbol: alert.crypto_symbol,
        thumb: alert.crypto_image,
    } : null);
    const [condition, setCondition] = useState(alert?.condition || 'above');
    const [targetPrice, setTargetPrice] = useState(alert?.target_price?.toString() || '');
    const [loading, setLoading] = useState(false);

    async function handleSearch(query) {
        setSearchQuery(query);
        if (query.length >= 2) {
            try {
                const response = await cryptoApi.search(query);
                setSearchResults(response.coins?.slice(0, 5) || []);
            } catch (err) {
                console.error('Search failed:', err);
            }
        } else {
            setSearchResults([]);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!selectedCrypto || !targetPrice) return;

        onSave({
            crypto_id: selectedCrypto.id,
            crypto_name: selectedCrypto.name,
            crypto_symbol: selectedCrypto.symbol,
            crypto_image: selectedCrypto.thumb || selectedCrypto.large,
            condition,
            target_price: parseFloat(targetPrice),
            current_price: 0, // Will be updated by backend
        });
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{alert ? 'Edit Alert' : 'Create Alert'}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    {/* Crypto Search */}
                    <div className={styles.formGroup}>
                        <label>Cryptocurrency</label>
                        <input
                            type="text"
                            placeholder="Search cryptocurrency..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="input"
                        />
                        {searchResults.length > 0 && !selectedCrypto && (
                            <div className={styles.searchDropdown}>
                                {searchResults.map((crypto) => (
                                    <button
                                        type="button"
                                        key={crypto.id}
                                        className={styles.searchItem}
                                        onClick={() => {
                                            setSelectedCrypto(crypto);
                                            setSearchQuery(crypto.name);
                                            setSearchResults([]);
                                        }}
                                    >
                                        <img src={crypto.thumb} alt="" className={styles.searchThumb} />
                                        <span>{crypto.name}</span>
                                        <span className={styles.searchSymbol}>{crypto.symbol?.toUpperCase()}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {selectedCrypto && (
                            <div className={styles.selectedItem}>
                                <img src={selectedCrypto.thumb} alt="" />
                                <span>{selectedCrypto.name}</span>
                                <button type="button" onClick={() => {
                                    setSelectedCrypto(null);
                                    setSearchQuery('');
                                }}>×</button>
                            </div>
                        )}
                    </div>

                    {/* Condition */}
                    <div className={styles.formGroup}>
                        <label>Alert Condition</label>
                        <div className={styles.conditionButtons}>
                            <button
                                type="button"
                                className={`${styles.conditionBtn} ${condition === 'above' ? styles.active : ''}`}
                                onClick={() => setCondition('above')}
                            >
                                📈 Price goes above
                            </button>
                            <button
                                type="button"
                                className={`${styles.conditionBtn} ${condition === 'below' ? styles.active : ''}`}
                                onClick={() => setCondition('below')}
                            >
                                📉 Price goes below
                            </button>
                        </div>
                    </div>

                    {/* Target Price */}
                    <div className={styles.formGroup}>
                        <label>Target Price (USD)</label>
                        <input
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            className="input"
                            required
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!selectedCrypto || !targetPrice}
                        >
                            {alert ? 'Update Alert' : 'Create Alert'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Skeleton
function AlertsSkeleton() {
    return (
        <div className={styles.alertsPage}>
            <div className={styles.pageHeader}>
                <div>
                    <div className="skeleton" style={{ width: 150, height: 32, marginBottom: 8 }} />
                    <div className="skeleton" style={{ width: 300, height: 16 }} />
                </div>
            </div>
            <div className="card skeleton" style={{ height: 300 }} />
        </div>
    );
}
