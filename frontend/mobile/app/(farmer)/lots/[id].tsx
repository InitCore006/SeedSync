import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFarmerStore } from '@/store/farmerStore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing, borderRadius } from '@lib/constants/spacing';
import { formatCurrency, formatQuantity, formatDate } from '@lib/utils/format';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.6;

export default function LotDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedLot, lotsLoading, loadLotDetail, deleteLot } = useFarmerStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadLotDetail(id);
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Lot',
      'Are you sure you want to delete this lot? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLot(id);
              Alert.alert('Success', 'Lot deleted successfully');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete lot');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/(farmer)/lots/edit/${id}`);
  };

  if (lotsLoading || !selectedLot) {
    return <LoadingSpinner fullScreen message="Loading lot details..." />;
  }

  const lot = selectedLot;
  const images = lot.images || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lot Details</Text>
        <View style={styles.headerActions}>
          {lot.status === 'DRAFT' && (
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <Ionicons name="create-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        {/* Image Carousel */}
        {images.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            <View style={styles.pagination}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentImageIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={64} color={colors.gray[300]} />
          </View>
        )}

        <View style={styles.content}>
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: lot.status === 'ACTIVE' ? colors.success : colors.gray[400] },
              ]}
            >
              <Text style={styles.statusText}>{lot.status}</Text>
            </View>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>Grade {lot.quality_grade}</Text>
            </View>
          </View>

          {/* Basic Info */}
          <Text style={styles.lotNumber}>#{lot.lot_number}</Text>
          <Text style={styles.cropName}>
            {lot.crop_type} - {lot.variety}
          </Text>

          {/* Price & Quantity */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Quantity</Text>
              <Text style={styles.statValue}>{formatQuantity(lot.quantity)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Reserve Price</Text>
              <Text style={styles.statValue}>{formatCurrency(lot.reserve_price)}/Q</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Views</Text>
              <Text style={styles.statValue}>{lot.views_count}</Text>
            </View>
          </View>

          {/* Description */}
          {lot.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{lot.description}</Text>
            </View>
          )}

          {/* Quality Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quality Details</Text>
            <View style={styles.detailsGrid}>
              {lot.moisture_content && (
                <View style={styles.detailItem}>
                  <Ionicons name="water-outline" size={20} color={colors.primary[500]} />
                  <Text style={styles.detailLabel}>Moisture</Text>
                  <Text style={styles.detailValue}>{lot.moisture_content}%</Text>
                </View>
              )}
              {lot.oil_content && (
                <View style={styles.detailItem}>
                  <Ionicons name="flask-outline" size={20} color={colors.secondary[500]} />
                  <Text style={styles.detailLabel}>Oil Content</Text>
                  <Text style={styles.detailValue}>{lot.oil_content}%</Text>
                </View>
              )}
              {lot.foreign_matter && (
                <View style={styles.detailItem}>
                  <Ionicons name="leaf-outline" size={20} color={colors.warning} />
                  <Text style={styles.detailLabel}>Foreign Matter</Text>
                  <Text style={styles.detailValue}>{lot.foreign_matter}%</Text>
                </View>
              )}
              {lot.damaged_seeds && (
                <View style={styles.detailItem}>
                  <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                  <Text style={styles.detailLabel}>Damaged Seeds</Text>
                  <Text style={styles.detailValue}>{lot.damaged_seeds}%</Text>
                </View>
              )}
            </View>
          </View>

          {/* Pickup Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Details</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.gray[600]} />
              <Text style={styles.infoText}>{lot.pickup_location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.gray[600]} />
              <Text style={styles.infoText}>
                {formatDate(lot.available_from)} - {formatDate(lot.available_to)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={20} color={colors.gray[600]} />
              <Text style={styles.infoText}>
                Packaging: {lot.packaging_type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Timestamps */}
          <View style={styles.section}>
            <Text style={styles.timestampText}>Created: {formatDate(lot.created_at)}</Text>
            <Text style={styles.timestampText}>Updated: {formatDate(lot.updated_at)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      {lot.status === 'ACTIVE' && (
        <View style={styles.footer}>
          <Button
            title="Edit Lot"
            variant="outline"
            onPress={handleEdit}
            style={styles.footerButton}
          />
          <Button
            title="Mark as Sold"
            variant="primary"
            onPress={() => {
              // Handle mark as sold
              Alert.alert('Feature Coming Soon', 'This feature will be available soon.');
            }}
            style={styles.footerButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },

  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  headerButton: {
    padding: spacing.xs,
  },

  image: {
    width,
    height: IMAGE_HEIGHT,
  },

  imagePlaceholder: {
    width,
    height: IMAGE_HEIGHT,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },

  pagination: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },

  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },

  paginationDotActive: {
    backgroundColor: colors.primary[500],
    width: 24,
  },

  content: {
    padding: spacing.lg,
  },

  statusContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.inverse,
    textTransform: 'uppercase',
  },

  gradeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.secondary[100],
  },

  gradeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.secondary[500],
  },

  lotNumber: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  cropName: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statDivider: {
    width: 1,
    backgroundColor: colors.border.light,
  },

  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  statValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  description: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },

  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  detailItem: {
    width: `${(100 - 3) / 2}%`,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  detailValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },

  timestampText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background.default,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  footerButton: {
    flex: 1,
  },
});