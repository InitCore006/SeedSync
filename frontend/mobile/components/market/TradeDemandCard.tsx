import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TradeDemand } from '@/types/market.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface TradeDemandCardProps {
  demand: TradeDemand;
  onPress?: () => void;
  showContact?: boolean;
}

const TradeDemandCard: React.FC<TradeDemandCardProps> = ({ 
  demand, 
  onPress,
  showContact = false 
}) => {
  const getTypeColor = (type: string) => {
    return type === 'buy' ? colors.primary : colors.success;
  };

  const getTypeIcon = (type: string) => {
    return type === 'buy' ? '🛒' : '📦';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { label: 'Active', color: colors.success },
      completed: { label: 'Completed', color: colors.text.secondary },
      expired: { label: 'Expired', color: colors.error },
      cancelled: { label: 'Cancelled', color: colors.text.secondary },
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.typeSection}>
          <Text style={styles.typeIcon}>{getTypeIcon(demand.type)}</Text>
          <View>
            <View style={[styles.typeBadge, { backgroundColor: `${getTypeColor(demand.type)}20` }]}>
              <Text style={[styles.typeBadgeText, { color: getTypeColor(demand.type) }]}>
                {demand.type === 'buy' ? 'BUYING' : 'SELLING'}
              </Text>
            </View>
            {demand.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: getStatusBadge(demand.status).color }]}>
            {getStatusBadge(demand.status).label}
          </Text>
        </View>
      </View>

      <View style={styles.cropInfo}>
        <Text style={styles.cropName}>{demand.cropName}</Text>
        {demand.variety && <Text style={styles.variety}>{demand.variety}</Text>}
      </View>

      <View style={styles.quantityPrice}>
        <View style={styles.quantityContainer}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>
            {demand.quantity} {demand.unit}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceContainer}>
          <Text style={styles.label}>Price</Text>
          <Text style={styles.priceValue}>₹{demand.pricePerUnit}/{demand.unit}</Text>
        </View>
      </View>

      <View style={styles.totalPrice}>
        <Text style={styles.totalLabel}>Total Value:</Text>
        <Text style={styles.totalValue}>₹{demand.totalPrice.toLocaleString('en-IN')}</Text>
      </View>

      {demand.description && (
        <Text style={styles.description} numberOfLines={2}>
          {demand.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.location}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            {demand.location}, {demand.district}
          </Text>
        </View>
        <Text style={styles.time}>{formatTimeAgo(demand.postedAt)}</Text>
      </View>

      {showContact && (
        <View style={styles.contactSection}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{demand.contactName}</Text>
            <Text style={styles.contactNumber}>{demand.contactNumber}</Text>
          </View>
        </View>
      )}

      <View style={styles.expiryInfo}>
        <Text style={styles.expiryIcon}>⏰</Text>
        <Text style={styles.expiryText}>
          Expires on {new Date(demand.expiresAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      </View>
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
  typeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeIcon: {
    fontSize: 32,
  },
  typeBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  typeBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedIcon: {
    fontSize: 10,
    color: colors.success,
  },
  verifiedText: {
    ...typography.caption,
    fontSize: 9,
    color: colors.success,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  statusText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  cropInfo: {
    marginBottom: spacing.sm,
  },
  cropName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  variety: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  quantityPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  quantityContainer: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  priceContainer: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  priceValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  totalPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  totalValue: {
    ...typography.h4,
    color: colors.primary,
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  locationText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  time: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  contactSection: {
    backgroundColor: `${colors.primary}10`,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  contactNumber: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  expiryIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  expiryText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});

export default TradeDemandCard;