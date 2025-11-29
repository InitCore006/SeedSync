import { colors } from '@/lib/constants/colors';
import { borderRadius, spacing } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';


interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  onPress,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.base,
      ...styles[`size_${size}`],
    };

    // Variant styles
    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: colors.primary };
      case 'secondary':
        return { ...baseStyle, backgroundColor: colors.secondary };
      case 'success':
        return { ...baseStyle, backgroundColor: colors.success };
      case 'warning':
        return { ...baseStyle, backgroundColor: colors.warning };
      case 'danger':
        return { ...baseStyle, backgroundColor: colors.error };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
        };
      case 'text':
        return { ...baseStyle, backgroundColor: 'transparent' };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...typography.button,
      textAlign: 'center',
    };

    // Size-specific text styles
    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: typography.buttonSmall.fontSize },
      md: { fontSize: typography.button.fontSize },
      lg: { fontSize: typography.buttonLarge.fontSize },
    };

    // Variant-specific text colors
    const variantTextColor =
      variant === 'outline' || variant === 'text'
        ? colors.primary
        : colors.white;

    return {
      ...baseTextStyle,
      ...sizeStyles[size],
      color: variantTextColor,
    };
  };

  const buttonStyle: ViewStyle[] = [
    getButtonStyle(),
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    getTextStyle(),
    isDisabled && styles.textDisabled,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  const getLoaderColor = () => {
    if (variant === 'outline' || variant === 'text') {
      return colors.primary;
    }
    return colors.white;
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  } as ViewStyle,

  // Size styles
  size_sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  } as ViewStyle,

  size_md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44,
  } as ViewStyle,

  size_lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 52,
  } as ViewStyle,

  // States
  disabled: {
    opacity: 0.5,
  } as ViewStyle,

  textDisabled: {
    opacity: 0.7,
  } as TextStyle,

  // Full Width
  fullWidth: {
    width: '100%',
  } as ViewStyle,
});

// Named export for backward compatibility
export { Button };