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
    active: 'text-blue-600 bg-blue-50',
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
