'use client';

/**
 * Dashboard Page
 * 
 * Main dashboard with market overview, trending coins, and portfolio summary
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cryptoApi } from '@/lib/api';
import { formatCurrency, formatPercentage, formatNumber, getPriceChangeClass } from '@/lib/utils';
import styles from './page.module.css';

export default function Dashboard() {
  const [marketData, setMarketData] = useState(null);
  const [topCryptos, setTopCryptos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // Fetch data in parallel
      const [cryptosResponse, trendingResponse, globalResponse] = await Promise.all([
        cryptoApi.getAll({ perPage: 10 }),
        cryptoApi.getTrending(),
        cryptoApi.getGlobalStats(),
      ]);

      setTopCryptos(cryptosResponse.data || []);
      setTrending(trendingResponse.coins || []);
      setMarketData(globalResponse.data || null);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load market data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1>Dashboard</h1>
        <p>Real-time cryptocurrency market overview</p>
      </div>

      {/* Market Stats */}
      <section className={styles.marketStats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Market Cap</span>
          <span className={styles.statValue}>
            {formatCurrency(marketData?.total_market_cap?.usd, 'USD', true)}
          </span>
          <span className={`${styles.statChange} ${getPriceChangeClass(marketData?.market_cap_change_percentage_24h_usd)}`}>
            {formatPercentage(marketData?.market_cap_change_percentage_24h_usd)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>24h Trading Volume</span>
          <span className={styles.statValue}>
            {formatCurrency(marketData?.total_volume?.usd, 'USD', true)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>BTC Dominance</span>
          <span className={styles.statValue}>
            {marketData?.market_cap_percentage?.btc?.toFixed(1)}%
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Cryptocurrencies</span>
          <span className={styles.statValue}>
            {formatNumber(marketData?.active_cryptocurrencies, 0)}
          </span>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Top Cryptocurrencies */}
        <section className={`card ${styles.topCryptos}`}>
          <div className="card-header">
            <h2 className="card-title">Top Cryptocurrencies</h2>
            <Link href="/cryptos" className={styles.viewAll}>View All →</Link>
          </div>
          <div className={styles.cryptoList}>
            {topCryptos.slice(0, 5).map((crypto, index) => (
              <Link href={`/cryptos/${crypto.id}`} key={crypto.id} className={styles.cryptoItem}>
                <div className={styles.cryptoRank}>{index + 1}</div>
                <img
                  src={crypto.image}
                  alt={crypto.name}
                  className={styles.cryptoLogo}
                />
                <div className={styles.cryptoInfo}>
                  <span className={styles.cryptoName}>{crypto.name}</span>
                  <span className={styles.cryptoSymbol}>{crypto.symbol.toUpperCase()}</span>
                </div>
                <div className={styles.cryptoPrice}>
                  <span className={styles.priceValue}>
                    {formatCurrency(crypto.current_price)}
                  </span>
                  <span className={`${styles.priceChange} ${getPriceChangeClass(crypto.price_change_percentage_24h)}`}>
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Coins */}
        <section className={`card ${styles.trending}`}>
          <div className="card-header">
            <h2 className="card-title">🔥 Trending</h2>
          </div>
          <div className={styles.trendingList}>
            {trending.slice(0, 7).map((item, index) => (
              <Link href={`/cryptos/${item.item.id}`} key={item.item.id} className={styles.trendingItem}>
                <span className={styles.trendingRank}>#{index + 1}</span>
                <img
                  src={item.item.small}
                  alt={item.item.name}
                  className={styles.trendingLogo}
                />
                <div className={styles.trendingInfo}>
                  <span className={styles.trendingName}>{item.item.name}</span>
                  <span className={styles.trendingSymbol}>{item.item.symbol}</span>
                </div>
                <span className={styles.trendingRankBadge}>
                  #{item.item.market_cap_rank || '?'}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Gainers & Losers */}
        <section className={`card ${styles.gainersLosers}`}>
          <div className="card-header">
            <h2 className="card-title">Top Gainers</h2>
          </div>
          <div className={styles.moversGrid}>
            {topCryptos
              .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
              .slice(0, 3)
              .map((crypto) => (
                <Link href={`/cryptos/${crypto.id}`} key={crypto.id} className={styles.moverCard}>
                  <img src={crypto.image} alt={crypto.name} className={styles.moverLogo} />
                  <span className={styles.moverName}>{crypto.symbol.toUpperCase()}</span>
                  <span className={`${styles.moverChange} text-up`}>
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </span>
                </Link>
              ))}
          </div>
          <div className="card-header" style={{ marginTop: 'var(--space-4)' }}>
            <h2 className="card-title">Top Losers</h2>
          </div>
          <div className={styles.moversGrid}>
            {topCryptos
              .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
              .slice(0, 3)
              .map((crypto) => (
                <Link href={`/cryptos/${crypto.id}`} key={crypto.id} className={styles.moverCard}>
                  <img src={crypto.image} alt={crypto.name} className={styles.moverLogo} />
                  <span className={styles.moverName}>{crypto.symbol.toUpperCase()}</span>
                  <span className={`${styles.moverChange} text-down`}>
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </span>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Skeleton loading component
function DashboardSkeleton() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div className={`skeleton ${styles.skeletonTitle}`}></div>
        <div className={`skeleton ${styles.skeletonSubtitle}`}></div>
      </div>
      <section className={styles.marketStats}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${styles.statCard} skeleton`} style={{ height: '100px' }}></div>
        ))}
      </section>
      <div className={styles.contentGrid}>
        <div className={`card skeleton ${styles.topCryptos}`} style={{ height: '400px' }}></div>
        <div className={`card skeleton ${styles.trending}`} style={{ height: '400px' }}></div>
      </div>
    </div>
  );
}
