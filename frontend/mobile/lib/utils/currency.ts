/**
 * Format number to Indian Rupee currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number to Indian Rupee without symbol
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format to compact notation (e.g., ₹1.2L, ₹5.5K)
 */
export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toFixed(0)}`;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''));
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return (part / total) * 100;
};

/**
 * Format percentage
 */
export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};