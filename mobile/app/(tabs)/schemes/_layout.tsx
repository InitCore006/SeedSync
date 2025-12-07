import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function SchemesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Government Schemes',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Scheme Details',
        }}
      />
    </Stack>
  );
}
