import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { colors, withOpacity } from '@/lib/constants/colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withSpring(1, { duration: 800 });

    if (isAuthenticated) {
      router.replace('/(farmer)');
    }
  }, [isAuthenticated]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    router.push('/(auth)/registration/verify-phone');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.secondary, colors.primary, colors.primaryDark]}
      style={styles.container}
    >
      <StatusBar style="light" />

      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.logoCircle}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>SeedSync</Text>
        <Text style={styles.tagline}>
          Empowering Farmers, Connecting Markets
        </Text>
      </Animated.View>

      <View style={styles.featuresContainer}>
        <FeatureItem
          icon="leaf-outline"
          text="Sell your produce directly"
        />
        <FeatureItem
          icon="cash-outline"
          text="Get the best market prices"
        />
        <FeatureItem
          icon="bulb-outline"
          text="AI-powered crop recommendations"
        />
        <FeatureItem
          icon="stats-chart-outline"
          text="Track your earnings in real-time"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleRegister}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            New Farmer? Register Now
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Made by InitCore Developer's Group
        </Text>
      </View>
    </LinearGradient>
  );
}

const FeatureItem = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={24} color={colors.white} style={styles.featureIcon} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: withOpacity(colors.white, 0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: withOpacity(colors.white, 0.3),
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: withOpacity(colors.white, 0.9),
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(colors.white, 0.15),
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureText: {
    fontSize: 15,
    color: colors.white,
    flex: 1,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.transparent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: withOpacity(colors.white, 0.8),
    marginTop: 20,
    fontSize: 14,
  },
});