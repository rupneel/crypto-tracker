/**
 * Crypto Tracker - Utility Functions
 */

import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a number as currency
 */
export function formatCurrency(value, currency = 'USD', compact = false) {
    if (value === null || value === undefined) return '-';

    const options = {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };

    if (compact && Math.abs(value) >= 1e9) {
        return (value / 1e9).toFixed(2) + 'B';
    } else if (compact && Math.abs(value) >= 1e6) {
        return (value / 1e6).toFixed(2) + 'M';
    } else if (compact && Math.abs(value) >= 1e3) {
        return (value / 1e3).toFixed(2) + 'K';
    }

    // Handle very small values (crypto prices)
    if (Math.abs(value) < 0.01 && value !== 0) {
        options.minimumFractionDigits = 6;
        options.maximumFractionDigits = 6;
    }

    return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Format a percentage value
 */
export function formatPercentage(value, decimals = 2) {
    if (value === null || value === undefined) return '-';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with abbreviations
 */
export function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined) return '-';

    if (Math.abs(value) >= 1e12) {
        return (value / 1e12).toFixed(decimals) + 'T';
    } else if (Math.abs(value) >= 1e9) {
        return (value / 1e9).toFixed(decimals) + 'B';
    } else if (Math.abs(value) >= 1e6) {
        return (value / 1e6).toFixed(decimals) + 'M';
    } else if (Math.abs(value) >= 1e3) {
        return (value / 1e3).toFixed(decimals) + 'K';
    }

    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/**
 * Format a date string
 */
export function formatDate(date, pattern = 'MMM d, yyyy') {
    if (!date) return '-';
    return format(new Date(date), pattern);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
    if (!date) return '-';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Get CSS class based on price change direction
 */
export function getPriceChangeClass(value) {
    if (value > 0) return 'text-up';
    if (value < 0) return 'text-down';
    return 'text-muted';
}

/**
 * Get background CSS class based on price change direction
 */
export function getPriceChangeBgClass(value) {
    if (value > 0) return 'bg-up';
    if (value < 0) return 'bg-down';
    return '';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, length = 50) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate chart colors based on index
 */
export function getChartColor(index) {
    const colors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // yellow
        '#ef4444', // red
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#f97316', // orange
    ];
    return colors[index % colors.length];
}
