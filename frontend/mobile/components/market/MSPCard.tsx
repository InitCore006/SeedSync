import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MSPInfo } from '@/types/market.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface MSPCardProps {
  msp: MSPInfo;
}

const MSPCard: React.FC<MSPCardProps> = ({ msp }) => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  
  const priceChange = msp.mspPrice - (msp.previousYearPrice || msp.mspPrice);
  const priceChangePercent = msp.previousYearPrice
    ? ((priceChange / msp.previousYearPrice) * 100).toFixed(1)
    : 0;
  const isIncrease = priceChange > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.cropIcon}>🌾</Text>
          <View style={styles.cropInfo}>
            <Text style={styles.cropName}>{msp.cropName}</Text>
            <View style={styles.seasonBadge}>
              <Text style={styles.seasonText}>
                {msp.season === 'kharif' ? '🌾' : '🌱'}{' '}
                {msp.season.charAt(0).toUpperCase() + msp.season.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <View style={[styles.currentPrice, msp.previousYearPrice ? { borderBottomWidth: 1, marginBottom: spacing.sm } : { borderBottomWidth: 0, marginBottom: 0 }]}>
          <Text style={styles.priceLabel}>MSP {currentYear}-{(currentYear + 1).toString().slice(-2)}</Text>
          <Text style={styles.priceValue}>₹{msp.mspPrice.toLocaleString('en-IN')}</Text>
          <Text style={styles.priceUnit}>per quintal</Text>
        </View>

        {msp.previousYearPrice && (
          <View style={styles.priceComparison}>
            <View style={styles.previousPrice}>
              <Text style={styles.previousPriceLabel}>
                Previous Year ({previousYear}-{currentYear.toString().slice(-2)})
              </Text>
              <Text style={styles.previousPriceValue}>
                ₹{msp.previousYearPrice.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={[styles.changeIndicator, isIncrease ? styles.increase : styles.decrease]}>
              <Text style={styles.changeIcon}>{isIncrease ? '📈' : '📉'}</Text>
              <Text style={[styles.changeText, isIncrease ? styles.increaseText : styles.decreaseText]}>
                {isIncrease ? '+' : ''}₹{Math.abs(priceChange).toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.changePercent, isIncrease ? styles.increaseText : styles.decreaseText]}>
                ({isIncrease ? '+' : ''}{priceChangePercent}%)
              </Text>
            </View>
          </View>
        )}
      </View>

      {msp.variety && (
        <View style={styles.varietyInfo}>
          <Text style={styles.varietyLabel}>Common Varieties:</Text>
          <Text style={styles.varietyText}>{msp.variety}</Text>
        </View>
      )}

      {msp.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesIcon}>ℹ️</Text>
          <Text style={styles.notesText}>{msp.notes}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cropIcon: {
    fontSize: 36,
    marginRight: spacing.sm,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  seasonBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  seasonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  priceContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  currentPrice: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 0,
    borderBottomColor: colors.border,
    marginBottom: 0,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 2,
  },
  priceUnit: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  priceComparison: {
    gap: spacing.sm,
  },
  previousPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previousPriceLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  previousPriceValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  increase: {
    backgroundColor: `${colors.success}15`,
  },
  decrease: {
    backgroundColor: `${colors.error}15`,
  },
  changeIcon: {
    fontSize: 16,
  },
  changeText: {
    ...typography.body,
    fontWeight: '700',
  },
  changePercent: {
    ...typography.caption,
    fontWeight: '600',
  },
  increaseText: {
    color: colors.success,
  },
  decreaseText: {
    color: colors.error,
  },
  varietyInfo: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  varietyLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  varietyText: {
    ...typography.body,
    color: colors.text.primary,
  },
  notesContainer: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent}10`,
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  notesIcon: {
    fontSize: 16,
  },
  notesText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
});

export default MSPCard;