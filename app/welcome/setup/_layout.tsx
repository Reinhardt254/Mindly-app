import { Stack } from "expo-router";

export default function SetupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="name" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="age" />
      <Stack.Screen name="frequency" />
    </Stack>
  );
}
