import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/lib/constants/colors';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';

interface Crop {
  id: string;
  name: string;
  variety: string;
  area: number;
  plantingDate: string;
  status: string;
  healthScore: number;
}

export default function MyCropsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - replace with actual API call
  const [crops] = useState<Crop[]>([
    {
      id: '1',
      name: 'Soybean',
      variety: 'JS 335',
      area: 12.5,
      plantingDate: '2024-06-15',
      status: 'Growing',
      healthScore: 85,
    },
    {
      id: '2',
      name: 'Wheat',
      variety: 'HD 2967',
      area: 8.0,
      plantingDate: '2024-11-10',
      status: 'Flowering',
      healthScore: 92,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'growing':
        return colors.success;
      case 'flowering':
        return colors.primary;
      case 'harvesting':
        return colors.warning;
      default:
        return colors.gray[500];
    }
  };

  const renderCropCard = ({ item }: { item: Crop }) => (
    <Card
      onPress={() => router.push(`/crops/${item.id}`)}
      style={styles.cropCard}
    >
      <View style={styles.cropHeader}>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{item.name}</Text>
          <Text style={styles.cropVariety}>{item.variety}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cropDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="resize-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{item.area} acres</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{new Date(item.plantingDate).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.healthBar}>
        <View style={styles.healthBarTrack}>
          <View 
            style={[
              styles.healthBarFill, 
              { width: `${item.healthScore}%`, backgroundColor: getStatusColor(item.status) }
            ]} 
          />
        </View>
        <Text style={styles.healthScore}>Health: {item.healthScore}%</Text>
      </View>

      <Pressable
        style={styles.aiButton}
        onPress={() => router.push({ pathname: '/ai/yield-prediction', params: { cropId: item.id } } as any)}
      >
        <Text style={styles.aiButtonIcon}>🤖</Text>
        <Text style={styles.aiButtonText}>AI Insights</Text>
      </Pressable>

    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Crops</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => {}}
        >
          <Ionicons name="options-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search crops..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.text.secondary}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{crops.length}</Text>
          <Text style={styles.statLabel}>Total Crops</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {crops.reduce((sum, crop) => sum + crop.area, 0).toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Total Area (Ac)</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round(crops.reduce((sum, crop) => sum + crop.healthScore, 0) / crops.length)}%
          </Text>
          <Text style={styles.statLabel}>Avg Health</Text>
        </View>
      </View>

      {/* Crops List */}
      {crops.length === 0 ? (
        <EmptyState
          icon="leaf-outline"
          title="No Crops Yet"
          description="Start by adding your first crop to track its growth and health"
          actionLabel="Add Crop"
          onAction={() => router.push('/crops/add-crop')}
        />
      ) : (
        <FlatList
          data={crops}
          renderItem={renderCropCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Crop Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/crops/add-crop')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color={colors.white} />
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    height: 48,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    color: colors.text.primary,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
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
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  cropCard: {
    marginBottom: spacing.md,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  cropVariety: {
    ...typography.body,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  cropDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  healthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  healthBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  healthScore: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Add these styles
aiButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: `${colors.primary}15`,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  borderRadius: 8,
  marginTop: spacing.sm,
},
aiButtonIcon: {
  fontSize: 16,
  marginRight: spacing.xs,
},
aiButtonText: {
  ...typography.caption,
  color: colors.primary,
  fontWeight: '600',
},
});