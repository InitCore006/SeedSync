import { Stack } from 'expo-router';

export default function LotsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#4a7c0f',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'My Lots',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create New Lot',
        }}
      />
      <Stack.Screen
        name="edit-lot"
        options={{
          title: 'Edit Lot',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Lot Details',
        }}
      />
    </Stack>
  );
}
