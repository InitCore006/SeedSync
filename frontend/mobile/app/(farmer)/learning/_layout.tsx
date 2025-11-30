import { Stack } from 'expo-router';
import { colors } from '@/lib/constants/colors';

export default function LearningLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="course-detail" />
      <Stack.Screen name="bookmarks" />
    </Stack>
  );
}