import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function MarketLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Market',
        }}
      />
      <Stack.Screen
        name="prices"
        options={{
          title: 'Market Prices',
        }}
      />
      <Stack.Screen
        name="weather"
        options={{
          title: 'Weather Forecast',
        }}
      />
    </Stack>
  );
}
