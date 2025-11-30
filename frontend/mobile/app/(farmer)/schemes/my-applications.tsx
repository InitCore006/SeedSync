import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSchemes } from '@/hooks/useSchemes';
import ApplicationCard from '@/components/schemes/ApplicationCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { ApplicationStatus } from '@/types/scheme.types';

type FilterType = 'all' | ApplicationStatus;

export default function MyApplicationsScreen() {
  const { schemes, applications, isLoading, loadSchemes } = useSchemes();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSchemes();
    setRefreshing(false);
  };

  const handleSchemePress = (schemeId: string) => {
    router.push({
      pathname: '/(farmer)/schemes/scheme-detail',
      params: { id: schemeId },
    });
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusCount = (status: ApplicationStatus) => {
    return applications.filter((a) => a.status === status).length;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>My Applications</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Pressable
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'all' && styles.filterButtonTextActive,
              ]}
            >
              All ({applications.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              filter === 'submitted' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('submitted')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'submitted' && styles.filterButtonTextActive,
              ]}
            >
              Submitted ({getStatusCount('submitted')})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              filter === 'under-review' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('under-review')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'under-review' && styles.filterButtonTextActive,
              ]}
            >
              Under Review ({getStatusCount('under-review')})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              filter === 'approved' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('approved')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'approved' && styles.filterButtonTextActive,
              ]}
            >
              ✓ Approved ({getStatusCount('approved')})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              filter === 'rejected' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('rejected')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'rejected' && styles.filterButtonTextActive,
              ]}
            >
              ✕ Rejected ({getStatusCount('rejected')})
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading && <LoadingSpinner />}

        {!isLoading && filteredApplications.length === 0 && (
          <EmptyState
            icon="📄"
            title="No applications found"
            message={
              filter === 'all'
                ? 'You haven\'t applied to any schemes yet'
                : `No ${filter.replace('-', ' ')} applications`
            }
          />
        )}

        {!isLoading && filteredApplications.length > 0 && (
          <>
            <Text style={styles.count}>
              {filteredApplications.length} application
              {filteredApplications.length !== 1 ? 's' : ''}
            </Text>
            {filteredApplications.map((application) => {
              const scheme = schemes.find((s) => s.id === application.schemeId);
              if (!scheme) return null;

              return (
                <Pressable
                  key={application.id}
                  onPress={() => handleSchemePress(scheme.id)}
                >
                  <ApplicationCard
                    application={application}
                    schemeName={scheme.name}
                  />
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
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
  filtersContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  count: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
});