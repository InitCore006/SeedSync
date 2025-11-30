import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAI } from '@/hooks/useAI';
import ScanResultCard from '@/components/ai/ScanResultCard';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function ScanHistoryScreen() {
  const { scanResults, getScanHistory, isLoading } = useAI();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');

  useEffect(() => {
    getScanHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getScanHistory();
    setRefreshing(false);
  };

  const filteredResults = scanResults.filter((scan) => {
    if (filter === 'all') return true;
    return scan.overallStatus === filter;
  });

  const getFilterCount = (status: string) => {
    if (status === 'all') return scanResults.length;
    return scanResults.filter((s) => s.overallStatus === status).length;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Scan History</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.filterContainer}>
        <Pressable
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({getFilterCount('all')})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'healthy' && styles.filterTabActive]}
          onPress={() => setFilter('healthy')}
        >
          <Text style={[styles.filterText, filter === 'healthy' && styles.filterTextActive]}>
            Healthy ({getFilterCount('healthy')})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'warning' && styles.filterTabActive]}
          onPress={() => setFilter('warning')}
        >
          <Text style={[styles.filterText, filter === 'warning' && styles.filterTextActive]}>
            Warning ({getFilterCount('warning')})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'critical' && styles.filterTabActive]}
          onPress={() => setFilter('critical')}
        >
          <Text style={[styles.filterText, filter === 'critical' && styles.filterTextActive]}>
            Critical ({getFilterCount('critical')})
          </Text>
        </Pressable>
      </View>

      {isLoading && !refreshing ? (
        <LoadingSpinner />
      ) : filteredResults.length === 0 ? (
        <EmptyState
          icon="📸"
          title="No Scan Results"
          description="Start scanning your crops to see results here"
          actionLabel="Scan Now"
          onAction={() => router.push('/(farmer)/ai/crop-scanner')}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.content}>
            {filteredResults.map((scan) => (
              <ScanResultCard
                key={scan.id}
                scan={scan}
                onPress={() =>
                  router.push({
                    pathname: '/(farmer)/ai/scan-detail',
                    params: { scanId: scan.id },
                  })
                }
              />
            ))}
          </View>
        </ScrollView>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterTextActive: {
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