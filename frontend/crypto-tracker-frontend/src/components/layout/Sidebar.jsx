'use client';

/**
 * Sidebar Component
 * 
 * Side navigation with quick links and market stats
 */

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [marketStats, setMarketStats] = useState(null);

    // Navigation items
    const navItems = [
        { icon: '📊', label: 'Dashboard', href: '/' },
        { icon: '💰', label: 'Cryptocurrencies', href: '/cryptos' },
        { icon: '📁', label: 'Portfolio', href: '/portfolio' },
        { icon: '🔔', label: 'Price Alerts', href: '/alerts' },
        { icon: '📈', label: 'Trending', href: '/trending' },
        { icon: '⚙️', label: 'Settings', href: '/settings' },
    ];

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            {/* Collapse Toggle */}
            <button
                className={styles.collapseBtn}
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {isCollapsed ? (
                        <path d="M9 18l6-6-6-6" />
                    ) : (
                        <path d="M15 18l-6-6 6-6" />
                    )}
                </svg>
            </button>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href} className={styles.navItem}>
                        <span className={styles.navIcon}>{item.icon}</span>
                        {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                    </Link>
                ))}
            </nav>

            {/* Market Overview (visible when not collapsed) */}
            {!isCollapsed && (
                <div className={styles.marketOverview}>
                    <h4 className={styles.sectionTitle}>Market Overview</h4>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Market Cap</span>
                        <span className={styles.statValue}>$2.1T</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>24h Volume</span>
                        <span className={styles.statValue}>$89.5B</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>BTC Dominance</span>
                        <span className={styles.statValue}>52.4%</span>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            {!isCollapsed && (
                <div className={styles.quickActions}>
                    <Link href="/portfolio" className={styles.actionBtn}>
                        <span>+ Add to Portfolio</span>
                    </Link>
                </div>
            )}
        </aside>
    );
}
