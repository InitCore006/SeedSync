import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { Document } from '@/types/profile.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface DocumentCardProps {
  document: Document;
  onDelete: () => void;
  onReupload: () => void;
}

export default function DocumentCard({ document, onDelete, onReupload }: DocumentCardProps) {
  const getStatusColor = () => {
    switch (document.status) {
      case 'verified':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getStatusIcon = () => {
    switch (document.status) {
      case 'verified':
        return '✓';
      case 'rejected':
        return '✕';
      default:
        return '⏳';
    }
  };

  const getStatusText = () => {
    switch (document.status) {
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Under Review';
    }
  };

  const handleViewDocument = () => {
    // Open image viewer or PDF viewer
    Alert.alert('View Document', 'Document viewer will be opened here');
  };

  const handleOptions = () => {
    const options = [
      { text: 'Cancel', style: 'cancel' },
      { text: 'View Document', onPress: handleViewDocument },
      { text: 'Re-upload', onPress: onReupload },
      { text: 'Delete', onPress: onDelete, style: 'destructive' },
    ];

    Alert.alert('Document Options', 'Choose an action:', options as any);
  };

  return (
    <Pressable style={styles.container} onPress={handleViewDocument}>
      {/* Document Preview */}
      <View style={styles.preview}>
        {document.documentUrl ? (
          <Image source={{ uri: document.documentUrl }} style={styles.previewImage} />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderIcon}>📄</Text>
          </View>
        )}
      </View>

      {/* Document Info */}
      <View style={styles.info}>
        <View style={styles.infoHeader}>
          <View style={styles.infoLeft}>
            {document.documentNumber && (
              <Text style={styles.documentNumber}>{document.documentNumber}</Text>
            )}
            <Text style={styles.uploadDate}>
              Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
            </Text>
          </View>
          <Pressable style={styles.optionsButton} onPress={handleOptions}>
            <Text style={styles.optionsIcon}>⋮</Text>
          </Pressable>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
          <Text style={[styles.statusIcon, { color: getStatusColor() }]}>
            {getStatusIcon()}
          </Text>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {/* Rejection Reason */}
        {document.status === 'rejected' && document.rejectionReason && (
          <View style={styles.rejectionBox}>
            <Text style={styles.rejectionLabel}>Reason for rejection:</Text>
            <Text style={styles.rejectionReason}>{document.rejectionReason}</Text>
          </View>
        )}

        {/* Verified Date */}
        {document.status === 'verified' && document.verifiedAt && (
          <Text style={styles.verifiedDate}>
            Verified on {new Date(document.verifiedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlaceholderIcon: {
    fontSize: 64,
  },
  info: {
    padding: spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  infoLeft: {
    flex: 1,
  },
  documentNumber: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  uploadDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  optionsButton: {
    padding: spacing.xs,
  },
  optionsIcon: {
    fontSize: 20,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
    fontWeight: '700',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  rejectionBox: {
    backgroundColor: `${colors.error}10`,
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  rejectionLabel: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
    marginBottom: 4,
  },
  rejectionReason: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  verifiedDate: {
    ...typography.caption,
    color: colors.success,
    fontStyle: 'italic',
  },
});