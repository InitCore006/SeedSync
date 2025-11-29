import { TextStyle } from 'react-native';

// Font Families
export const fontFamily = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  // Hindi/Regional support
  hindi: 'NotoSansDevanagari-Regular',
} as const;

// Font Sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

// Font Weights
export const fontWeight: Record<string, TextStyle['fontWeight']> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Line Heights
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// Letter Spacing
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

// Pre-defined Text Styles (Ready to use with spread operator)
export const typography = {
  // Headings
  h1: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight * fontSize['4xl'],
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  h2: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight * fontSize['3xl'],
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  h3: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal * fontSize['2xl'],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  h4: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal * fontSize.xl,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  h5: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal * fontSize.lg,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Body Text
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal * fontSize.base,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal * fontSize.lg,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal * fontSize.sm,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Caption / Helper Text
  caption: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal * fontSize.sm,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  captionSmall: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal * fontSize.xs,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Button Text
  button: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal * fontSize.base,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  buttonLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal * fontSize.lg,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  buttonSmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal * fontSize.sm,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Label Text
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal * fontSize.sm,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Hindi/Regional Text
  hindi: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.hindi,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed * fontSize.base,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,
} as const;

// Helper function to create custom text style
export const createTextStyle = (config: {
  size?: keyof typeof fontSize;
  weight?: keyof typeof fontWeight;
  height?: keyof typeof lineHeight;
  spacing?: keyof typeof letterSpacing;
  family?: keyof typeof fontFamily;
}): TextStyle => {
  const size = config.size ? fontSize[config.size] : fontSize.base;
  return {
    fontSize: size,
    fontWeight: config.weight ? fontWeight[config.weight] : fontWeight.normal,
    lineHeight: config.height ? lineHeight[config.height] * size : lineHeight.normal * size,
    letterSpacing: config.spacing ? letterSpacing[config.spacing] : letterSpacing.normal,
    fontFamily: config.family ? fontFamily[config.family] : fontFamily.regular,
  } as TextStyle;
};