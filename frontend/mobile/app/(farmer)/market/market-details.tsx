import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMarket } from '@/hooks/useMarket';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function MarketDetailsScreen() {
  const { marketId } = useLocalSearchParams<{ marketId: string }>();
  const { markets } = useMarket();
  const [selectedTab, setSelectedTab] = useState<'info' | 'commodities' | 'facilities'>('info');

  const market = markets.find((m) => m.id === marketId);

  useEffect(() => {
    if (!market) {
      Alert.alert('Error', 'Market not found', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [market]);

  const handleCall = async () => {
    if (!market?.contactNumber) return;
    
    const phoneUrl = `tel:${market.contactNumber}`;
    const canCall = await Linking.canOpenURL(phoneUrl);
    
    if (canCall) {
      Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Error', 'Cannot make phone calls on this device');
    }
  };

  const handleDirections = async () => {
    if (!market) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${market.latitude},${market.longitude}`;
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Cannot open maps on this device');
    }
  };

  const handleWebsite = async () => {
    if (!market?.website) return;
    
    const canOpen = await Linking.canOpenURL(market.website);
    
    if (canOpen) {
      Linking.openURL(market.website);
    } else {
      Alert.alert('Error', 'Cannot open website');
    }
  };

  if (!market) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Market Details</Text>
          <View style={{ width: 50 }} />
        </View>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  const tabs = [
    { key: 'info', label: 'Information', icon: 'ℹ️' },
    { key: 'commodities', label: 'Commodities', icon: '🌾' },
    { key: 'facilities', label: 'Facilities', icon: '🏢' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {market.name}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Market Header Card */}
      <View style={styles.marketHeader}>
        <View style={styles.marketHeaderTop}>
          <View style={styles.marketInfo}>
            <View style={styles.marketTypeBadge}>
              <Text style={styles.marketTypeText}>{market.type || 'Market'}</Text>
            </View>
            <Text style={styles.marketName}>{market.name}</Text>
            <Text style={styles.marketAddress}>
              📍 {market.address || 'N/A'}, {market.city || ''}, {market.state || ''}
            </Text>
            {market.distance !== undefined && (
              <Text style={styles.marketDistance}>🚗 {market.distance.toFixed(1)} km away</Text>
            )}
          </View>
        </View>

        {/* Status Badges */}
        <View style={styles.statusRow}>
          {market.isOpen && (
            <View style={[styles.statusBadge, styles.openBadge]}>
              <Text style={styles.statusBadgeText}>🟢 Open Now</Text>
            </View>
          )}
          {market.isEnamIntegrated && (
            <View style={[styles.statusBadge, styles.enamBadge]}>
              <Text style={styles.statusBadgeText}>✅ e-NAM</Text>
            </View>
          )}
          {market.isVerified && (
            <View style={[styles.statusBadge, styles.verifiedBadge]}>
              <Text style={styles.statusBadgeText}>✓ Verified</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {market.contactNumber && (
            <Pressable style={styles.actionButton} onPress={handleCall}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionLabel}>Call</Text>
            </Pressable>
          )}

          {market.latitude && market.longitude && (
            <Pressable style={styles.actionButton} onPress={handleDirections}>
              <Text style={styles.actionIcon}>🗺️</Text>
              <Text style={styles.actionLabel}>Directions</Text>
            </Pressable>
          )}

          {market.website && (
            <Pressable style={styles.actionButton} onPress={handleWebsite}>
              <Text style={styles.actionIcon}>🌐</Text>
              <Text style={styles.actionLabel}>Website</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Information Tab */}
          {selectedTab === 'info' && (
            <>
              {/* Operating Hours */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⏰ Operating Hours</Text>
                <View style={styles.infoCard}>
                  {market.openingTime && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Opening Time:</Text>
                      <Text style={styles.infoValue}>{market.openingTime}</Text>
                    </View>
                  )}
                  {market.closingTime && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Closing Time:</Text>
                      <Text style={styles.infoValue}>{market.closingTime}</Text>
                    </View>
                  )}
                  {market.workingDays && market.workingDays.length > 0 && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Working Days:</Text>
                      <Text style={styles.infoValue}>
                        {market.workingDays.join(', ')}
                      </Text>
                    </View>
                  )}
                  {(!market.openingTime && !market.closingTime && (!market.workingDays || market.workingDays.length === 0)) && (
                    <Text style={styles.emptyText}>No operating hours information available</Text>
                  )}
                </View>
              </View>

              {/* Contact Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📞 Contact Information</Text>
                <View style={styles.infoCard}>
                  {market.contactNumber && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Phone:</Text>
                      <Pressable onPress={handleCall}>
                        <Text style={[styles.infoValue, styles.linkText]}>
                          {market.contactNumber}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                  {market.email && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Email:</Text>
                      <Text style={styles.infoValue}>{market.email}</Text>
                    </View>
                  )}
                  {market.website && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Website:</Text>
                      <Pressable onPress={handleWebsite}>
                        <Text style={[styles.infoValue, styles.linkText]}>Visit Website</Text>
                      </Pressable>
                    </View>
                  )}
                  {(!market.contactNumber && !market.email && !market.website) && (
                    <Text style={styles.emptyText}>No contact information available</Text>
                  )}
                </View>
              </View>

              {/* Additional Info */}
              {market.description && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📝 About</Text>
                  <View style={styles.infoCard}>
                    <Text style={styles.descriptionText}>{market.description}</Text>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Commodities Tab */}
          {selectedTab === 'commodities' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌾 Available Commodities</Text>
              {market.commodities && market.commodities.length > 0 ? (
                <View style={styles.commoditiesGrid}>
                  {market.commodities.map((commodity, index) => (
                    <View key={index} style={styles.commodityCard}>
                      <Text style={styles.commodityIcon}>🌾</Text>
                      <Text style={styles.commodityName}>{commodity}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyText}>No commodity information available</Text>
                </View>
              )}
            </View>
          )}

          {/* Facilities Tab */}
          {selectedTab === 'facilities' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏢 Available Facilities</Text>
              {market.facilities && market.facilities.length > 0 ? (
                <View style={styles.facilitiesList}>
                  {market.facilities.map((facility, index) => (
                    <View key={index} style={styles.facilityItem}>
                      <Text style={styles.facilityIcon}>✓</Text>
                      <Text style={styles.facilityText}>{facility}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyIcon}>🏢</Text>
                  <Text style={styles.emptyText}>No facility information available</Text>
                </View>
              )}
            </View>
          )}
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
    ...typography.h4,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  marketHeader: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  marketHeaderTop: {
    marginBottom: spacing.md,
  },
  marketInfo: {
    gap: spacing.xs,
  },
  marketTypeBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  marketTypeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  marketName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  marketAddress: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  marketDistance: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: `${colors.success}20`,
  },
  enamBadge: {
    backgroundColor: `${colors.accent}20`,
  },
  verifiedBadge: {
    backgroundColor: `${colors.primary}20`,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.sm,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  descriptionText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  commoditiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  commodityCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    width: '31%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  commodityIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  commodityName: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  facilitiesList: {
    gap: spacing.sm,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  facilityIcon: {
    fontSize: 18,
    color: colors.success,
  },
  facilityText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});