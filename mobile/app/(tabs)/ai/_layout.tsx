import { Stack } from 'expo-router';

export default function AILayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="crop-recommendation" />
      <Stack.Screen name="farming-assistant" />
      <Stack.Screen name="weather-advisory" />
    </Stack>
  );
}
