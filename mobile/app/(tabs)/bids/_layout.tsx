import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function BidsLayout() {
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
          title: 'Bids',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Bid Details',
        }}
      />
    </Stack>
  );
}
