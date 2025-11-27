// Flattened color structure for easy usage
export const colors = {
  // Primary Colors (Agriculture Theme)
  primary: '#28a745',
  primaryLight: '#66bb6a',
  primaryDark: '#1b5e20',

  // Secondary Colors (Energy/Oilseed)
  secondary: '#ff6b35',
  secondaryLight: '#ffa726',
  secondaryDark: '#e65100',

  // Accent (Warning/Alerts)
  accent: '#ffc107',
  accentLight: '#ffee58',
  accentDark: '#ffb300',

  // Semantic Colors
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',

  // Background Colors
  background: '#ffffff',
  surface: '#f5f5f5',
  surfaceLight: '#fafafa',
  surfaceDark: '#eeeeee',

  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
    inverse: '#ffffff',
  },

  // Border Colors
  border: '#e0e0e0',
  borderLight: '#eeeeee',
  borderDark: '#bdbdbd',

  // Status Colors
  status: {
    active: '#28a745',
    pending: '#ffc107',
    completed: '#17a2b8',
    rejected: '#dc3545',
    expired: '#6c757d',
  },

  // Gray Scale
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Transparent variations
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // White & Black
  white: '#ffffff',
  black: '#000000',
} as const;

// Helper function to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Palette with shades (for advanced usage)
export const colorPalette = {
  primary: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#28a745',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  secondary: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff6b35',
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  accent: {
    50: '#fffde7',
    100: '#fff9c4',
    200: '#fff59d',
    300: '#fff176',
    400: '#ffee58',
    500: '#ffc107',
    600: '#ffd54f',
    700: '#ffca28',
    800: '#ffc107',
    900: '#ffb300',
  },
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
} as const;

export type ColorKey = keyof typeof colors;