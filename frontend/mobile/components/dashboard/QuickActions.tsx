import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, withOpacity } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={action.onPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: withOpacity(action.color, 0.15) }]}>
              <Ionicons name={action.icon} size={28} color={action.color} />
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
});