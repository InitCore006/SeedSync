import React from 'react';
import { ScrollView, Text, StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function MarketplaceScreen() {
  const categories = [
    { id: 'prices', title: 'Market Prices', icon: '📊', route: '/(farmer)/market' },
    { id: 'trade', title: 'Buy/Sell', icon: '🤝', route: '/(farmer)/market/trade' },
    { id: 'msp', title: 'MSP Rates', icon: '💵', route: '/(farmer)/market/msp' },
    { id: 'nearby', title: 'Nearby Markets', icon: '📍', route: '/(farmer)/market/nearby' },
  ];

  return (
    <ScreenWrapper title="Marketplace">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Explore Marketplace</Text>
        <Text style={styles.subtitle}>
          Trade crops, check prices, and find nearby markets
        </Text>

        <View style={styles.grid}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push(category.route as any)}
            >
              <Text style={styles.cardIcon}>{category.icon}</Text>
              <Text style={styles.cardTitle}>{category.title}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    minHeight: 140,
    justifyContent: 'center',
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});