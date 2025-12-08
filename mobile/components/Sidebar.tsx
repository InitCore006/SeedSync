import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
<<<<<<< Updated upstream
  Platform,
  Pressable,
=======
>>>>>>> Stashed changes
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
<<<<<<< Updated upstream
import { useFarmerStore } from '@/store/farmerStore';
import { useLogisticsStore } from '@/store/logisticsStore';
=======
>>>>>>> Stashed changes

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

const BRAND_COLORS = {
  primary: '#4a7c0f',
  secondary: '#65a30d',
  dark: '#365314',
};

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function Sidebar({ visible, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
<<<<<<< Updated upstream
  const { profile: farmerProfile } = useFarmerStore();
  const { profile: logisticsProfile } = useLogisticsStore();
=======
>>>>>>> Stashed changes
  const isFarmer = user?.role === 'farmer';
  const isLogistics = user?.role === 'logistics';
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

<<<<<<< Updated upstream
  // Get the appropriate profile based on role
  const activeProfile = isFarmer ? farmerProfile : isLogistics ? logisticsProfile : null;

=======
>>>>>>> Stashed changes
  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

<<<<<<< Updated upstream
  // Fetch profile data when sidebar opens if not already loaded
  React.useEffect(() => {
    if (visible && !activeProfile) {
      fetchProfileData();
    }
  }, [visible]);

  const fetchProfileData = async () => {
    try {
      if (isFarmer) {
        const { farmersAPI } = await import('@/services/farmersService');
        const response = await farmersAPI.getMyProfile();
        useFarmerStore.getState().setProfile(response.data);
      } else if (isLogistics) {
        const { logisticsAPI } = await import('@/services/logisticsService');
        const response = await logisticsAPI.getMyProfile();
        useLogisticsStore.getState().setProfile(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

=======
>>>>>>> Stashed changes
  const menuItems = [
    { 
      icon: 'home', 
      label: 'Dashboard', 
      route: '/(tabs)',
      roles: ['farmer', 'logistics']
    },
    { 
      icon: 'leaf', 
      label: 'My Lots', 
      route: '/(tabs)/lots',
      roles: ['farmer']
    },
    { 
      icon: 'pricetag', 
<<<<<<< Updated upstream
      label: 'My Bids', 
=======
      label: 'Bids', 
>>>>>>> Stashed changes
      route: '/(tabs)/bids',
      roles: ['farmer']
    },
    { 
<<<<<<< Updated upstream
      icon: 'sparkles', 
      label: 'AI Features', 
      route: '/(tabs)/ai',
      roles: ['farmer']
    },
    { 
      icon: 'business', 
      label: 'Find FPO', 
      route: '/fpo-finder',
=======
      icon: 'stats-chart', 
      label: 'Market', 
      route: '/(tabs)/market',
>>>>>>> Stashed changes
      roles: ['farmer']
    },
    { 
      icon: 'navigate', 
      label: 'Trips', 
      route: '/(tabs)/trips',
      roles: ['logistics']
    },
    { 
      icon: 'time', 
      label: 'History', 
      route: '/(tabs)/history',
      roles: ['logistics']
    },
    { 
      icon: 'wallet', 
      label: 'Payments', 
      route: '/(tabs)/payments',
      roles: ['farmer', 'logistics']
    },
    { 
<<<<<<< Updated upstream
      icon: 'document-text', 
      label: 'Schemes', 
      route: '/(tabs)/schemes',
      roles: ['farmer']
    },
    { 
=======
>>>>>>> Stashed changes
      icon: 'person', 
      label: 'Profile', 
      route: '/(tabs)/profile',
      roles: ['farmer', 'logistics']
    },
  ];

  const handleLogout = async () => {
    await logout();
    onClose();
    router.replace('/(auth)/login');
  };

  const handleNavigation = (route: string) => {
<<<<<<< Updated upstream
    // Close sidebar immediately
    onClose();
    // Navigate after sidebar closes
    setTimeout(() => {
      try {
        router.push(route as any);
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }, 200);
=======
    onClose();
    router.push(route as any);
>>>>>>> Stashed changes
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <Modal
      visible={visible}
      transparent
<<<<<<< Updated upstream
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable 
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: visible ? 0 : -SIDEBAR_WIDTH }],
            },
          ]}
          onPress={(e) => e.stopPropagation()}
=======
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
>>>>>>> Stashed changes
        >
          <LinearGradient
            colors={[BRAND_COLORS.dark, BRAND_COLORS.primary, BRAND_COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.header}
          >
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
<<<<<<< Updated upstream
                  {(activeProfile?.full_name?.charAt(0) || user?.phone_number?.charAt(0) || 'U').toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {activeProfile?.full_name || 'User'}
                </Text>
                <Text style={styles.profileRole}>
                  {isFarmer ? 'Farmer' : isLogistics ? 'Logistics Partner' : user?.role || 'User'}
                </Text>
                {isFarmer && activeProfile && (
                  <Text style={styles.profileDetail} numberOfLines={1}>
                    {activeProfile.district}, {activeProfile.state}
                  </Text>
                )}
                {isLogistics && activeProfile && (
                  <Text style={styles.profileDetail} numberOfLines={1}>
                    {activeProfile.city}, {activeProfile.state}
                  </Text>
                )}
=======
                  {user?.profile?.full_name?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.profile?.full_name || 'User'}
                </Text>
                <Text style={styles.profileRole}>
                  {user?.role_display || user?.role}
                </Text>
>>>>>>> Stashed changes
                <Text style={styles.profilePhone}>{user?.phone_number}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.menuContainer}>
            {filteredMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleNavigation(item.route)}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={24} 
                  color={BRAND_COLORS.primary} 
                />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color="#9ca3af" 
                />
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="settings" size={24} color="#6b7280" />
              <Text style={styles.menuLabel}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="help-circle" size={24} color="#6b7280" />
              <Text style={styles.menuLabel}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={24} color="#ef4444" />
              <Text style={[styles.menuLabel, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
<<<<<<< Updated upstream
        </Pressable>
      </Pressable>
=======
        </Animated.View>
        
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
>>>>>>> Stashed changes
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
<<<<<<< Updated upstream
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
=======
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
>>>>>>> Stashed changes
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
<<<<<<< Updated upstream
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50,
=======
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
>>>>>>> Stashed changes
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
<<<<<<< Updated upstream
  profileDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 2,
  },
=======
>>>>>>> Stashed changes
  profilePhone: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  logoutItem: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutText: {
    color: '#ef4444',
  },
});
