import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Market } from '@/types/market.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface MarketCardProps {
  market: Market;
  onPress?: () => void;
}

const MarketCard: React.FC<MarketCardProps> = ({ market, onPress }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'APMC':
        return '🏛️';
      case 'E-NAM':
        return '💻';
      case 'Private':
        return '🏪';
      case 'Farmers Market':
        return '🧑‍🌾';
      default:
        return '🏢';
    }
  };

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon(market.type)}</Text>
          <View>
            <Text style={styles.marketName}>{market.name}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{market.type}</Text>
            </View>
          </View>
        </View>
        {market.isEnamIntegrated && (
          <View style={styles.enamBadge}>
            <Text style={styles.enamText}>e-NAM</Text>
          </View>
        )}
      </View>

      <View style={styles.location}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText} numberOfLines={2}>
          {market.address}
        </Text>
      </View>

      {market.distance && (
        <View style={styles.distance}>
          <Text style={styles.distanceIcon}>🚗</Text>
          <Text style={styles.distanceText}>{market.distance.toFixed(1)} km away</Text>
        </View>
      )}

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>🕒</Text>
          <Text style={styles.detailText}>{market.operatingHours}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{market.operatingDays.length} days/week</Text>
        </View>
      </View>

      {market.facilities.length > 0 && (
        <View style={styles.facilities}>
          <Text style={styles.facilitiesLabel}>Facilities:</Text>
          <View style={styles.facilityTags}>
            {market.facilities.slice(0, 3).map((facility, index) => (
              <View key={index} style={styles.facilityTag}>
                <Text style={styles.facilityTagText}>{facility}</Text>
              </View>
            ))}
            {market.facilities.length > 3 && (
              <View style={styles.facilityTag}>
                <Text style={styles.facilityTagText}>+{market.facilities.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {market.popularCrops.length > 0 && (
        <View style={styles.crops}>
          <Text style={styles.cropsLabel}>Popular Crops:</Text>
          <Text style={styles.cropsText}>{market.popularCrops.join(', ')}</Text>
        </View>
      )}

      {market.contactNumber && (
        <View style={styles.contact}>
          <Text style={styles.contactIcon}>📞</Text>
          <Text style={styles.contactText}>{market.contactNumber}</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  marketName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  enamBadge: {
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enamText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.success,
    fontWeight: '700',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
    marginTop: 2,
  },
  locationText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  distanceIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  distanceText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  detailText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  facilities: {
    marginBottom: spacing.sm,
  },
  facilitiesLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  facilityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  facilityTag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  facilityTagText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text.primary,
  },
  crops: {
    marginBottom: spacing.xs,
  },
  cropsLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  cropsText: {
    ...typography.caption,
    color: colors.text.primary,
    lineHeight: 16,
  },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  contactIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  contactText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default MarketCard;