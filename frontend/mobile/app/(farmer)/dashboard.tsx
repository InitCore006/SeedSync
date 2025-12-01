import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Sidebar from '@/components/layout/Sidebar';
import WeatherCard from '@/components/weather/WeatherCard';
import QuickActions from '@/components/dashboard/QuickActions';
import EmptyState from '@/components/dashboard/EmptyState';
import AddCropModal, { CropFormData } from '@/components/modals/AddCropModal';
import { colors } from '@/lib/constants/colors';
import { spacing } from '@/lib/constants/spacing';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [addCropModalVisible, setAddCropModalVisible] = useState(false);
  const [hasCrops, setHasCrops] = useState(false); // TODO: Get from API/storage

  useEffect(() => {
    // TODO: Check if user has any crops
    checkForCrops();
  }, []);

  const checkForCrops = async () => {
    // TODO: Implement actual check
    // For now, simulating empty state for first-time users
    setHasCrops(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkForCrops();
    // TODO: Refresh other data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNotificationPress = () => {
    router.push('/(farmer)/notifications' as any);
  };

  const handleAddCrop = (cropData: CropFormData) => {
    console.log('Adding crop:', cropData);
    // TODO: Save crop data to backend
    setHasCrops(true);
    // Show success toast
  };

  const quickActions = [
    {
      id: 'add-crop',
      title: 'Add Crop',
      icon: 'leaf' as const,
      color: colors.primary,
      onPress: () => setAddCropModalVisible(true),
    },
    {
      id: 'inventory',
      title: 'Inventory',
      icon: 'cube' as const,
      color: colors.accent,
      onPress: () => router.push('/(farmer)/inventory' as any),
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: 'storefront' as const,
      color: colors.info,
      onPress: () => router.push('/(farmer)/marketplace' as any),
    },
    {
      id: 'support',
      title: 'Get Help',
      icon: 'help-circle' as const,
      color: colors.warning,
      onPress: () => router.push('/(farmer)/support' as any),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Weather Header with integrated menu and notifications */}
      <WeatherCard
        onMenuPress={() => setSidebarVisible(true)}
        onNotificationPress={handleNotificationPress}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 80 },
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
       

        {/* Empty State for First-Time Users */}
        {!hasCrops && (
          <EmptyState
            icon="leaf-outline"
            title="Start Your Farming Journey"
            description="Add your first crop to track growth, manage inventory, and connect with buyers."
            actionLabel="Add Your First Crop"
            onActionPress={() => setAddCropModalVisible(true)}
          />
        )}

        {/* TODO: Add crops list when hasCrops is true */}
      </ScrollView>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Add Crop Modal */}
      <AddCropModal
        visible={addCropModalVisible}
        onClose={() => setAddCropModalVisible(false)}
        onSubmit={handleAddCrop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
});