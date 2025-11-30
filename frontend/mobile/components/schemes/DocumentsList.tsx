import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface DocumentsListProps {
  documents: string[];
}

export default function DocumentsList({ documents }: DocumentsListProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>📄</Text>
        <Text style={styles.title}>Required Documents</Text>
      </View>

      {/* Documents List */}
      <View style={styles.documentsList}>
        {documents.map((document, index) => (
          <View key={index} style={styles.documentItem}>
            <Text style={styles.documentNumber}>{index + 1}</Text>
            <Text style={styles.documentText}>{document}</Text>
          </View>
        ))}
      </View>

      {/* Info Note */}
      <View style={styles.infoNote}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Keep all documents ready before starting the application process
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  documentsList: {
    gap: spacing.sm,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  documentNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.surface,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '700',
    fontSize: 12,
  },
  documentText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.accent}15`,
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
});