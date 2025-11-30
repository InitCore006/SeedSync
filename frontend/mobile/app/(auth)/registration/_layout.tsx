import { Stack } from 'expo-router';

export default function RegistrationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="verify-phone" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="step1-personal" />
      <Stack.Screen name="step2-address" />
      <Stack.Screen name="step3-farm" />
      <Stack.Screen name="step4-bank" />
      <Stack.Screen name="step5-schemes" />
      <Stack.Screen name="success" />
    </Stack>
  );
}