import { Stack } from 'expo-router';

export default function AILayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="crop-scanner" />
      <Stack.Screen name="scan-history" />
      <Stack.Screen name="scan-detail" />
      <Stack.Screen name="crop-planner" />
      <Stack.Screen name="plan-history" />
      <Stack.Screen name="plan-detail" />
      <Stack.Screen name="farming-calendar" />
      <Stack.Screen name="price-prediction" />
      <Stack.Screen name="yield-prediction" />
      <Stack.Screen name="chatbot" />
    </Stack>
  );
}