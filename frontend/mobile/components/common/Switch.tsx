import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Switch({
  value,
  onValueChange,
  label,
  disabled = false,
  activeColor = colors.primary,
  inactiveColor = colors.border,
  size = 'medium',
}: SwitchProps) {
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const toggleSwitch = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  // Size configurations
  const sizeConfig = {
    small: {
      width: 40,
      height: 24,
      thumbSize: 18,
      padding: 3,
    },
    medium: {
      width: 50,
      height: 30,
      thumbSize: 24,
      padding: 3,
    },
    large: {
      width: 60,
      height: 36,
      thumbSize: 30,
      padding: 3,
    },
  };

  const config = sizeConfig[size];

  // Animated styles
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const thumbPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [config.padding, config.width - config.thumbSize - config.padding],
  });

  const Component = label ? View : React.Fragment;
  const wrapperProps = label ? { style: styles.container } : {};

  return (
    <Component {...wrapperProps}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={toggleSwitch}
        disabled={disabled}
        style={[styles.touchable, disabled && styles.disabled]}
      >
        <Animated.View
          style={[
            styles.track,
            {
              width: config.width,
              height: config.height,
              backgroundColor,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                width: config.thumbSize,
                height: config.thumbSize,
                transform: [{ translateX: thumbPosition }],
              },
            ]}
          />
        </Animated.View>
      </Pressable>
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  touchable: {
    padding: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    borderRadius: 100,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  thumb: {
    backgroundColor: colors.surface,
    borderRadius: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});