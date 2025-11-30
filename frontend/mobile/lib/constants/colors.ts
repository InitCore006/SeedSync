export const colors = {
  primary: '#407105',
  primaryLight: '#438602',
  primaryDark: '#2d5003',

  secondary: '#c8e686',
  secondaryLight: '#dff0b3',
  secondaryDark: '#b3d96d',

  accent: '#5a9a1a',
  accentLight: '#73b831',
  accentDark: '#4a7f15',

  success: '#438602',
  error: '#c1121f',
  warning: '#ff9f1c',
  info: '#5a9a1a',

  background: '#ffffff',
  surface: '#f8fdf4',
  surfaceLight: '#fcfefc',
  surfaceDark: '#ecf7e0',

text: {
    primary: '#111827',
    secondary: '#4b5563',
    disabled: '#9ca3af',
    inverse: '#ffffff',
  },

  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',

  status: {
    active: '#438602',
    pending: '#ff9f1c',
    completed: '#5a9a1a',
    rejected: '#c1121f',
    expired: '#6c757d',
  },

  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  transparent: 'transparent',
  overlay: 'rgba(45, 80, 3, 0.5)',
  overlayLight: 'rgba(45, 80, 3, 0.3)',
  overlayDark: 'rgba(45, 80, 3, 0.7)',

  white: '#ffffff',
  black: '#000000',
} as const;

export const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const colorPalette = {
  primary: {
    50: '#f8fdf4',
    100: '#f1fce8',
    200: '#e3f9d1',
    300: '#cff2a8',
    400: '#b3e575',
    500: '#438602',
    600: '#407105',
    700: '#3a6504',
    800: '#2d5003',
    900: '#1f3802',
  },
  secondary: {
    50: '#fcfefc',
    100: '#f8fdf4',
    200: '#f1fce8',
    300: '#ecf7e0',
    400: '#dff0b3',
    500: '#c8e686',
    600: '#b3d96d',
    700: '#9acc54',
    800: '#7db842',
    900: '#5f9632',
  },
  accent: {
    50: '#f4fbec',
    100: '#e8f7d8',
    200: '#d1efb1',
    300: '#b3e575',
    400: '#8fd747',
    500: '#5a9a1a',
    600: '#4a7f15',
    700: '#3e6c12',
    800: '#32580e',
    900: '#26440b',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

export type ColorKey = keyof typeof colors;