import { Stack } from 'expo-router';
import { colors } from '@/lib/constants/colors';

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="transactions" />
      <Stack.Screen name="add-money" />
      <Stack.Screen name="withdraw" />
      <Stack.Screen name="transaction-detail" />
    </Stack>
  );
}