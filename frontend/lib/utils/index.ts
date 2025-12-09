import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in Indian Rupees
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number with Indian numbering system
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}



export function formatDate(
  date: string | Date,
  formatStr: string = 'PP'
): string {
  let dateObj: Date;

  // Convert string → Date safely
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }

  // Prevent runtime crashes in Next.js
  if (!isValid(dateObj)) {
    return '';
  }

  return format(dateObj, formatStr);
}


// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Truncate text
export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Format phone number
export function formatPhone(phone: string): string {
  // Remove +91 prefix if exists
  const cleaned = phone.replace(/^\+91/, '');
  
  // Format as XXX-XXX-XXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

// Get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-50',
    active: 'text-green-600 bg-green-50',
    completed: 'text-green-600 bg-green-50',
    cancelled: 'text-red-600 bg-red-50',
    rejected: 'text-red-600 bg-red-50',
    approved: 'text-green-600 bg-green-50',
    available: 'text-green-600 bg-green-50',
    bidding: 'text-blue-600 bg-blue-50',
    sold: 'text-purple-600 bg-purple-50',
    delivered: 'text-green-600 bg-green-50',
    accepted: 'text-green-600 bg-green-50',
    withdrawn: 'text-gray-600 bg-gray-50',
    processing: 'text-blue-600 bg-blue-50',
    failed: 'text-red-600 bg-red-50',
    under_review: 'text-orange-600 bg-orange-50',
    inactive: 'text-gray-600 bg-gray-50',
  };
  
  return colors[status.toLowerCase()] || 'text-gray-600 bg-gray-50';
}

// Get quality grade color
export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    'A+': 'text-green-700 bg-green-100 border-green-300',
    'A': 'text-green-600 bg-green-50 border-green-200',
    'B': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'C': 'text-orange-600 bg-orange-50 border-orange-200',
  };
  
  return colors[grade] || 'text-gray-600 bg-gray-50 border-gray-200';
}

// Validate file
export function validateFile(file: File, maxSize: number, allowedTypes: string[]): {
  valid: boolean;
  error?: string;
} {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size should be less than ${maxSize / (1024 * 1024)}MB`,
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type',
    };
  }
  
  return { valid: true };
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Download file
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Parse error from API
export function parseAPIError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstKey = Object.keys(errors)[0];
    return errors[firstKey][0];
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// Generate color from string (for avatars)
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#437409', '#438602', '#c8e686',
    '#10b981', '#3b82f6', '#8b5cf6',
    '#ec4899', '#f59e0b', '#14b8a6',
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
}

// ============= Government-specific Utilities =============

// Get health score color for FPOs
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-700 bg-green-100 border-green-300';
  if (score >= 60) return 'text-blue-700 bg-blue-100 border-blue-300';
  if (score >= 40) return 'text-yellow-700 bg-yellow-100 border-yellow-300';
  return 'text-red-700 bg-red-100 border-red-300';
}

// Get health status badge
export function getHealthStatus(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
  if (score >= 60) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
  if (score >= 40) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800' };
  return { label: 'Poor', color: 'bg-red-100 text-red-800' };
}

// Get efficiency badge
export function getEfficiencyBadge(efficiency: number): { label: string; color: string } {
  if (efficiency >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
  if (efficiency >= 75) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
  if (efficiency >= 60) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800' };
  return { label: 'Poor', color: 'bg-red-100 text-red-800' };
}

// Get fulfillment rate badge
export function getFulfillmentBadge(rate: number): { label: string; color: string } {
  if (rate >= 95) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
  if (rate >= 80) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
  if (rate >= 60) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800' };
  return { label: 'Poor', color: 'bg-red-100 text-red-800' };
}

// Get KYC status badge
export function getKYCBadge(status: string): { label: string; color: string } {
  const badges: Record<string, { label: string; color: string }> = {
    verified: { label: 'Verified', color: 'bg-green-100 text-green-800' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  };
  return badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
}

// Get shipment status badge
export function getShipmentStatusBadge(status: string): { label: string; color: string } {
  const badges: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    in_transit: { label: 'In Transit', color: 'bg-blue-100 text-blue-800' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
    delayed: { label: 'Delayed', color: 'bg-red-100 text-red-800' },
  };
  return badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
}

// Get lot status badge
export function getLotStatusBadge(status: string): { label: string; color: string } {
  const badges: Record<string, { label: string; color: string }> = {
    open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    closed: { label: 'Closed', color: 'bg-green-100 text-green-800' },
    sold: { label: 'Sold', color: 'bg-purple-100 text-purple-800' },
  };
  return badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
}

// Get MSP comparison badge
export function getMSPBadge(priceVsMsp: number | null): { label: string; color: string } {
  if (priceVsMsp === null) return { label: 'No MSP', color: 'bg-gray-100 text-gray-800' };
  if (priceVsMsp >= 0) return { label: 'Above MSP', color: 'bg-green-100 text-green-800' };
  return { label: 'Below MSP', color: 'bg-red-100 text-red-800' };
}

// Calculate verification rate
export function calculateVerificationRate(verified: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((verified / total) * 100);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format quintals to metric tons
export function quintalsToMetricTons(quintals: number): string {
  const tons = quintals / 10;
  return `${tons.toFixed(2)} MT`;
}

// Get trend indicator
export function getTrendIndicator(current: number, previous: number): {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  color: string;
} {
  if (previous === 0) {
    return { direction: 'stable', percentage: 0, color: 'text-gray-600' };
  }
  
  const percentage = ((current - previous) / previous) * 100;
  
  if (Math.abs(percentage) < 1) {
    return { direction: 'stable', percentage: 0, color: 'text-gray-600' };
  }
  
  return {
    direction: percentage > 0 ? 'up' : 'down',
    percentage: Math.abs(percentage),
    color: percentage > 0 ? 'text-green-600' : 'text-red-600',
  };
}

// Export data to CSV
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${filename}.csv`);
}

// Format Indian date
export function formatIndianDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, 'dd/MM/yyyy');
}

// Get state name from code
export function getStateName(stateCode: string, states: readonly [string, string][]): string {
  const state = states.find(([code]) => code === stateCode);
  return state ? state[1] : stateCode;
}

// Get crop display name
export function getCropDisplayName(cropType: string): string {
  return cropType.charAt(0).toUpperCase() + cropType.slice(1).toLowerCase();
}

// Calculate days difference
export function daysDifference(date1: string | Date, date2: string | Date = new Date()): number {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
