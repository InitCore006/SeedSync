import { Stack } from 'expo-router';
import { colors } from '@/lib/constants/colors';

export default function CropsLayout() {
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
      <Stack.Screen name="[id]" />
      <Stack.Screen name="add-crop" />
      <Stack.Screen name="edit-crop" />
      <Stack.Screen name="addInput" />
      <Stack.Screen name="addObservation" />
      <Stack.Screen name="harvest-history" />
    </Stack>
  );
}