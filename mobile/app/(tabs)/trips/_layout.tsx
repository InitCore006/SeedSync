import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
<<<<<<< Updated upstream
        headerShown: false,
=======
>>>>>>> Stashed changes
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
          title: 'My Trips',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Trip Details',
        }}
      />
      <Stack.Screen
        name="pickup/[id]"
        options={{
          title: 'Mark Pickup Complete',
        }}
      />
      <Stack.Screen
        name="delivery/[id]"
        options={{
          title: 'Mark Delivered',
        }}
      />
    </Stack>
  );
}
