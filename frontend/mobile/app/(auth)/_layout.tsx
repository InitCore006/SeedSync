import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="phone-verification" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="register" />
    </Stack>
  );
}