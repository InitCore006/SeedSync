import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMarket } from '@/hooks/useMarket';
import { LineChart } from 'react-native-chart-kit';
import CropAnalyticsCard from '@/components/market/CropAnalyticsCard';
import PriceCard from '@/components/market/PriceCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function MarketDetailsScreen() {
  const { cropId } = useLocalSearchParams<{ cropId: string }>();
  const {
    crops,
    prices,
    priceHistory,
    cropAnalytics,
    isLoading,
    fetchPriceHistory,
    fetchCropAnalytics,
    createPriceAlert,
  } = useMarket();

  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    if (cropId) {
      fetchPriceHistory(cropId, selectedPeriod);
      fetchCropAnalytics(cropId);
    }
  }, [cropId, selectedPeriod]);

  const crop = crops.find((c) => c.id === cropId);
  const cropPrices = prices.filter((p) => p.cropId === cropId);
  const history = priceHistory[cropId || ''] || [];
  const analytics = cropAnalytics[cropId || ''];

  const periods = [
    { label: '7D', value: 7 },
    { label: '1M', value: 30 },
    { label: '3M', value: 90 },
  ];

  const getChartData = () => {
    if (!history.length) return null;

    const data = history.slice(-selectedPeriod);

    return {
      labels: data.map((h) => {
        const date = new Date(h.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          data: data.map((h) => h.price),
          color: () => colors.primary,
          strokeWidth: 3,
        },
      ],
    };
  };

  const chartData = getChartData();

  const handleCreateAlert = async () => {
    if (!crop) return;

    try {
      await createPriceAlert({
        userId: 'user123', // Get from auth context
        cropId: crop.id,
        cropName: crop.name,
        targetPrice: cropPrices[0]?.price || 0,
        condition: 'above',
        isActive: true,
      });
      setShowAlertModal(false);
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  if (!crop) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Crop Details</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Crop not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.cropIcon}>{crop.icon}</Text>
          <Text style={styles.title}>{crop.name}</Text>
        </View>
        <Pressable onPress={handleCreateAlert}>
          <Text style={styles.alertButton}>🔔</Text>
        </Pressable>
      </View>

      {isLoading && !history.length ? (
        <LoadingSpinner />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Crop Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Hindi Name:</Text>
                <Text style={styles.infoValue}>{crop.nameHindi}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Category:</Text>
                <Text style={styles.infoValue}>{crop.category}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Unit:</Text>
                <Text style={styles.infoValue}>{crop.unit}</Text>
              </View>
            </View>

            {/* Varieties */}
            {crop.varieties.length > 0 && (
              <View style={styles.varietiesCard}>
                <Text style={styles.varietiesTitle}>Popular Varieties</Text>
                <View style={styles.varietiesList}>
                  {crop.varieties.map((variety, index) => (
                    <View key={index} style={styles.varietyTag}>
                      <Text style={styles.varietyText}>{variety}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Price Chart */}
            {chartData && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>Price Trend</Text>
                  <View style={styles.periodSelector}>
                    {periods.map((period) => (
                      <Pressable
                        key={period.value}
                        style={[
                          styles.periodButton,
                          selectedPeriod === period.value && styles.periodButtonActive,
                        ]}
                        onPress={() => setSelectedPeriod(period.value as 7 | 30 | 90)}
                      >
                        <Text
                          style={[
                            styles.periodButtonText,
                            selectedPeriod === period.value && styles.periodButtonTextActive,
                          ]}
                        >
                          {period.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={chartData}
                    width={Math.max(Dimensions.get('window').width - 32, selectedPeriod * 15)}
                    height={220}
                    chartConfig={{
                      backgroundColor: colors.surface,
                      backgroundGradientFrom: colors.surface,
                      backgroundGradientTo: colors.surface,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                      labelColor: () => colors.text.secondary,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: colors.primary,
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                </ScrollView>
              </View>
            )}

            {/* Analytics */}
            {analytics && <CropAnalyticsCard analytics={analytics} />}

            {/* Current Prices */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Market Prices</Text>
              {cropPrices.length === 0 ? (
                <View style={styles.noPricesCard}>
                  <Text style={styles.noPricesIcon}>📊</Text>
                  <Text style={styles.noPricesText}>No prices available</Text>
                </View>
              ) : (
                cropPrices.map((price) => <PriceCard key={price.id} price={price} />)
              )}
            </View>

            {/* Trade Actions */}
            <View style={styles.tradeActions}>
              <Pressable
                style={[styles.tradeButton, styles.buyButton]}
                onPress={() =>
                  router.push({
                    pathname: '/(farmer)/market/trade/create',
                    params: { type: 'buy', cropId: crop.id },
                  })
                }
              >
                <Text style={styles.tradeButtonText}>🛒 Looking to Buy</Text>
              </Pressable>

              <Pressable
                style={[styles.tradeButton, styles.sellButton]}
                onPress={() =>
                  router.push({
                    pathname: '/(farmer)/market/trade/create',
                    params: { type: 'sell', cropId: crop.id },
                  })
                }
              >
                <Text style={styles.tradeButtonText}>📦 Want to Sell</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cropIcon: {
    fontSize: 24,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  alertButton: {
    fontSize: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  varietiesCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  varietiesTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  varietiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  varietyTag: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
  },
  varietyText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: colors.surface,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  noPricesCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
  },
  noPricesIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  noPricesText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  tradeActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tradeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: colors.primary,
  },
  sellButton: {
    backgroundColor: colors.success,
  },
  tradeButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  },
});