export const colors = {
  // Primary Colors (Agriculture Theme)
  primary: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#28a745', // Main primary
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },

  // Secondary Colors (Energy/Oilseed)
  secondary: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff6b35', // Main secondary
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },

  // Accent (Warning/Alerts)
  accent: {
    50: '#fffde7',
    100: '#fff9c4',
    200: '#fff59d',
    300: '#fff176',
    400: '#ffee58',
    500: '#ffc107', // Main accent
    600: '#ffd54f',
    700: '#ffca28',
    800: '#ffc107',
    900: '#ffb300',
  },

  // Neutral/Grays
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

  // Semantic Colors
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',

  // Status Colors
  status: {
    active: '#28a745',
    pending: '#ffc107',
    completed: '#17a2b8',
    rejected: '#dc3545',
    expired: '#6c757d',
  },

  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
    inverse: '#ffffff',
  },

  // Background Colors
  background: {
    default: '#ffffff',
    paper: '#f5f5f5',
    dark: '#212121',
  },

  // Border Colors
  border: {
    light: '#e0e0e0',
    default: '#bdbdbd',
    dark: '#757575',
  },
} as const;

export type ColorKey = keyof typeof colors;