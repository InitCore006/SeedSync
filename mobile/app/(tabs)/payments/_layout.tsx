import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function PaymentsLayout() {
  return (
<<<<<<< Updated upstream
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
=======
    <Stack>
>>>>>>> Stashed changes
      <Stack.Screen
        name="index"
        options={{
          title: 'Payments',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Payment Details',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
        }}
      />
    </Stack>
  );
}
