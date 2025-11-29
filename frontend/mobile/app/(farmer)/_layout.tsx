import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/lib/constants/colors';
import { spacing } from '@/lib/constants/spacing';

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}

const TabIcon = ({ name, color, focused }: TabIconProps) => {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons 
        name={name} 
        size={focused ? 26 : 24} 
        color={color}
      />
      {focused && <View style={[styles.indicator, { backgroundColor: color }]} />}
    </View>
  );
};

export default function FarmerLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 + insets.bottom : 70,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
          paddingTop: 10,
          elevation: 8,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* 1. Dashboard Tab */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} color={color} focused={focused} />
          ),
        }}
      />
      
      {/* 2. Crops Tab */}
      <Tabs.Screen
        name="crops"
        options={{
          title: 'My Crops',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "leaf" : "leaf-outline"} color={color} focused={focused} />
          ),
        }}
      />

      {/* 3. Marketplace Tab */}
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "storefront" : "storefront-outline"} color={color} focused={focused} />
          ),
        }}
      />
      
      {/* 4. AI Assistant Tab */}
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI Helper',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "sparkles" : "sparkles-outline"} color={color} focused={focused} />
          ),
        }}
      />
      
      {/* 5. Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "person" : "person-outline"} color={color} focused={focused} />
          ),
        }}
      />

      {/* Hidden Screens */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="advisory" options={{ href: null }} />
      <Tabs.Screen name="ai-assistant" options={{ href: null }} />
      <Tabs.Screen name="lots" options={{ href: null }} />
      <Tabs.Screen name="learning" options={{ href: null }} />
      <Tabs.Screen name="wallet" options={{ href: null }} />
      <Tabs.Screen name="transport" options={{ href: null }} />
      <Tabs.Screen name="fpo" options={{ href: null }} />
      <Tabs.Screen name="schemes" options={{ href: null }} />
      <Tabs.Screen name="market" options={{ href: null }} />
      <Tabs.Screen name="weather" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
});