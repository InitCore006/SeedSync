import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GovernmentScheme } from '@/types/market.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface GovernmentSchemeCardProps {
  scheme: GovernmentScheme;
  onPress?: () => void;
}

const GovernmentSchemeCard: React.FC<GovernmentSchemeCardProps> = ({ scheme, onPress }) => {
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      subsidy: '💰',
      loan: '🏦',
      insurance: '🛡️',
      training: '📚',
      equipment: '🚜',
      other: '📋',
    };
    return icons[category] || '📋';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      subsidy: '#4CAF50',
      loan: '#2196F3',
      insurance: '#FF9800',
      training: '#9C27B0',
      equipment: '#F44336',
      other: '#607D8B',
    };
    return colors[category] || '#607D8B';
  };

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getCategoryIcon(scheme.category)}</Text>
        <View style={styles.headerContent}>
          <Text style={styles.name}>{scheme.name}</Text>
          <Text style={styles.nameHindi}>{scheme.nameHindi}</Text>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: `${getCategoryColor(scheme.category)}20` },
            ]}
          >
            <Text
              style={[styles.categoryText, { color: getCategoryColor(scheme.category) }]}
            >
              {scheme.category.toUpperCase()}
            </Text>
          </View>
        </View>
        {scheme.isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {scheme.description}
      </Text>

      {scheme.benefits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Key Benefits</Text>
          {scheme.benefits.slice(0, 3).map((benefit, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{benefit}</Text>
            </View>
          ))}
          {scheme.benefits.length > 3 && (
            <Text style={styles.moreText}>+{scheme.benefits.length - 3} more benefits</Text>
          )}
        </View>
      )}

      {scheme.eligibility.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Eligibility</Text>
          {scheme.eligibility.slice(0, 2).map((criteria, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{criteria}</Text>
            </View>
          ))}
          {scheme.eligibility.length > 2 && (
            <Text style={styles.moreText}>+{scheme.eligibility.length - 2} more criteria</Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>{scheme.contactInfo.phone}</Text>
          </View>
          {scheme.contactInfo.website && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>🌐</Text>
              <Text style={styles.contactText} numberOfLines={1}>
                {scheme.contactInfo.website.replace('https://', '')}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.updatedText}>
          Updated {new Date(scheme.lastUpdated).toLocaleDateString('en-IN', {
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
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  name: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  nameHindi: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
  },
  activeBadge: {
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
  },
  activeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.success,
    fontWeight: '700',
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    ...typography.caption,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  listText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
  moreText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  footer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contactInfo: {
    marginBottom: spacing.xs,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  contactText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  updatedText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'right',
  },
});

export default GovernmentSchemeCard;