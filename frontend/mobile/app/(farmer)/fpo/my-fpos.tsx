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
import { useFPO } from '@/hooks/useFPO';
import MembershipCard from '@/components/fpo/MembershipCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function MyFPOsScreen() {
  const { fpos, memberships, isLoading, loadFPOs } = useFPO();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFPOs();
    setRefreshing(false);
  };

  const handleFPOPress = (fpoId: string) => {
    router.push({
      pathname: '/(farmer)/fpo/fpo-detail',
      params: { id: fpoId },
    });
  };

  const activeMemberships = memberships.filter((m) => m.status === 'active');
  const pendingMemberships = memberships.filter((m) => m.status === 'applied');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>My FPOs</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading && <LoadingSpinner />}

        {!isLoading && memberships.length === 0 && (
          <EmptyState
            icon="🏛️"
            title="No FPO memberships"
            message="Join an FPO to access their services and benefits"
          />
        )}

        {!isLoading && activeMemberships.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Active Memberships ({activeMemberships.length})
            </Text>
            {activeMemberships.map((membership) => {
              const fpo = fpos.find((f) => f.id === membership.fpoId);
              if (!fpo) return null;

              return (
                <Pressable
                  key={membership.id}
                  onPress={() => handleFPOPress(fpo.id)}
                >
                  <MembershipCard membership={membership} fpoName={fpo.name} />
                </Pressable>
              );
            })}
          </View>
        )}

        {!isLoading && pendingMemberships.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pending Applications ({pendingMemberships.length})
            </Text>
            {pendingMemberships.map((membership) => {
              const fpo = fpos.find((f) => f.id === membership.fpoId);
              if (!fpo) return null;

              return (
                <Pressable
                  key={membership.id}
                  onPress={() => handleFPOPress(fpo.id)}
                >
                  <MembershipCard membership={membership} fpoName={fpo.name} />
                </Pressable>
              );
            })}
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
});