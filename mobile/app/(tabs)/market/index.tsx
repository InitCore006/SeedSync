import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export default function MarketScreen() {
  const features = [
    {
      title: 'Browse Marketplace',
      description: 'Find and bid on available lots',
      icon: 'basket',
      color: COLORS.primary,
      route: '/(tabs)/market/browse',
    },
    {
      title: 'Market Prices',
      description: 'View live mandi prices and MSP',
      icon: 'pricetag',
      color: COLORS.success,
      route: '/(tabs)/market/prices',
    },
    {
      title: 'Weather Forecast',
      description: '5-day weather prediction',
      icon: 'cloudy',
      color: COLORS.secondary,
      route: '/(tabs)/market/weather',
    },
    {
      title: 'Disease Detection',
      description: 'AI-powered leaf disease detection',
      icon: 'camera',
      color: COLORS.warning,
      route: '/ai/disease-detection',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Intelligence</Text>
        <Text style={styles.subtitle}>
          Access real-time market data and AI-powered insights
        </Text>
      </View>

      <View style={styles.grid}>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => router.push(feature.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
              <Ionicons name={feature.icon as any} size={32} color={COLORS.white} />
            </View>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardDescription}>{feature.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  grid: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: 'center',
  },
});
