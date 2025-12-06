import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { DrawerActions } from '@react-navigation/native';

export default function TabsLayout() {
  const { user } = useAuthStore();
  const isFarmer = user?.role === 'farmer';
  const isLogistics = user?.role === 'logistics';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#437409',
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
      {/* Dashboard - Common to all roles */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Farmer-only Tabs */}
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
      <Tabs.Screen
        name="bids"
        options={{
          title: 'Bids',
          headerShown: false,
          href: isFarmer ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pricetag" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          headerShown: false,
          href: isFarmer ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />

      {/* Logistics-only Tabs */}
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
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerShown: false,
          href: isLogistics ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      
      {/* Payments - Common (hidden from tab bar but accessible via navigation) */}
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          headerShown: false,
          href: null,
        }}
      />

      {/* Profile - Common to all roles */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
