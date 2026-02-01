'use client';

/**
 * Portfolio Page
 * 
 * Portfolio tracker with holdings, performance, and analytics
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { portfolioApi, cryptoApi } from '@/lib/api';
import { formatCurrency, formatPercentage, formatNumber, getPriceChangeClass, getChartColor } from '@/lib/utils';
import styles from './page.module.css';

// Force dynamic rendering - skip static prerendering
export const dynamic = 'force-dynamic';

export default function PortfolioPage() {
    const [portfolio, setPortfolio] = useState(null);
    const [holdings, setHoldings] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        fetchPortfolioData();
    }, []);

    async function fetchPortfolioData() {
        try {
            setLoading(true);
            const [portfolioRes, analyticsRes] = await Promise.all([
                portfolioApi.get(),
                portfolioApi.getAnalytics(),
            ]);
            setPortfolio(portfolioRes);
            setHoldings(portfolioRes.holdings || []);
            setAnalytics(analyticsRes);
        } catch (err) {
            console.error('Failed to fetch portfolio:', err);
            // Use demo data for display
            setHoldings([]);
            setAnalytics(null);
        } finally {
            setLoading(false);
        }
    }

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

    async function handleDeleteHolding(id) {
        if (confirm('Are you sure you want to remove this holding?')) {
            try {
                await portfolioApi.deleteHolding(id);
                fetchPortfolioData();
            } catch (err) {
                console.error('Failed to delete holding:', err);
            }
        }
    }

    // Calculate totals from holdings
    const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    const totalPnL = holdings.reduce((sum, h) => sum + (h.pnl || 0), 0);
    const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

    // Allocation data for pie chart
    const allocationData = holdings.map((h, i) => ({
        name: h.crypto_symbol?.toUpperCase() || h.name,
        value: h.current_value || 0,
        color: getChartColor(i),
    })).filter(d => d.value > 0);

    if (loading) {
        return <PortfolioSkeleton />;
    }

    return (
        <div className={styles.portfolioPage}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1>Portfolio</h1>
                    <p>Track your cryptocurrency holdings and performance</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    + Add Holding
                </button>
            </div>

            {/* Portfolio Summary */}
            <section className={styles.summary}>
                <div className={styles.summaryMain}>
                    <span className={styles.summaryLabel}>Total Portfolio Value</span>
                    <span className={styles.totalValue}>{formatCurrency(totalValue)}</span>
                    <span className={`${styles.totalChange} ${getPriceChangeClass(totalPnL)}`}>
                        {formatCurrency(totalPnL)} ({formatPercentage(totalPnLPercent)})
                    </span>
                </div>
                <div className={styles.summaryStats}>
                    <div className={styles.summaryStat}>
                        <span>Total Invested</span>
                        <span>{formatCurrency(totalValue - totalPnL)}</span>
                    </div>
                    <div className={styles.summaryStat}>
                        <span>Total P&L</span>
                        <span className={getPriceChangeClass(totalPnL)}>{formatCurrency(totalPnL)}</span>
                    </div>
                    <div className={styles.summaryStat}>
                        <span>Assets</span>
                        <span>{holdings.length}</span>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className={styles.contentGrid}>
                {/* Holdings Table */}
                <section className={`card ${styles.holdingsSection}`}>
                    <div className="card-header">
                        <h2 className="card-title">Holdings</h2>
                    </div>
                    {holdings.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>📊</span>
                            <h3>No holdings yet</h3>
                            <p>Start by adding your first cryptocurrency holding</p>
                            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                + Add Your First Holding
                            </button>
                        </div>
                    ) : (
                        <table className={styles.holdingsTable}>
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Price</th>
                                    <th>Holdings</th>
                                    <th>Avg Buy Price</th>
                                    <th>P&L</th>
                                    <th>Value</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {holdings.map((holding) => (
                                    <tr key={holding.id}>
                                        <td>
                                            <Link href={`/cryptos/${holding.crypto_id}`} className={styles.assetCell}>
                                                <img src={holding.image} alt={holding.name} className={styles.assetLogo} />
                                                <div>
                                                    <span className={styles.assetName}>{holding.name}</span>
                                                    <span className={styles.assetSymbol}>{holding.crypto_symbol?.toUpperCase()}</span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className={styles.priceCell}>
                                            <span>{formatCurrency(holding.current_price)}</span>
                                            <span className={`${styles.priceChange} ${getPriceChangeClass(holding.price_change_24h)}`}>
                                                {formatPercentage(holding.price_change_24h)}
                                            </span>
                                        </td>
                                        <td>{formatNumber(holding.quantity, 4)} {holding.crypto_symbol?.toUpperCase()}</td>
                                        <td>{formatCurrency(holding.average_buy_price)}</td>
                                        <td>
                                            <span className={getPriceChangeClass(holding.pnl)}>
                                                {formatCurrency(holding.pnl)}
                                            </span>
                                            <span className={`${styles.pnlPercent} ${getPriceChangeClass(holding.pnl_percent)}`}>
                                                ({formatPercentage(holding.pnl_percent)})
                                            </span>
                                        </td>
                                        <td className={styles.valueCell}>{formatCurrency(holding.current_value)}</td>
                                        <td>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeleteHolding(holding.id)}
                                                title="Remove holding"
                                            >
                                                🗑
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Allocation Chart */}
                <section className={`card ${styles.allocationSection}`}>
                    <div className="card-header">
                        <h2 className="card-title">Allocation</h2>
                    </div>
                    {allocationData.length > 0 ? (
                        <>
                            <div className={styles.pieChart}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={allocationData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {allocationData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{
                                                background: 'var(--surface)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-md)',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className={styles.legend}>
                                {allocationData.map((item, i) => (
                                    <div key={i} className={styles.legendItem}>
                                        <span className={styles.legendDot} style={{ background: item.color }} />
                                        <span className={styles.legendName}>{item.name}</span>
                                        <span className={styles.legendPercent}>
                                            {((item.value / totalValue) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className={styles.noAllocation}>
                            <p>Add holdings to see allocation</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Add Holding Modal */}
            {showAddModal && (
                <AddHoldingModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchPortfolioData();
                    }}
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                    searchResults={searchResults}
                />
            )}
        </div>
    );
}

// Add Holding Modal
function AddHoldingModal({ onClose, onSuccess, searchQuery, onSearch, searchResults }) {
    const [selectedCrypto, setSelectedCrypto] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [localSearch, setLocalSearch] = useState('');
    const [localResults, setLocalResults] = useState([]);

    async function handleLocalSearch(query) {
        setLocalSearch(query);
        if (query.length >= 2) {
            try {
                const response = await cryptoApi.search(query);
                setLocalResults(response.coins?.slice(0, 5) || []);
            } catch (err) {
                console.error('Search failed:', err);
            }
        } else {
            setLocalResults([]);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedCrypto || !quantity) return;

        try {
            setLoading(true);
            await portfolioApi.addHolding({
                crypto_id: selectedCrypto.id,
                crypto_symbol: selectedCrypto.symbol,
                quantity: parseFloat(quantity),
                average_buy_price: buyPrice ? parseFloat(buyPrice) : null,
            });
            onSuccess();
        } catch (err) {
            console.error('Failed to add holding:', err);
            alert('Failed to add holding');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Add Holding</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    {/* Crypto Search */}
                    <div className={styles.formGroup}>
                        <label>Cryptocurrency</label>
                        <input
                            type="text"
                            placeholder="Search cryptocurrency..."
                            value={localSearch}
                            onChange={(e) => handleLocalSearch(e.target.value)}
                            className="input"
                        />
                        {localResults.length > 0 && !selectedCrypto && (
                            <div className={styles.searchDropdown}>
                                {localResults.map((crypto) => (
                                    <button
                                        type="button"
                                        key={crypto.id}
                                        className={styles.searchItem}
                                        onClick={() => {
                                            setSelectedCrypto(crypto);
                                            setLocalSearch(crypto.name);
                                            setLocalResults([]);
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
                            <div className={styles.selectedCrypto}>
                                <img src={selectedCrypto.thumb} alt="" />
                                <span>{selectedCrypto.name} ({selectedCrypto.symbol?.toUpperCase()})</span>
                                <button type="button" onClick={() => {
                                    setSelectedCrypto(null);
                                    setLocalSearch('');
                                }}>×</button>
                            </div>
                        )}
                    </div>

                    {/* Quantity */}
                    <div className={styles.formGroup}>
                        <label>Quantity</label>
                        <input
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="input"
                            required
                        />
                    </div>

                    {/* Buy Price (optional) */}
                    <div className={styles.formGroup}>
                        <label>Average Buy Price (USD) - Optional</label>
                        <input
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={buyPrice}
                            onChange={(e) => setBuyPrice(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!selectedCrypto || !quantity || loading}
                        >
                            {loading ? 'Adding...' : 'Add Holding'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Skeleton
function PortfolioSkeleton() {
    return (
        <div className={styles.portfolioPage}>
            <div className={styles.pageHeader}>
                <div>
                    <div className="skeleton" style={{ width: 150, height: 32, marginBottom: 8 }} />
                    <div className="skeleton" style={{ width: 250, height: 16 }} />
                </div>
            </div>
            <div className={`${styles.summary} skeleton`} style={{ height: 120, marginBottom: 24 }} />
            <div className={styles.contentGrid}>
                <div className="card skeleton" style={{ height: 400 }} />
                <div className="card skeleton" style={{ height: 400 }} />
            </div>
        </div>
    );
}
