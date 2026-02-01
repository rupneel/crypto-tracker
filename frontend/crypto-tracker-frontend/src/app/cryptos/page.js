'use client';

/**
 * Crypto List Page
 * 
 * Paginated list of cryptocurrencies with search and filters
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cryptoApi } from '@/lib/api';
import { formatCurrency, formatPercentage, formatNumber, getPriceChangeClass, debounce } from '@/lib/utils';
import styles from './page.module.css';

// Main export wrapped in Suspense for useSearchParams
export default function CryptosPage() {
    return (
        <Suspense fallback={<CryptosLoading />}>
            <CryptosContent />
        </Suspense>
    );
}

// Loading fallback
function CryptosLoading() {
    return (
        <div className={styles.cryptosPage}>
            <div className={styles.pageHeader}>
                <div className={styles.headerContent}>
                    <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 8 }} />
                    <div className="skeleton" style={{ width: 300, height: 16 }} />
                </div>
            </div>
            <div className={styles.tableContainer}>
                <div className="skeleton" style={{ height: 500 }} />
            </div>
        </div>
    );
}

// Actual content component
function CryptosContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams?.get('search') || '';

    const [cryptos, setCryptos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [perPage] = useState(50);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [searchResults, setSearchResults] = useState(null);
    const [sortBy, setSortBy] = useState('market_cap_desc');

    // Fetch cryptocurrencies
    useEffect(() => {
        if (!searchQuery) {
            fetchCryptos();
        }
    }, [page, sortBy]);

    // Search cryptocurrencies when query changes
    useEffect(() => {
        if (searchQuery) {
            debouncedSearch(searchQuery);
        } else {
            setSearchResults(null);
            fetchCryptos();
        }
    }, [searchQuery]);

    async function fetchCryptos() {
        try {
            setLoading(true);
            const response = await cryptoApi.getAll({
                page,
                perPage,
                order: sortBy,
            });
            setCryptos(response.data || []);
        } catch (err) {
            console.error('Failed to fetch cryptos:', err);
            setError('Failed to load cryptocurrencies');
        } finally {
            setLoading(false);
        }
    }

    const debouncedSearch = useCallback(
        debounce(async (query) => {
            try {
                setLoading(true);
                const response = await cryptoApi.search(query);
                setSearchResults(response.coins || []);
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    const displayData = searchResults || cryptos;

    const handleSort = (column) => {
        const sortOptions = {
            market_cap: sortBy === 'market_cap_desc' ? 'market_cap_asc' : 'market_cap_desc',
            volume: sortBy === 'volume_desc' ? 'volume_asc' : 'volume_desc',
            price: sortBy === 'price_desc' ? 'price_asc' : 'price_desc',
            change: sortBy === 'price_change_desc' ? 'price_change_asc' : 'price_change_desc',
        };
        setSortBy(sortOptions[column] || 'market_cap_desc');
        setPage(1);
    };

    return (
        <div className={styles.cryptosPage}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerContent}>
                    <h1>Cryptocurrencies</h1>
                    <p>Browse and track all cryptocurrencies by market cap</p>
                </div>

                {/* Search & Filters */}
                <div className={styles.filters}>
                    <div className={styles.searchBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search cryptocurrencies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button
                                className={styles.clearBtn}
                                onClick={() => setSearchQuery('')}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className={styles.error}>
                    <p>{error}</p>
                    <button onClick={fetchCryptos} className="btn btn-primary">Retry</button>
                </div>
            )}

            {/* Crypto Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.rankCol}>#</th>
                            <th className={styles.nameCol}>Name</th>
                            <th className={styles.priceCol} onClick={() => handleSort('price')}>
                                Price {sortBy.includes('price') && !sortBy.includes('change') && (sortBy.includes('desc') ? '↓' : '↑')}
                            </th>
                            <th className={styles.changeCol} onClick={() => handleSort('change')}>
                                24h % {sortBy.includes('change') && (sortBy.includes('desc') ? '↓' : '↑')}
                            </th>
                            <th className={styles.capCol} onClick={() => handleSort('market_cap')}>
                                Market Cap {sortBy.includes('market_cap') && (sortBy.includes('desc') ? '↓' : '↑')}
                            </th>
                            <th className={styles.volumeCol} onClick={() => handleSort('volume')}>
                                Volume (24h) {sortBy.includes('volume') && (sortBy.includes('desc') ? '↓' : '↑')}
                            </th>
                            <th className={styles.supplyCol}>Circulating Supply</th>
                            <th className={styles.sparklineCol}>Last 7 Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // Loading skeleton
                            [...Array(10)].map((_, i) => (
                                <tr key={i} className={styles.skeletonRow}>
                                    <td><div className="skeleton" style={{ width: 24, height: 20 }} /></td>
                                    <td>
                                        <div className={styles.cryptoCell}>
                                            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                                            <div>
                                                <div className="skeleton" style={{ width: 100, height: 16, marginBottom: 4 }} />
                                                <div className="skeleton" style={{ width: 40, height: 12 }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td><div className="skeleton" style={{ width: 80, height: 16 }} /></td>
                                    <td><div className="skeleton" style={{ width: 60, height: 16 }} /></td>
                                    <td><div className="skeleton" style={{ width: 100, height: 16 }} /></td>
                                    <td><div className="skeleton" style={{ width: 80, height: 16 }} /></td>
                                    <td><div className="skeleton" style={{ width: 100, height: 16 }} /></td>
                                    <td><div className="skeleton" style={{ width: 100, height: 30 }} /></td>
                                </tr>
                            ))
                        ) : searchResults ? (
                            // Search results
                            displayData.map((crypto, index) => (
                                <tr key={crypto.id}>
                                    <td className={styles.rankCol}>{crypto.market_cap_rank || index + 1}</td>
                                    <td>
                                        <Link href={`/cryptos/${crypto.id}`} className={styles.cryptoCell}>
                                            <img src={crypto.thumb || crypto.large} alt={crypto.name} className={styles.logo} />
                                            <div className={styles.cryptoInfo}>
                                                <span className={styles.name}>{crypto.name}</span>
                                                <span className={styles.symbol}>{crypto.symbol?.toUpperCase()}</span>
                                            </div>
                                        </Link>
                                    </td>
                                    <td colSpan={6} className={styles.searchNote}>
                                        Click to view details →
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // Regular crypto list
                            displayData.map((crypto, index) => (
                                <tr key={crypto.id}>
                                    <td className={styles.rankCol}>{crypto.market_cap_rank || (page - 1) * perPage + index + 1}</td>
                                    <td>
                                        <Link href={`/cryptos/${crypto.id}`} className={styles.cryptoCell}>
                                            <img src={crypto.image} alt={crypto.name} className={styles.logo} />
                                            <div className={styles.cryptoInfo}>
                                                <span className={styles.name}>{crypto.name}</span>
                                                <span className={styles.symbol}>{crypto.symbol?.toUpperCase()}</span>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className={styles.priceCol}>
                                        <span className={styles.price}>{formatCurrency(crypto.current_price)}</span>
                                    </td>
                                    <td className={`${styles.changeCol} ${getPriceChangeClass(crypto.price_change_percentage_24h)}`}>
                                        {formatPercentage(crypto.price_change_percentage_24h)}
                                    </td>
                                    <td className={styles.capCol}>{formatCurrency(crypto.market_cap, 'USD', true)}</td>
                                    <td className={styles.volumeCol}>{formatCurrency(crypto.total_volume, 'USD', true)}</td>
                                    <td className={styles.supplyCol}>
                                        {formatNumber(crypto.circulating_supply, 0)} {crypto.symbol?.toUpperCase()}
                                    </td>
                                    <td className={styles.sparklineCol}>
                                        {crypto.sparkline_in_7d?.price && (
                                            <MiniSparkline
                                                data={crypto.sparkline_in_7d.price}
                                                isPositive={crypto.price_change_percentage_7d_in_currency > 0}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!searchResults && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        ← Previous
                    </button>
                    <span className={styles.pageInfo}>Page {page}</span>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setPage(p => p + 1)}
                        disabled={cryptos.length < perPage}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}

// Mini sparkline component
function MiniSparkline({ data, isPositive }) {
    if (!data || data.length === 0) return null;

    // Sample data to reduce points
    const sampledData = data.filter((_, i) => i % 4 === 0);
    const min = Math.min(...sampledData);
    const max = Math.max(...sampledData);
    const range = max - min || 1;

    const width = 100;
    const height = 30;

    const points = sampledData.map((value, index) => {
        const x = (index / (sampledData.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className={styles.sparkline}>
            <polyline
                points={points}
                fill="none"
                stroke={isPositive ? 'var(--price-up)' : 'var(--price-down)'}
                strokeWidth="1.5"
            />
        </svg>
    );
}
