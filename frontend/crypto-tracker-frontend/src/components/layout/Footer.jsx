/**
 * Footer Component
 * 
 * Simple footer with links and copyright
 */

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Logo and Description */}
                <div className={styles.brand}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoText}>CryptoTracker</span>
                    </Link>
                    <p className={styles.description}>
                        Track cryptocurrency prices, manage your portfolio, and stay updated with real-time market data.
                    </p>
                </div>

                {/* Quick Links */}
                <div className={styles.linksSection}>
                    <h4 className={styles.linksTitle}>Quick Links</h4>
                    <nav className={styles.links}>
                        <Link href="/">Dashboard</Link>
                        <Link href="/cryptos">Cryptocurrencies</Link>
                        <Link href="/portfolio">Portfolio</Link>
                        <Link href="/alerts">Price Alerts</Link>
                    </nav>
                </div>

                {/* Resources */}
                <div className={styles.linksSection}>
                    <h4 className={styles.linksTitle}>Resources</h4>
                    <nav className={styles.links}>
                        <Link href="/about">About</Link>
                        <Link href="/docs">Documentation</Link>
                        <Link href="/api">API</Link>
                        <Link href="/support">Support</Link>
                    </nav>
                </div>

                {/* Legal */}
                <div className={styles.linksSection}>
                    <h4 className={styles.linksTitle}>Legal</h4>
                    <nav className={styles.links}>
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                        <Link href="/disclaimer">Disclaimer</Link>
                    </nav>
                </div>
            </div>

            {/* Copyright */}
            <div className={styles.copyright}>
                <p>© {new Date().getFullYear()} CryptoTracker. All rights reserved.</p>
                <p className={styles.disclaimer}>
                    Cryptocurrency data provided by CoinGecko. Not financial advice.
                </p>
            </div>
        </footer>
    );
}
