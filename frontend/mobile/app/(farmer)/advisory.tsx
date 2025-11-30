import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Card from '@/components/common/Card';
import { colors } from '@/lib/constants/colors';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';

interface Advisory {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
  read: boolean;
}

export default function AdvisoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');

  const advisories: Advisory[] = [
    {
      id: '1',
      title: 'Heavy Rainfall Alert',
      category: 'Weather',
      description: 'Heavy rainfall expected in next 48 hours. Ensure proper drainage in fields.',
      priority: 'high',
      date: '2024-11-28',
      read: false,
    },
    {
      id: '2',
      title: 'Pest Control Advisory',
      category: 'Pest Management',
      description: 'Aphid infestation reported in nearby areas. Monitor your crops closely.',
      priority: 'medium',
      date: '2024-11-27',
      read: false,
    },
    {
      id: '3',
      title: 'Fertilizer Application',
      category: 'Crop Care',
      description: 'Optimal time for nitrogen fertilizer application for wheat crops.',
      priority: 'medium',
      date: '2024-11-26',
      read: true,
    },
    {
      id: '4',
      title: 'Market Price Update',
      category: 'Market',
      description: 'Soybean prices increased by 8% this week. Good time to sell.',
      priority: 'low',
      date: '2024-11-25',
      read: true,
    },
  ];

  const filters = [
    { id: 'all', label: 'All', count: advisories.length },
    { id: 'unread', label: 'Unread', count: advisories.filter((a) => !a.read).length },
    { id: 'high', label: 'High Priority', count: advisories.filter((a) => a.priority === 'high').length },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.gray[500];
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'weather':
        return 'cloud-outline';
      case 'pest management':
        return 'bug-outline';
      case 'crop care':
        return 'leaf-outline';
      case 'market':
        return 'trending-up-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const renderAdvisory = (advisory: Advisory) => (
    <Card key={advisory.id} style={styles.advisoryCard}>
      <View style={styles.advisoryHeader}>
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(advisory.priority) }]} />
        <View style={styles.advisoryHeaderContent}>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={getCategoryIcon(advisory.category) as any}
              size={14}
              color={colors.primary}
            />
            <Text style={styles.categoryText}>{advisory.category}</Text>
          </View>
          {!advisory.read && <View style={styles.unreadDot} />}
        </View>
      </View>

      <Text style={styles.advisoryTitle}>{advisory.title}</Text>
      <Text style={styles.advisoryDescription}>{advisory.description}</Text>

      <View style={styles.advisoryFooter}>
        <Text style={styles.advisoryDate}>
          {new Date(advisory.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Advisory</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {advisories.filter((a) => !a.read).length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              activeFilter === filter.id && styles.activeFilterChip,
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
            <View
              style={[
                styles.filterBadge,
                activeFilter === filter.id && styles.activeFilterBadge,
              ]}
            >
              <Text
                style={[
                  styles.filterBadgeText,
                  activeFilter === filter.id && styles.activeFilterBadgeText,
                ]}
              >
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Advisories List */}
      <ScrollView
        style={styles.advisoriesList}
        contentContainerStyle={styles.advisoriesContent}
        showsVerticalScrollIndicator={false}
      >
        {advisories.map(renderAdvisory)}
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
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
  filtersContainer: {
    maxHeight: 50,
    marginBottom: spacing.md,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activeFilterText: {
    color: colors.white,
  },
  filterBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: colors.white,
  },
  filterBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  activeFilterBadgeText: {
    color: colors.primary,
  },
  advisoriesList: {
    flex: 1,
  },
  advisoriesContent: {
    padding: spacing.lg,
  },
  advisoryCard: {
    marginBottom: spacing.md,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  advisoryHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  categoryText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  advisoryTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  advisoryDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  advisoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  advisoryDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});