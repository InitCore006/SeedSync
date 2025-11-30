import { Stack } from 'expo-router';
import { colors } from '@/lib/constants/colors';

export default function MarketLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="details" />
      <Stack.Screen name="market-details" />
      <Stack.Screen name="msp" />
      <Stack.Screen name="nearby" />
      <Stack.Screen name="news" />
      <Stack.Screen name="alerts" />
      <Stack.Screen name="schemes" />
      <Stack.Screen name="scheme-details" />
      <Stack.Screen name="trade" />
    </Stack>
  );
}