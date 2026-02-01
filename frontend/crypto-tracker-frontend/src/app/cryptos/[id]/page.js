'use client';

/**
 * Crypto Detail Page
 * 
 * Detailed view of a cryptocurrency with price chart and stats
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { cryptoApi } from '@/lib/api';
import { formatCurrency, formatPercentage, formatNumber, formatDate, getPriceChangeClass } from '@/lib/utils';
import styles from './page.module.css';

export default function CryptoDetailPage() {
    const params = useParams();
    const { id } = params;

    const [crypto, setCrypto] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [timeRange, setTimeRange] = useState('7');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchCryptoData();
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchPriceHistory();
        }
    }, [id, timeRange]);

    async function fetchCryptoData() {
        try {
            setLoading(true);
            const response = await cryptoApi.getById(id);
            setCrypto(response);
        } catch (err) {
            console.error('Failed to fetch crypto:', err);
            setError('Failed to load cryptocurrency data');
        } finally {
            setLoading(false);
        }
    }

    async function fetchPriceHistory() {
        try {
            const response = await cryptoApi.getHistory(id, timeRange);
            const formattedData = response.prices?.map(([timestamp, price]) => ({
                date: new Date(timestamp),
                price,
            })) || [];
            setPriceHistory(formattedData);
        } catch (err) {
            console.error('Failed to fetch price history:', err);
        }
    }

    if (loading) {
        return <DetailSkeleton />;
    }

    if (error || !crypto) {
        return (
            <div className={styles.error}>
                <h2>Oops!</h2>
                <p>{error || 'Cryptocurrency not found'}</p>
                <Link href="/cryptos" className="btn btn-primary">
                    ← Back to List
                </Link>
            </div>
        );
    }

    const priceChange24h = crypto.market_data?.price_change_percentage_24h;
    const priceChange7d = crypto.market_data?.price_change_percentage_7d;
    const priceChange30d = crypto.market_data?.price_change_percentage_30d;
    const currentPrice = crypto.market_data?.current_price?.usd;

    return (
        <div className={styles.detailPage}>
            {/* Breadcrumb */}
            <nav className={styles.breadcrumb}>
                <Link href="/cryptos">Cryptocurrencies</Link>
                <span>/</span>
                <span>{crypto.name}</span>
            </nav>

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.cryptoInfo}>
                    <img src={crypto.image?.large} alt={crypto.name} className={styles.logo} />
                    <div>
                        <div className={styles.nameRow}>
                            <h1>{crypto.name}</h1>
                            <span className={styles.symbol}>{crypto.symbol?.toUpperCase()}</span>
                            <span className={styles.rank}>Rank #{crypto.market_cap_rank}</span>
                        </div>
                        <div className={styles.priceRow}>
                            <span className={styles.price}>{formatCurrency(currentPrice)}</span>
                            <span className={`${styles.change} ${getPriceChangeClass(priceChange24h)}`}>
                                {formatPercentage(priceChange24h)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles.actions}>
                    <button className="btn btn-primary">+ Add to Portfolio</button>
                    <button className="btn btn-secondary">🔔 Set Alert</button>
                </div>
            </header>

            {/* Price Chart */}
            <section className={`card ${styles.chartSection}`}>
                <div className={styles.chartHeader}>
                    <h2>Price Chart</h2>
                    <div className={styles.timeRanges}>
                        {['1', '7', '30', '90', '365'].map((range) => (
                            <button
                                key={range}
                                className={`${styles.rangeBtn} ${timeRange === range ? styles.active : ''}`}
                                onClick={() => setTimeRange(range)}
                            >
                                {range === '1' ? '24H' : range === '365' ? '1Y' : `${range}D`}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.chart}>
                    {priceHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={priceHistory}>
                                <defs>
                                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => formatDate(date, timeRange === '1' ? 'HH:mm' : 'MMM d')}
                                    stroke="var(--text-muted)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    tickFormatter={(val) => formatCurrency(val, 'USD', true)}
                                    stroke="var(--text-muted)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    width={80}
                                />
                                <Tooltip
                                    content={({ payload, label }) => {
                                        if (payload?.[0]) {
                                            return (
                                                <div className={styles.tooltip}>
                                                    <p className={styles.tooltipDate}>{formatDate(label, 'MMM d, yyyy HH:mm')}</p>
                                                    <p className={styles.tooltipPrice}>{formatCurrency(payload[0].value)}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="var(--primary-500)"
                                    strokeWidth={2}
                                    fill="url(#priceGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.noChart}>Loading chart...</div>
                    )}
                </div>
            </section>

            {/* Stats Grid */}
            <section className={styles.statsGrid}>
                <div className={`card ${styles.statCard}`}>
                    <h3>Market Cap</h3>
                    <span className={styles.statValue}>
                        {formatCurrency(crypto.market_data?.market_cap?.usd, 'USD', true)}
                    </span>
                    <span className={`${styles.statChange} ${getPriceChangeClass(crypto.market_data?.market_cap_change_percentage_24h)}`}>
                        {formatPercentage(crypto.market_data?.market_cap_change_percentage_24h)}
                    </span>
                </div>
                <div className={`card ${styles.statCard}`}>
                    <h3>24h Trading Volume</h3>
                    <span className={styles.statValue}>
                        {formatCurrency(crypto.market_data?.total_volume?.usd, 'USD', true)}
                    </span>
                </div>
                <div className={`card ${styles.statCard}`}>
                    <h3>Fully Diluted Val.</h3>
                    <span className={styles.statValue}>
                        {formatCurrency(crypto.market_data?.fully_diluted_valuation?.usd, 'USD', true)}
                    </span>
                </div>
                <div className={`card ${styles.statCard}`}>
                    <h3>Circulating Supply</h3>
                    <span className={styles.statValue}>
                        {formatNumber(crypto.market_data?.circulating_supply, 0)}
                    </span>
                    {crypto.market_data?.max_supply && (
                        <span className={styles.statSub}>
                            Max: {formatNumber(crypto.market_data?.max_supply, 0)}
                        </span>
                    )}
                </div>
            </section>

            {/* Price Changes */}
            <section className={`card ${styles.priceChanges}`}>
                <h3>Price Changes</h3>
                <div className={styles.changeGrid}>
                    <div className={styles.changeItem}>
                        <span>1 Hour</span>
                        <span className={getPriceChangeClass(crypto.market_data?.price_change_percentage_1h_in_currency?.usd)}>
                            {formatPercentage(crypto.market_data?.price_change_percentage_1h_in_currency?.usd)}
                        </span>
                    </div>
                    <div className={styles.changeItem}>
                        <span>24 Hours</span>
                        <span className={getPriceChangeClass(priceChange24h)}>
                            {formatPercentage(priceChange24h)}
                        </span>
                    </div>
                    <div className={styles.changeItem}>
                        <span>7 Days</span>
                        <span className={getPriceChangeClass(priceChange7d)}>
                            {formatPercentage(priceChange7d)}
                        </span>
                    </div>
                    <div className={styles.changeItem}>
                        <span>30 Days</span>
                        <span className={getPriceChangeClass(priceChange30d)}>
                            {formatPercentage(priceChange30d)}
                        </span>
                    </div>
                    <div className={styles.changeItem}>
                        <span>1 Year</span>
                        <span className={getPriceChangeClass(crypto.market_data?.price_change_percentage_1y)}>
                            {formatPercentage(crypto.market_data?.price_change_percentage_1y)}
                        </span>
                    </div>
                    <div className={styles.changeItem}>
                        <span>All Time High</span>
                        <span className={styles.athValue}>{formatCurrency(crypto.market_data?.ath?.usd)}</span>
                    </div>
                </div>
            </section>

            {/* Description */}
            {crypto.description?.en && (
                <section className={`card ${styles.description}`}>
                    <h3>About {crypto.name}</h3>
                    <div
                        className={styles.descriptionText}
                        dangerouslySetInnerHTML={{
                            __html: crypto.description.en.split('. ').slice(0, 5).join('. ') + '.'
                        }}
                    />
                </section>
            )}
        </div>
    );
}

// Loading skeleton
function DetailSkeleton() {
    return (
        <div className={styles.detailPage}>
            <div className={styles.breadcrumb}>
                <div className="skeleton" style={{ width: 150, height: 16 }} />
            </div>
            <header className={styles.header}>
                <div className={styles.cryptoInfo}>
                    <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%' }} />
                    <div>
                        <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 8 }} />
                        <div className="skeleton" style={{ width: 150, height: 24 }} />
                    </div>
                </div>
            </header>
            <div className="card skeleton" style={{ height: 450, marginBottom: 24 }} />
            <div className={styles.statsGrid}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="card skeleton" style={{ height: 100 }} />
                ))}
            </div>
        </div>
    );
}
