import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function LotsLayout() {
  return (
    <Stack
      screenOptions={{
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
          title: 'My Lots',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Lot',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Lot Details',
        }}
      />
    </Stack>
  );
}
