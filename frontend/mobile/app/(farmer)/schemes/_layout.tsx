import { Stack } from 'expo-router';
import { colors } from '@/lib/constants/colors';

export default function SchemesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="scheme-detail" />
      <Stack.Screen name="my-applications" />
    </Stack>
  );
}