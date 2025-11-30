import { Stack } from 'expo-router';
import { colors } from '@/lib/constants/colors';

export default function WeatherLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="hourly" />
      <Stack.Screen name="alerts" />
      <Stack.Screen name="history" />
    </Stack>
  );
}