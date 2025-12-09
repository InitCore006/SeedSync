import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, AppHeader, Sidebar, Loading } from '@/components';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useFarmerStore } from '@/store/farmerStore';
import { useLogisticsStore } from '@/store/logisticsStore';
import { formatPhoneNumber } from '@/utils/formatters';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { profile: farmerProfile, fetchProfile: fetchFarmerProfile } = useFarmerStore();
  const { profile: logisticsProfile, fetchProfile: fetchLogisticsProfile } = useLogisticsStore();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isFarmer = user?.role === 'farmer';
  const isLogistics = user?.role === 'logistics';
  const profile = isFarmer ? farmerProfile : isLogistics ? logisticsProfile : null;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      if (isFarmer) {
        await fetchFarmerProfile();
      } else if (isLogistics) {
        await fetchLogisticsProfile();
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader 
        title="My Profile"
        onMenuPress={() => setSidebarVisible(true)}
        showNotifications={true}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.profile?.profile_photo ? (
              <Image
                source={{ uri: user.profile.profile_photo }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {user?.profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>
            {profile?.full_name || user?.profile?.full_name || 'User'}
          </Text>
          <Text style={styles.phone}>
            {formatPhoneNumber(user?.phone_number || '')}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role_display || user?.role?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {isFarmer && farmerProfile && (
            <>
              {farmerProfile.father_name && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Father's Name</Text>
                    <Text style={styles.infoValue}>{farmerProfile.father_name}</Text>
                  </View>
                </View>
              )}

              {farmerProfile.date_of_birth && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Date of Birth</Text>
                    <Text style={styles.infoValue}>{new Date(farmerProfile.date_of_birth).toLocaleDateString()}</Text>
                  </View>
                </View>
              )}

              {farmerProfile.gender && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="male-female-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>
                      {farmerProfile.gender.charAt(0).toUpperCase() + farmerProfile.gender.slice(1)}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="leaf-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Total Land</Text>
                  <Text style={styles.infoValue}>{farmerProfile.total_land_acres} acres</Text>
                </View>
              </View>

              {farmerProfile.farming_experience_years && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Farming Experience</Text>
                    <Text style={styles.infoValue}>{farmerProfile.farming_experience_years} years</Text>
                  </View>
                </View>
              )}

              {farmerProfile.primary_crops && farmerProfile.primary_crops.length > 0 && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="nutrition-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Primary Crops</Text>
                    <Text style={styles.infoValue}>{farmerProfile.primary_crops.join(', ')}</Text>
                  </View>
                </View>
              )}
            </>
          )}

          {isLogistics && logisticsProfile && (
            <>
              {'company_name' in logisticsProfile && logisticsProfile.company_name && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="business-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Company Name</Text>
                    <Text style={styles.infoValue}>{logisticsProfile.company_name}</Text>
                  </View>
                </View>
              )}

              {'gst_number' in logisticsProfile && logisticsProfile.gst_number && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>GST Number</Text>
                    <Text style={styles.infoValue}>{logisticsProfile.gst_number}</Text>
                  </View>
                </View>
              )}

              {'experience_years' in logisticsProfile && logisticsProfile.experience_years && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Experience</Text>
                    <Text style={styles.infoValue}>{logisticsProfile.experience_years} years</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Address Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Address Details</Text>
          
          {isFarmer && farmerProfile && (
            <>
              {farmerProfile.village && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="home-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Village</Text>
                    <Text style={styles.infoValue}>{farmerProfile.village}</Text>
                  </View>
                </View>
              )}

              {farmerProfile.tehsil && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Tehsil</Text>
                    <Text style={styles.infoValue}>{farmerProfile.tehsil}</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="map-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>District</Text>
                  <Text style={styles.infoValue}>{farmerProfile.district}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="earth-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>State</Text>
                  <Text style={styles.infoValue}>{farmerProfile.state_display || farmerProfile.state}</Text>
                </View>
              </View>

              {farmerProfile.pincode && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Pincode</Text>
                    <Text style={styles.infoValue}>{farmerProfile.pincode}</Text>
                  </View>
                </View>
              )}
            </>
          )}

          {isLogistics && logisticsProfile && (
            <>
              {'address' in logisticsProfile && logisticsProfile.address && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{logisticsProfile.address}</Text>
                  </View>
                </View>
              )}

              {'city' in logisticsProfile && logisticsProfile.city && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="business-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>City</Text>
                    <Text style={styles.infoValue}>{logisticsProfile.city}</Text>
                  </View>
                </View>
              )}

              {'state' in logisticsProfile && logisticsProfile.state && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="earth-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>State</Text>
                    <Text style={styles.infoValue}>{logisticsProfile.state}</Text>
                  </View>
                </View>
              )}

              {'pincode' in logisticsProfile && logisticsProfile.pincode && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Pincode</Text>
                    <Text style={styles.infoValue}>{logisticsProfile.pincode}</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        
        {/* FPO Membership - Farmer only */}
        {isFarmer && farmerProfile?.fpo_membership && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>FPO Membership</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="business" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>FPO Name</Text>
                <Text style={styles.infoValue}>{farmerProfile.fpo_membership.fpo_name}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Joined Date</Text>
                <Text style={styles.infoValue}>
                  {new Date(farmerProfile.fpo_membership.joined_date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, { color: COLORS.success }]}>
                  {farmerProfile.fpo_membership.status}
                </Text>
              </View>
            </View>

            {farmerProfile.fpo_membership.warehouse_name && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="cube" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Warehouse</Text>
                  <Text style={styles.infoValue}>{farmerProfile.fpo_membership.warehouse_name}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Edit Profile Button */}
        <View style={styles.buttonSection}>
          <Button
            title="Edit Profile"
            onPress={() => router.push('/(tabs)/profile/edit')}
            icon="create-outline"
          />
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            icon="log-out-outline"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>SeedSync v1.0.0</Text>
          <Text style={styles.footerText}>© 2025 All Rights Reserved</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  buttonSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  logoutSection: {
    padding: 16,
    marginTop: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
});
