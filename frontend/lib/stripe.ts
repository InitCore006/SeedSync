/**
 * Stripe Configuration and Utilities
 * Initialize Stripe and provide helper functions
 */
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe instance (singleton pattern)
 */
export const getStripe = (publishableKey: string) => {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

/**
 * Format amount for Stripe (convert to paise/cents)
 */
export const formatAmountForStripe = (amount: number, currency: string = 'inr'): number => {
  return Math.round(amount * 100);
};

/**
 * Format amount from Stripe (convert from paise/cents)
 */
export const formatAmountFromStripe = (amount: number, currency: string = 'inr'): number => {
  return amount / 100;
};

/**
 * Validate minimum amount for Stripe payments
 */
export const validateMinimumAmount = (amount: number, currency: string = 'inr'): boolean => {
  const minimumAmounts: Record<string, number> = {
    inr: 50, // INR 50 minimum
    usd: 0.50, // USD 0.50 minimum
  };
  
  return amount >= (minimumAmounts[currency.toLowerCase()] || 0);
};
