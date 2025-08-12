import { Stack } from "expo-router";

export default function WelcomeLayout() {
  return (
    <Stack initialRouteName="quote">
      <Stack.Screen
        name="quote"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="setup"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
