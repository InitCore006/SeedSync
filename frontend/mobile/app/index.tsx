import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { View, StyleSheet } from 'react-native';
import { colors } from '@lib/constants/colors';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading SeedSync..." />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated && user) {
    switch (user.role) {
      case 'FARMER':
        return <Redirect href="/(farmer)" />;
      default:
        return <Redirect href="/(auth)/login" />;
    }
  }

  // Not authenticated - go to login
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.default,
  },
});