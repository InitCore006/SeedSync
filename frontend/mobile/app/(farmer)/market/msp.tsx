import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMarket } from '@/hooks/useMarket';
import MSPCard from '@/components/market/MSPCard';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function MSPScreen() {
  const { mspInfo, isLoading, fetchMSPInfo } = useMarket();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<'all' | 'kharif' | 'rabi'>('all');

  useEffect(() => {
    fetchMSPInfo();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMSPInfo();
    setRefreshing(false);
  };

  const seasons = [
    { label: 'All Seasons', value: 'all' },
    { label: '🌾 Kharif', value: 'kharif' },
    { label: '🌱 Rabi', value: 'rabi' },
  ];

  const filteredMSP = mspInfo.filter((msp) => {
    const matchesSearch = msp.cropName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeason = selectedSeason === 'all' || msp.season === selectedSeason;
    return matchesSearch && matchesSeason;
  });

  const kharifCount = mspInfo.filter((m) => m.season === 'kharif').length;
  const rabiCount = mspInfo.filter((m) => m.season === 'rabi').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>MSP Information</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading && mspInfo.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Minimum Support Price (MSP)</Text>
              <Text style={styles.infoText}>
                Government guaranteed minimum price for crops to protect farmers from price crashes
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{mspInfo.length}</Text>
              <Text style={styles.statLabel}>Total Crops</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{kharifCount}</Text>
              <Text style={styles.statLabel}>Kharif Season</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{rabiCount}</Text>
              <Text style={styles.statLabel}>Rabi Season</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search crops..."
                placeholderTextColor={colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearIcon}>✕</Text>
                </Pressable>
              )}
            </View>

            {/* Season Filter */}
            <View style={styles.seasonFilter}>
              {seasons.map((season) => (
                <Pressable
                  key={season.value}
                  style={[
                    styles.seasonButton,
                    selectedSeason === season.value && styles.seasonButtonActive,
                  ]}
                  onPress={() => setSelectedSeason(season.value as 'all' | 'kharif' | 'rabi')}
                >
                  <Text
                    style={[
                      styles.seasonButtonText,
                      selectedSeason === season.value && styles.seasonButtonTextActive,
                    ]}
                  >
                    {season.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.content}>
              {filteredMSP.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No MSP Data Found"
                  description={
                    searchQuery
                      ? `No results for "${searchQuery}"`
                      : 'No MSP information available for selected season'
                  }
                />
              ) : (
                filteredMSP.map((msp) => <MSPCard key={msp.id} msp={msp} />)
              )}
            </View>
          </ScrollView>
        </>
      )}
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent}15`,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  searchSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    height: '100%',
  },
  clearIcon: {
    ...typography.body,
    color: colors.text.secondary,
    padding: spacing.xs,
  },
  seasonFilter: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  seasonButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  seasonButtonActive: {
    backgroundColor: colors.primary,
  },
  seasonButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  seasonButtonTextActive: {
    color: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});