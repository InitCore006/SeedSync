import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader, Sidebar } from '@/components';
import { COLORS } from '@/constants/colors';

export default function SupportScreen() {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        title="Help & Support"
        onMenuPress={() => setSidebarVisible(true)}
        showBackButton
        onBackPress={() => router.back()}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <View style={styles.container}>
        <Text style={styles.text}>Help & Support - Coming Soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
});
