import { Stack } from 'expo-router';
import { colors } from '@/lib/constants/colors';

export default function FPOLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="fpo-detail" />
      <Stack.Screen name="my-fpos" />
      <Stack.Screen name="events" />
    </Stack>
  );
}