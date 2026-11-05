import { Stack } from "expo-router";
import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { Palette } from "@/constants/Theme";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Palette[colorScheme ?? "light"].background,
          },
        }}
      />
    </ThemeProvider>
  );
}
