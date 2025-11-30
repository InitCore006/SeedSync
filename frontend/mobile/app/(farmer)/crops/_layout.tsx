import { Stack } from 'expo-router';


export default function CropsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="add-crop" />
      <Stack.Screen name="edit-crop" />
      <Stack.Screen name="farm-analytics" />
      <Stack.Screen name="harvest-history" />
    </Stack>
  );
}