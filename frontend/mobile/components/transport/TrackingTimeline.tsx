import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrackingUpdate } from '@/types/transport.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface TrackingTimelineProps {
  updates: TrackingUpdate[];
}

export default function TrackingTimeline({ updates }: TrackingTimelineProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {updates.map((update, index) => (
        <View key={index} style={styles.updateItem}>
          {/* Timeline Indicator */}
          <View style={styles.timeline}>
            <View style={[
              styles.timelineDot,
              index === 0 && styles.timelineDotActive
            ]} />
            {index < updates.length - 1 && <View style={styles.timelineLine} />}
          </View>

          {/* Content */}
          <View style={styles.updateContent}>
            <View style={styles.updateHeader}>
              <Text style={styles.updateStatus}>{update.status}</Text>
              <Text style={styles.updateTime}>
                {new Date(update.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            
            <View style={styles.updateDetails}>
              <Text style={styles.updateIcon}>📍</Text>
              <Text style={styles.updateLocation}>{update.location}</Text>
            </View>
            
            {update.message && (
              <Text style={styles.updateMessage}>{update.message}</Text>
            )}
          </View>
        </View>
      ))}

      {updates.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No tracking updates yet</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  updateItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timeline: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
  },
  updateContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  updateStatus: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  updateTime: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  updateDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  updateIcon: {
    fontSize: 14,
  },
  updateLocation: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  updateMessage: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});