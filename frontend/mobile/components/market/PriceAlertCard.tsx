import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { PriceAlert } from '@/types/market.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface PriceAlertCardProps {
  alert: PriceAlert;
  onDelete?: () => void;
  onToggle?: () => void;
}

const PriceAlertCard: React.FC<PriceAlertCardProps> = ({ alert, onDelete, onToggle }) => {
  const getConditionIcon = (condition: string) => {
    return condition === 'above' ? '📈' : '📉';
  };

  const getConditionText = (condition: string) => {
    return condition === 'above' ? 'rises above' : 'falls below';
  };

  return (
    <View style={[styles.container, !alert.isActive && styles.inactiveContainer]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getConditionIcon(alert.condition)}</Text>
        <View style={styles.alertInfo}>
          <Text style={styles.cropName}>{alert.cropName}</Text>
          <Text style={styles.condition}>
            Alert when price {getConditionText(alert.condition)}{' '}
            <Text style={styles.targetPrice}>₹{alert.targetPrice}</Text>
          </Text>
        </View>
        {onToggle && (
          <Pressable onPress={onToggle} style={styles.toggleButton}>
            <View style={[styles.toggle, alert.isActive && styles.toggleActive]}>
              <View style={[styles.toggleThumb, alert.isActive && styles.toggleThumbActive]} />
            </View>
          </Pressable>
        )}
      </View>

      {alert.marketId && (
        <View style={styles.marketInfo}>
          <Text style={styles.marketIcon}>📍</Text>
          <Text style={styles.marketText}>Specific market only</Text>
        </View>
      )}

      {alert.triggeredAt && (
        <View style={styles.triggeredInfo}>
          <Text style={styles.triggeredIcon}>🔔</Text>
          <Text style={styles.triggeredText}>
            Triggered on{' '}
            {new Date(alert.triggeredAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.createdText}>
          Created {new Date(alert.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
        {onDelete && (
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  inactiveContainer: {
    opacity: 0.6,
    borderLeftColor: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  alertInfo: {
    flex: 1,
  },
  cropName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  condition: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  targetPrice: {
    fontWeight: '700',
    color: colors.primary,
  },
  toggleButton: {
    padding: spacing.xs,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  marketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  marketIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  marketText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  triggeredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}15`,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  triggeredIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  triggeredText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  createdText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  deleteText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
});

export default PriceAlertCard;