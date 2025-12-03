import { Stack } from 'expo-router';
import { colors } from '@/lib/constants/colors';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="bank-details" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="help" />
      <Stack.Screen name="language" />
      <Stack.Screen name="about" />
    </Stack>
  );
}