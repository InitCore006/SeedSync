import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useState } from 'react';
import { DrawerActions } from '@react-navigation/native';

export default function TabsLayout() {
  const { user } = useAuthStore();
  const isFarmer = user?.role === 'farmer';
  const isLogistics = user?.role === 'logistics';

  const VoiceAssistantButton = ({ focused }: { focused: boolean }) => (
    <Pressable
      onPress={() => router.push('/(tabs)/ai/farming-assistant')}
      style={styles.voiceButton}
    >
      <View style={styles.voiceButtonInner}>
        <Ionicons name="mic" size={28} color="#fff" />
      </View>
    </Pressable>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      {/* Tab 1: Dashboard - Common to all roles */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Tab 2: My Lots - Farmers only */}
      <Tabs.Screen
        name="lots"
        options={{
          title: 'My Lots',
          headerShown: false,
          href: isFarmer ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf" size={size} color={color} />
          ),
        }}
      />
      
      {/* Tab 3: Voice Assistant - Center button with custom design */}
      <Tabs.Screen
        name="voice-assistant"
        options={{
          title: '',
          href: null,
          tabBarIcon: VoiceAssistantButton,
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/ai/farming-assistant')}
              style={styles.voiceTabButton}
            >
              <View style={styles.voiceButton}>
                <View style={styles.voiceButtonInner}>
                  <Ionicons name="mic" size={28} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      
      {/* Tab 4: My Bids - Farmers only */}
      <Tabs.Screen
        name="bids"
        options={{
          title: 'My Bids',
          headerShown: false,
          href: isFarmer ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pricetag" size={size} color={color} />
          ),
        }}
      />
      
      {/* Tab 5: AI Features - Farmers only */}
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI Features',
          headerShown: false,
          href: isFarmer ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size} color={color} />
          ),
        }}
      />

      {/* Market - Hidden from tabs, accessible via Sidebar if needed */}
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          headerShown: false,
          href: null,
        }}
      />

      {/* Logistics Tab 2: Trips */}
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          headerShown: false,
          href: isLogistics ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="navigate" size={size} color={color} />
          ),
        }}
      />
      
      {/* Hidden from bottom tabs - Accessible via Sidebar */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerShown: false,
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          headerShown: false,
          href: null,
        }}
      />

      <Tabs.Screen
        name="schemes"
        options={{
          title: 'Schemes',
          headerShown: false,
          href: null,
        }}
      />

      {/* Profile - Hidden from tabs, accessible via Sidebar */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  voiceTabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButton: {
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
