import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMarket } from '@/hooks/useMarket';
import { useAuth } from '@/hooks/useAuth';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function TradeDetailsScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { tradeDemands } = useMarket();
  const { user } = useAuth();
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Safe access to tradeDemands with fallback
  const tradeListings = tradeDemands || [];
  const listing = tradeListings.find((l) => l?.id === listingId);
  const isOwnListing = listing?.userId === user?.id;

  useEffect(() => {
    if (!listing && listingId) {
      Alert.alert('Error', 'Listing not found', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [listing, listingId]);

  const handleCall = async () => {
    if (!listing?.contactNumber) return;

    const phoneUrl = `tel:${listing.contactNumber}`;
    try {
      const canCall = await Linking.canOpenURL(phoneUrl);
      if (canCall) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Cannot make phone calls on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to make call');
    }
  };

  const handleWhatsApp = async () => {
    if (!listing?.contactNumber) return;

    try {
      const message = `Hi, I'm interested in your ${listing.type === 'buy' ? 'buying request' : 'selling offer'} for ${listing.cropName || 'crop'}`;
      const phoneNumber = listing.contactNumber.replace(/\D/g, '');
      const whatsappUrl = `whatsapp://send?phone=91${phoneNumber}&text=${encodeURIComponent(message)}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open WhatsApp');
    }
  };

  const handleShare = async () => {
    if (!listing) return;

    try {
      await Share.share({
        message: `${listing.type === 'buy' ? 'Buying Request' : 'Selling Offer'}: ${listing.cropName || 'Crop'}\n\nQuantity: ${listing.quantity || 0} ${listing.unit || 'kg'}\nPrice: ₹${listing.pricePerUnit || 0}/${listing.unit || 'kg'}\nLocation: ${listing.location || 'N/A'}, ${listing.district || 'N/A'}\n\nContact: ${listing.contactName || 'N/A'} - ${listing.contactNumber || 'N/A'}`,
        title: `${listing.cropName || 'Crop'} - ${listing.type === 'buy' ? 'Buy' : 'Sell'}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleMarkAsSold = () => {
    Alert.alert(
      'Mark as Sold',
      'Are you sure you want to mark this listing as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Mark as Sold',
          style: 'destructive',
          onPress: () => {
            // TODO: Update listing status via API
            Alert.alert('Success', 'Listing marked as completed');
            router.back();
          },
        },
      ]
    );
  };

  const handleEditListing = () => {
    router.push({
      pathname: '/(farmer)/market/trade/create',
      params: { editId: listing?.id },
    });
  };

  const handleDeleteListing = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Delete listing via API
            Alert.alert('Success', 'Listing deleted successfully');
            router.back();
          },
        },
      ]
    );
  };

  const handleReportListing = () => {
    Alert.alert(
      'Report Listing',
      'Please select a reason for reporting this listing:',
      [
        { text: 'Misleading Information', onPress: () => submitReport('misleading') },
        { text: 'Inappropriate Content', onPress: () => submitReport('inappropriate') },
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Fraud', onPress: () => submitReport('fraud') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const submitReport = (reason: string) => {
    // TODO: Submit report to backend
    Alert.alert('Thank You', 'Your report has been submitted. We will review it shortly.');
  };

  if (!listing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Trade Details</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>Listing not found</Text>
          <Pressable style={styles.emptyButton} onPress={() => router.back()}>
            <Text style={styles.emptyButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const totalValue = (listing.quantity || 0) * (listing.pricePerUnit || 0);
  const daysAgo = listing.postedAt 
    ? Math.floor((Date.now() - new Date(listing.postedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const expiresInDays = listing.expiresAt
    ? Math.floor((new Date(listing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Trade Details</Text>
        <Pressable onPress={handleShare}>
          <Text style={styles.shareButton}>📤</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Listing Header */}
          <View style={styles.listingHeader}>
            <View style={styles.headerTop}>
              <View
                style={[
                  styles.typeBadge,
                  listing.type === 'buy' ? styles.buyBadge : styles.sellBadge,
                ]}
              >
                <Text style={styles.typeBadgeIcon}>
                  {listing.type === 'buy' ? '🛒' : '📦'}
                </Text>
                <Text style={styles.typeBadgeText}>
                  {listing.type === 'buy' ? 'BUYING REQUEST' : 'SELLING OFFER'}
                </Text>
              </View>

              {listing.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}
            </View>

            <Text style={styles.cropName}>{listing.cropName || 'N/A'}</Text>
            {listing.variety && (
              <Text style={styles.variety}>Variety: {listing.variety}</Text>
            )}

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  listing.status === 'active' && styles.statusActive,
                  listing.status === 'pending' && styles.statusPending,
                  listing.status === 'completed' && styles.statusCompleted,
                ]}
              >
                <Text style={styles.statusText}>
                  {listing.status 
                    ? listing.status.charAt(0).toUpperCase() + listing.status.slice(1)
                    : 'Unknown'}
                </Text>
              </View>
              {daysAgo > 0 && (
                <Text style={styles.postedTime}>Posted {daysAgo}d ago</Text>
              )}
            </View>
          </View>

          {/* Price Card */}
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Quantity</Text>
                <Text style={styles.priceValue}>
                  {listing.quantity || 0} {listing.unit || 'kg'}
                </Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Price per {listing.unit || 'kg'}</Text>
                <Text style={styles.priceValue}>
                  ₹{(listing.pricePerUnit || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
            <View style={styles.totalPriceRow}>
              <Text style={styles.totalPriceLabel}>Total Value</Text>
              <Text style={styles.totalPriceValue}>
                ₹{totalValue.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Description */}
          {listing.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Description</Text>
              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionText}>{listing.description}</Text>
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Location</Text>
            <View style={styles.locationCard}>
              {listing.location && (
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>Location:</Text>
                  <Text style={styles.locationValue}>{listing.location}</Text>
                </View>
              )}
              {listing.district && (
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>District:</Text>
                  <Text style={styles.locationValue}>{listing.district}</Text>
                </View>
              )}
              {listing.state && (
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>State:</Text>
                  <Text style={styles.locationValue}>{listing.state}</Text>
                </View>
              )}
              {!listing.location && !listing.district && !listing.state && (
                <Text style={styles.emptyText}>No location information available</Text>
              )}
            </View>
          </View>

          {/* Seller/Buyer Information */}
          {!isOwnListing && listing.contactName && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                👤 {listing.type === 'buy' ? 'Buyer' : 'Seller'} Information
              </Text>
              <View style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>
                      {listing.contactName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{listing.contactName}</Text>
                    {listing.verified && (
                      <Text style={styles.contactVerified}>✓ Verified User</Text>
                    )}
                  </View>
                </View>

                {!showContactInfo ? (
                  <Pressable
                    style={styles.showContactButton}
                    onPress={() => setShowContactInfo(true)}
                  >
                    <Text style={styles.showContactButtonText}>Show Contact Details</Text>
                  </Pressable>
                ) : (
                  <>
                    {listing.contactNumber && (
                      <View style={styles.contactDetails}>
                        <Text style={styles.contactPhone}>📞 {listing.contactNumber}</Text>
                      </View>
                    )}

                    <View style={styles.contactActions}>
                      {listing.contactNumber && (
                        <>
                          <Pressable style={styles.contactActionButton} onPress={handleCall}>
                            <Text style={styles.contactActionIcon}>📞</Text>
                            <Text style={styles.contactActionText}>Call</Text>
                          </Pressable>

                          <Pressable style={styles.contactActionButton} onPress={handleWhatsApp}>
                            <Text style={styles.contactActionIcon}>💬</Text>
                            <Text style={styles.contactActionText}>WhatsApp</Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

          {/* Expiry Info */}
          {expiresInDays > 0 && (
            <View style={styles.expiryCard}>
              <Text style={styles.expiryIcon}>⏰</Text>
              <Text style={styles.expiryText}>
                This listing expires in {expiresInDays} days
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {isOwnListing ? (
            <View style={styles.ownerActions}>
              {listing.status === 'active' && (
                <>
                  <Pressable style={styles.primaryButton} onPress={handleMarkAsSold}>
                    <Text style={styles.primaryButtonText}>Mark as Completed</Text>
                  </Pressable>

                  <View style={styles.secondaryActions}>
                    <Pressable style={styles.secondaryButton} onPress={handleEditListing}>
                      <Text style={styles.secondaryButtonText}>✏️ Edit</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.secondaryButton, styles.deleteButton]}
                      onPress={handleDeleteListing}
                    >
                      <Text style={[styles.secondaryButtonText, styles.deleteButtonText]}>
                        🗑️ Delete
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}

              {listing.status === 'completed' && (
                <View style={styles.completedBanner}>
                  <Text style={styles.completedIcon}>✅</Text>
                  <Text style={styles.completedText}>This listing has been completed</Text>
                </View>
              )}
            </View>
          ) : (
            <>
              {listing.status === 'active' && (
                <Pressable
                  style={styles.interestedButton}
                  onPress={() => setShowContactInfo(true)}
                >
                  <Text style={styles.interestedButtonText}>
                    I am Interested - Show Contact
                  </Text>
                </Pressable>
              )}

              <Pressable style={styles.reportButton} onPress={handleReportListing}>
                <Text style={styles.reportButtonText}>🚩 Report this listing</Text>
              </Pressable>
            </>
          )}

          {/* Safety Tips */}
          <View style={styles.safetyCard}>
            <Text style={styles.safetyTitle}>🛡️ Safety Tips</Text>
            <View style={styles.safetyTips}>
              <Text style={styles.safetyTip}>
                • Always verify the quality before making payment
              </Text>
              <Text style={styles.safetyTip}>
                • Meet in a public place or trusted location
              </Text>
              <Text style={styles.safetyTip}>
                • Do not share sensitive banking information
              </Text>
              <Text style={styles.safetyTip}>
                • Report suspicious listings immediately
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  shareButton: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  listingHeader: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  buyBadge: {
    backgroundColor: `${colors.accent}20`,
  },
  sellBadge: {
    backgroundColor: `${colors.success}20`,
  },
  typeBadgeIcon: {
    fontSize: 14,
  },
  typeBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  verifiedBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  cropName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  variety: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: `${colors.success}20`,
  },
  statusPending: {
    backgroundColor: `${colors.warning}20`,
  },
  statusCompleted: {
    backgroundColor: `${colors.border}40`,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  postedTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  priceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  priceValue: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
  },
  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPriceLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  totalPriceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.success,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  descriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  descriptionText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  locationValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  contactCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  contactAvatarText: {
    ...typography.h3,
    color: colors.surface,
    fontWeight: '700',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  contactVerified: {
    ...typography.caption,
    color: colors.success,
  },
  showContactButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  showContactButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  contactDetails: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  contactPhone: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contactActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  contactActionIcon: {
    fontSize: 18,
  },
  contactActionText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  expiryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}15`,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  expiryIcon: {
    fontSize: 20,
  },
  expiryText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  ownerActions: {
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  deleteButton: {
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}20`,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  completedIcon: {
    fontSize: 24,
  },
  completedText: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
    flex: 1,
  },
  interestedButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  interestedButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  },
  reportButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  reportButtonText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  safetyCard: {
    backgroundColor: `${colors.accent}10`,
    borderRadius: 12,
    padding: spacing.md,
  },
  safetyTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  safetyTips: {
    gap: spacing.xs,
  },
  safetyTip: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});