import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { AppHeader, Sidebar } from '@/components';

export default function AIFeaturesScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const features = [
    {
      id: 'crop-recommendation',
      title: 'Crop Recommendations',
      description: 'Get AI-powered crop suggestions for your farm',
      icon: 'leaf',
      color: '#22c55e',
      route: '/(tabs)/ai/crop-recommendation',
      available: true,
    },
    {
      id: 'farming-assistant',
      title: 'Farming Assistant',
      description: 'Chat with AI for instant farming advice',
      icon: 'chatbubbles',
      color: '#8b5cf6',
      route: '/(tabs)/ai/farming-assistant',
      available: true,
    },
    {
      id: 'weather-advisory',
      title: 'Weather Advisory',
      description: '7-day forecast with AI farming actions',
      icon: 'rainy',
      color: '#3b82f6',
      route: '/(tabs)/ai/weather-advisory',
      available: true,
    },
    {
      id: 'disease-detection',
      title: 'Disease Detection',
      description: 'Upload crop images to detect diseases',
      icon: 'camera',
      color: '#ef4444',
      available: false,
    },
    {
      id: 'yield-prediction',
      title: 'Yield Prediction',
      description: 'AI-powered yield forecasts for crops',
      icon: 'analytics',
      color: '#10b981',
      available: false,
    },
    {
      id: 'price-prediction',
      title: 'Price Prediction',
      description: 'Predict market prices for better selling',
      icon: 'trending-up',
      color: '#f59e0b',
      available: false,
    },
  ];

  const handleFeaturePress = (feature: typeof features[0]) => {
    if (!feature.available) {
      return;
    }
    if (feature.route) {
      router.push(feature.route as any);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="AI Features" onMenuPress={() => setSidebarVisible(true)} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>AI-Powered Tools</Text>
          <Text style={styles.subtitle}>
            Leverage artificial intelligence to make smarter farming decisions
          </Text>
        </View>

        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.featureCard,
                !feature.available && styles.disabledCard,
              ]}
              onPress={() => handleFeaturePress(feature)}
              disabled={!feature.available}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: feature.color + '20' },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={32}
                  color={feature.available ? feature.color : COLORS.text.tertiary}
                />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
              {!feature.available && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            More AI features are under development and will be released soon.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  featuresGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabledCard: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  comingSoonBadge: {
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.secondary + '20',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
});
