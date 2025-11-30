import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/lib/constants/colors';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';

interface Lot {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  status: 'active' | 'pending' | 'sold';
  createdDate: string;
  expiryDate: string;
  views: number;
  inquiries: number;
}

export default function LotsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');

  const lots: Lot[] = [
    {
      id: '1',
      crop: 'Soybean',
      quantity: 50,
      unit: 'Quintal',
      pricePerUnit: 4500,
      status: 'active',
      createdDate: '2024-11-20',
      expiryDate: '2024-12-20',
      views: 45,
      inquiries: 8,
    },
    {
      id: '2',
      crop: 'Wheat',
      quantity: 30,
      unit: 'Quintal',
      pricePerUnit: 2200,
      status: 'pending',
      createdDate: '2024-11-25',
      expiryDate: '2024-12-25',
      views: 22,
      inquiries: 3,
    },
  ];

  const soldLots: Lot[] = [
    {
      id: '3',
      crop: 'Rice',
      quantity: 75,
      unit: 'Quintal',
      pricePerUnit: 3200,
      status: 'sold',
      createdDate: '2024-10-15',
      expiryDate: '2024-11-15',
      views: 89,
      inquiries: 15,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'sold':
        return colors.gray[500];
      default:
        return colors.text.secondary;
    }
  };

  const handleDeleteLot = (lotId: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Handle delete logic
            console.log('Delete lot:', lotId);
          },
        },
      ]
    );
  };

  const renderLot = (lot: Lot) => (
    <Card key={lot.id} style={styles.lotCard}>
      <View style={styles.lotHeader}>
        <View>
          <Text style={styles.cropName}>{lot.crop}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(lot.status)}15` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(lot.status) }]}>
              {lot.status.charAt(0).toUpperCase() + lot.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{lot.pricePerUnit}</Text>
          <Text style={styles.priceUnit}>/{lot.unit}</Text>
        </View>
      </View>

      <View style={styles.lotDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>
            {lot.quantity} {lot.unit}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>
            Expires {new Date(lot.expiryDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={18} color={colors.primary} />
          <Text style={styles.statText}>{lot.views} views</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="mail-outline" size={18} color={colors.primary} />
          <Text style={styles.statText}>{lot.inquiries} inquiries</Text>
        </View>
      </View>

      {lot.status !== 'sold' && (
        <View style={styles.lotActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {}}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteLot(lot.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  const displayLots = activeTab === 'active' ? lots : soldLots;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Listings</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => {}}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active ({lots.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sold' && styles.activeTab]}
          onPress={() => setActiveTab('sold')}
        >
          <Text style={[styles.tabText, activeTab === 'sold' && styles.activeTabText]}>
            Sold ({soldLots.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lots List */}
      {displayLots.length === 0 ? (
        <EmptyState
          icon="basket-outline"
          title="No Listings Yet"
          description={
            activeTab === 'active'
              ? 'Create your first listing to sell your produce'
              : 'You haven\'t sold any produce yet'
          }
          actionLabel={activeTab === 'active' ? 'Create Listing' : undefined}
          onAction={activeTab === 'active' ? () => {} : undefined}
        />
      ) : (
        <ScrollView
          style={styles.lotsList}
          contentContainerStyle={styles.lotsContent}
          showsVerticalScrollIndicator={false}
        >
          {displayLots.map(renderLot)}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.white,
  },
  lotsList: {
    flex: 1,
  },
  lotsContent: {
    padding: spacing.lg,
  },
  lotCard: {
    marginBottom: spacing.md,
  },
  lotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cropName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...typography.h3,
    color: colors.primary,
  },
  priceUnit: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  lotDetails: {
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  lotActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  editButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: colors.surface,
    borderColor: colors.error,
  },
  deleteButtonText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
});