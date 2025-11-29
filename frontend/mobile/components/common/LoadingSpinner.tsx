import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@lib/constants/colors';
import { typography, fontFamily, fontSize } from '@lib/constants/typography';
import { spacing } from '@lib/constants/spacing';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = colors.primary[500],
  message,
  fullScreen = false,
  style,
}) => {
  return (
    <View style={[fullScreen ? styles.fullScreen : styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  message: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    fontFamily: fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});