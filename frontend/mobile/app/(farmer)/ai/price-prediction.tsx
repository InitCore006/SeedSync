import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAI } from '@/hooks/useAI';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Picker from '@/components/common/Picker';
import PriceChart from '@/components/ai/PriceChart';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { CROPS } from '@/lib/constants/crops';

const MARKETS = [
  { label: 'Nagpur Mandi', value: 'nagpur' },
  { label: 'Mumbai APMC', value: 'mumbai' },
  { label: 'Pune Mandi', value: 'pune' },
  { label: 'Delhi Azadpur', value: 'delhi' },
  { label: 'Bangalore APMC', value: 'bangalore' },
];

export default function PricePredictionScreen() {
  const { currentPricePrediction, getPriceForecast, isLoading } = useAI();
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('nagpur');
  const [refreshing, setRefreshing] = useState(false);

  const cropOptions = CROPS?.map((crop) => ({
    label: crop.name,
    value: crop.name,
  })) || [];

  const handleFetchPrediction = async () => {
    if (selectedCrop && getPriceForecast) {
      await getPriceForecast(selectedCrop, selectedMarket);
    }
  };

  const onRefresh = async () => {
    if (selectedCrop && getPriceForecast) {
      setRefreshing(true);
      await getPriceForecast(selectedCrop, selectedMarket);
      setRefreshing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.secondary;
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return '✅';
      case 'negative':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Price Prediction</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💰</Text>
            <Text style={styles.infoTitle}>AI-Powered Price Forecasting</Text>
            <Text style={styles.infoText}>
              Get accurate price predictions for the next 30, 60, and 90 days based on
              historical data, market trends, and demand patterns.
            </Text>
          </View>

          <View style={styles.searchSection}>
            <Picker
              label="Select Crop"
              selectedValue={selectedCrop}
              onValueChange={setSelectedCrop}
              items={cropOptions}
              placeholder="Choose a crop"
            />

            <Picker
              label="Select Market"
              selectedValue={selectedMarket}
              onValueChange={setSelectedMarket}
              items={MARKETS}
            />

            <Button
              title={isLoading ? 'Loading...' : 'Get Price Forecast'}
              onPress={handleFetchPrediction}
              disabled={!selectedCrop || isLoading}
            />
          </View>

          {isLoading && !refreshing ? (
            <LoadingSpinner />
          ) : currentPricePrediction ? (
            <>
              <View style={styles.currentPriceCard}>
                <View style={styles.currentPriceHeader}>
                  <Text style={styles.currentPriceLabel}>Current Market Price</Text>
                  <Text style={styles.currentPriceDate}>
                    {new Date(currentPricePrediction.lastUpdated).toLocaleDateString('en-IN')}
                  </Text>
                </View>
                <Text style={styles.currentPriceValue}>
                  ₹{currentPricePrediction.currentPrice?.toLocaleString('en-IN') || '0'}
                  <Text style={styles.currentPriceUnit}>/quintal</Text>
                </Text>
                <View style={styles.currentPriceDetails}>
                  <Text style={styles.currentPriceVariety}>
                    {currentPricePrediction.variety || 'N/A'}
                  </Text>
                  <Text style={styles.currentPriceMarket}>
                    {currentPricePrediction.market || 'N/A'}
                  </Text>
                </View>
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>AI Confidence:</Text>
                  <View style={styles.confidenceBar}>
                    <View
                      style={[
                        styles.confidenceProgress,
                        { width: `${currentPricePrediction.confidence || 0}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.confidenceValue}>
                    {currentPricePrediction.confidence || 0}%
                  </Text>
                </View>
              </View>

              {currentPricePrediction.predictions && currentPricePrediction.predictions.length > 0 && (
                <View style={styles.predictionsSection}>
                  <Text style={styles.sectionTitle}>Price Predictions</Text>
                  <View style={styles.predictionCards}>
                    {currentPricePrediction.predictions.slice(0, 3).map((pred, index) => {
                      if (!pred) return null;
                      
                      const currentPrice = currentPricePrediction.currentPrice || 0;
                      const predictedPrice = pred.price || 0;
                      const changePercent = currentPrice > 0 
                        ? ((predictedPrice - currentPrice) / currentPrice * 100).toFixed(1)
                        : '0.0';

                      return (
                        <View key={index} style={styles.predictionCard}>
                          <Text style={styles.predictionPeriod}>
                            {index === 0 ? '30 Days' : index === 1 ? '60 Days' : '90 Days'}
                          </Text>
                          <Text style={styles.predictionPrice}>
                            ₹{predictedPrice.toLocaleString('en-IN')}
                          </Text>
                          <View style={styles.predictionTrend}>
                            <Text style={styles.trendIcon}>{getTrendIcon(pred.trend || 'stable')}</Text>
                            <Text
                              style={[
                                styles.trendText,
                                { color: getTrendColor(pred.trend || 'stable') },
                              ]}
                            >
                              {pred.trend === 'up'
                                ? `+${changePercent}%`
                                : pred.trend === 'down'
                                ? `${changePercent}%`
                                : 'Stable'}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {currentPricePrediction.historicalData && 
               currentPricePrediction.predictions && 
               (currentPricePrediction.historicalData.length > 0 || currentPricePrediction.predictions.length > 0) && (
                <PriceChart
                  data={[
                    ...(currentPricePrediction.historicalData || []).slice(-6),
                    ...(currentPricePrediction.predictions || []),
                  ]}
                  title="Price Trend Analysis"
                />
              )}

              {currentPricePrediction.insights && currentPricePrediction.insights.length > 0 && (
                <View style={styles.insightsSection}>
                  <Text style={styles.sectionTitle}>Market Insights</Text>
                  {currentPricePrediction.insights.map((insight, index) => {
                    if (!insight) return null;
                    
                    return (
                      <View key={index} style={styles.insightCard}>
                        <View style={styles.insightHeader}>
                          <Text style={styles.insightIcon}>
                            {getImpactIcon(insight.impact || 'neutral')}
                          </Text>
                          <View style={styles.insightHeaderText}>
                            <Text style={styles.insightTitle}>{insight.title || 'N/A'}</Text>
                            <View style={styles.insightMeta}>
                              <Text style={styles.insightType}>{insight.type || 'info'}</Text>
                              <Text style={styles.insightConfidence}>
                                {insight.confidence || 0}% confidence
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Text style={styles.insightDescription}>
                          {insight.description || 'No description available'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {currentPricePrediction.predictions && currentPricePrediction.predictions.length > 0 && (
                <View style={styles.actionSection}>
                  <Text style={styles.actionTitle}>Recommendations</Text>
                  <View style={styles.actionCards}>
                    <View
                      style={[
                        styles.actionCard,
                        { backgroundColor: `${colors.success}15` },
                      ]}
                    >
                      <Text style={styles.actionIcon}>✅</Text>
                      <Text style={styles.actionLabel}>Best Time to Sell</Text>
                      <Text style={styles.actionValue}>
                        {currentPricePrediction.predictions[0]?.trend === 'up'
                          ? 'Wait 30-60 days'
                          : 'Sell Now'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.actionCard,
                        { backgroundColor: `${colors.primary}15` },
                      ]}
                    >
                      <Text style={styles.actionIcon}>💰</Text>
                      <Text style={styles.actionLabel}>Expected Gain</Text>
                      <Text style={styles.actionValue}>
                        ₹
                        {(Math.max(
                          ...(currentPricePrediction.predictions || []).map((p) => p?.price || 0)
                        ) - (currentPricePrediction.currentPrice || 0)).toLocaleString('en-IN')}
                        /Q
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          ) : (
            <EmptyState
              icon="📊"
              title="No Predictions Available"
              description="Select a crop and market to view price predictions"
            />
          )}

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerIcon}>ℹ️</Text>
            <Text style={styles.disclaimerText}>
              Price predictions are based on AI analysis of historical data and market trends.
              Actual prices may vary based on quality, demand, and local market conditions.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
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
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  searchSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  currentPriceCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  currentPriceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  currentPriceLabel: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
  },
  currentPriceDate: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.8,
  },
  currentPriceValue: {
    ...typography.h1,
    fontSize: 48,
    color: colors.surface,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  currentPriceUnit: {
    ...typography.body,
    fontSize: 20,
  },
  currentPriceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  currentPriceVariety: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
  },
  currentPriceMarket: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  confidenceLabel: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.9,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceProgress: {
    height: '100%',
    backgroundColor: colors.surface,
    borderRadius: 3,
  },
  confidenceValue: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  predictionsSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  predictionCards: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  predictionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  predictionPeriod: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  predictionPrice: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  predictionTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendIcon: {
    fontSize: 16,
  },
  trendText: {
    ...typography.caption,
    fontWeight: '600',
  },
  insightsSection: {
    marginBottom: spacing.md,
  },
  insightCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  insightHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  insightIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  insightHeaderText: {
    flex: 1,
  },
  insightTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  insightMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  insightType: {
    ...typography.caption,
    color: colors.accent,
    textTransform: 'capitalize',
  },
  insightConfidence: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  insightDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  actionSection: {
    marginBottom: spacing.md,
  },
  actionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionCards: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  actionValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  disclaimerCard: {
    backgroundColor: `${colors.warning}15`,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
  },
  disclaimerIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    flex: 1,
  },
});