import { format, formatDistance, formatRelative, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

// ============================================================================
// DATE FORMATTING
// ============================================================================

export const formatDate = (date: string | Date, formatStr: string = 'dd MMM yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: enUS });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd MMM yyyy, hh:mm a');
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true, locale: enUS });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

export const formatRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatRelative(dateObj, new Date(), { locale: enUS });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
};

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `₹${amount.toFixed(2)}`;
  }
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  try {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(num);
  } catch (error) {
    console.error('Error formatting number:', error);
    return num.toFixed(decimals);
  }
};

export const formatQuantity = (quantity: number, unit: string = 'Quintal'): string => {
  return `${formatNumber(quantity)} ${unit}`;
};

// ============================================================================
// PHONE NUMBER FORMATTING
// ============================================================================

export const formatPhoneNumber = (phone: string): string => {
  // Format: +91 98765 43210
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

export const cleanPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  return phone.replace(/\D/g, '');
};

// ============================================================================
// FILE SIZE FORMATTING
// ============================================================================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ============================================================================
// PERCENTAGE FORMATTING
// ============================================================================

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

export const truncate = (str: string, length: number = 50): string => {
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(cleanPhoneNumber(phone));
};

export const isValidIFSC = (ifsc: string): boolean => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc.toUpperCase());
};

export const isValidAadhaar = (aadhaar: string): boolean => {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(cleanPhoneNumber(aadhaar));
};

export const isValidUPI = (upi: string): boolean => {
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  return upiRegex.test(upi);
};

export const isValidPincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};








