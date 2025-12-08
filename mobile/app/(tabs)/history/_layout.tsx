import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function HistoryLayout() {
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
          title: 'History & Earnings',
        }}
      />
    </Stack>
  );
}
