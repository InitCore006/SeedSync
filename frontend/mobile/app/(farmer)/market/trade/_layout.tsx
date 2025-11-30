import { Stack } from 'expo-router';
import { colors } from '@/lib/constants/colors';

export default function TradeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="details" />
      <Stack.Screen name="my-listings" />
    </Stack>
  );
}