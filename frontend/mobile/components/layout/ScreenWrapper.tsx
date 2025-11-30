import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import { colors } from '@/lib/constants/colors';

interface ScreenWrapperProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showNotifications?: boolean;
  onBackPress?: () => void;
  noPadding?: boolean;
}

export default function ScreenWrapper({
  children,
  title,
  showBackButton = false,
  showMenuButton = true,
  showNotifications = true,
  onBackPress,
  noPadding = false,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader
        title={title}
        showBackButton={showBackButton}
        showMenuButton={showMenuButton}
        showNotifications={showNotifications}
        onBackPress={onBackPress}
        onMenuPress={() => setSidebarVisible(true)}
      />

      {/* Content */}
      <View
        style={[
          styles.content,
          {
            paddingBottom: insets.bottom + 80,
          },
          noPadding && styles.noPadding,
        ]}
      >
        {children}
      </View>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  noPadding: {
    paddingBottom: 0,
  },
});