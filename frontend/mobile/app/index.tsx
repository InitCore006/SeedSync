import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/lib/constants/colors';


export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  console.log('📍 Index Screen - Auth State:', {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    userRole: user?.role,
  });

  if (isLoading) {
    console.log('⏳ Still loading...');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated && user) {
    console.log('✅ Redirecting to dashboard');
    return <Redirect href="/(farmer)/dashboard" />;
  }

  console.log('🔐 Redirecting to welcome');
  return <Redirect href="/(auth)/welcome" />;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});