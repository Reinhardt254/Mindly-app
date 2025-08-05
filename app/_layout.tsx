import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "react-native-reanimated";

import "@/global.css";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { userProfile, isLoading } = useLocalStorage();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded || isLoading) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack>
            {userProfile ? (
              <Stack.Screen name="(tabs)" options={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }} />
            ) : (
              <Stack.Screen name="welcome" options={{ headerShown: false }} />
            )}
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
