import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Loading } from '@/components';
import { useAuthStore } from '@/store/authStore';

export default function MyFPOScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const fpoMembership = user?.profile?.fpo_membership;

  if (!fpoMembership) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={64} color={COLORS.text.tertiary} />
          <Text style={styles.emptyText}>Not a member of any FPO</Text>
          <Text style={styles.emptyHint}>
            Join an FPO to access aggregated selling and collective benefits
          </Text>
          <TouchableOpacity
            style={styles.findButton}
            onPress={() => router.push('/fpos')}
          >
            <Text style={styles.findButtonText}>Find FPOs</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const benefits = [
    {
      icon: 'people',
      title: 'Collective Bargaining',
      description: 'Better prices through group selling',
    },
    {
      icon: 'trending-up',
      title: 'Market Access',
      description: 'Direct access to bulk buyers',
    },
    {
      icon: 'business',
      title: 'Warehouse Storage',
      description: 'Secure storage facilities',
    },
    {
      icon: 'school',
      title: 'Training Programs',
      description: 'Free agricultural training',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* FPO Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.fpoIcon}>
          <Ionicons name="business" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.fpoName}>{fpoMembership.fpo_name}</Text>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.statusText}>Active Member</Text>
        </View>
        <Text style={styles.joinedDate}>
          Member since {new Date(fpoMembership.joined_date).toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Warehouse Info */}
      {fpoMembership.warehouse_name && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Assigned Warehouse</Text>
          </View>
          <View style={styles.warehouseCard}>
            <View style={styles.warehouseInfo}>
              <Text style={styles.warehouseName}>{fpoMembership.warehouse_name}</Text>
              <TouchableOpacity style={styles.directionsButton}>
                <Ionicons name="navigate" size={16} color={COLORS.primary} />
                <Text style={styles.directionsText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Membership Benefits */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="gift" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Membership Benefits</Text>
        </View>
        <View style={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Ionicons name={benefit.icon as any} size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/lots/create')}
          >
            <Ionicons name="add-circle" size={32} color={COLORS.primary} />
            <Text style={styles.actionText}>Send Lot to FPO</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              router.push('/(tabs)/lots');
              // TODO: Add filter for FPO lots
            }}
          >
            <Ionicons name="list" size={32} color={COLORS.success} />
            <Text style={styles.actionText}>My FPO Lots</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Alert.alert('Coming Soon', 'FPO meetings feature coming soon')}
          >
            <Ionicons name="calendar" size={32} color={COLORS.warning} />
            <Text style={styles.actionText}>FPO Meetings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Alert.alert('Coming Soon', 'Contact FPO feature coming soon')}
          >
            <Ionicons name="call" size={32} color={COLORS.info} />
            <Text style={styles.actionText}>Contact FPO</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerCard: {
    backgroundColor: COLORS.white,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  fpoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fpoName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.success + '15',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  joinedDate: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  warehouseCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  warehouseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warehouseName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
  },
  directionsText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  benefitsGrid: {
    gap: 12,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
    flex: 1,
  },
  benefitDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    position: 'absolute',
    top: 40,
    left: 76,
    right: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  findButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
