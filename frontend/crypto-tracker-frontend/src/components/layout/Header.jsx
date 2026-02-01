'use client';

/**
 * Header Component
 * 
 * Navigation header with logo, search, and user menu
 */

import Link from 'next/link';
import { useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to search results
            window.location.href = `/cryptos?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v12M9 9l3-3 3 3M9 15l3 3 3-3" />
                    </svg>
                    <span className={styles.logoText}>CryptoTracker</span>
                </Link>

                {/* Navigation */}
                <nav className={styles.nav}>
                    <Link href="/" className={styles.navLink}>Dashboard</Link>
                    <Link href="/cryptos" className={styles.navLink}>Cryptocurrencies</Link>
                    <Link href="/portfolio" className={styles.navLink}>Portfolio</Link>
                    <Link href="/alerts" className={styles.navLink}>Alerts</Link>
                </nav>

                {/* Search */}
                <form onSubmit={handleSearch} className={`${styles.searchContainer} ${isSearchFocused ? styles.searchFocused : ''}`}>
                    <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search cryptocurrencies..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                </form>

                {/* User Menu */}
                <div className={styles.userMenu}>
                    <button className={styles.themeToggle} aria-label="Toggle theme">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                        </svg>
                    </button>
                    <button className={styles.userButton}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="5" />
                            <path d="M20 21a8 8 0 1 0-16 0" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
