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

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Colors } from "@/constants/Colors";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/ThemeContext";
import { BackgroundProvider } from "@/contexts/BackgroundContext";
import { useColorScheme } from "@/hooks/useColorScheme";

function AppContent() {
  const { userProfile, isLoading } = useLocalStorage();
  const colorScheme = useColorScheme();
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
          <Stack screenOptions={{ headerShown: false }}>
            {userProfile ? (
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
            ) : (
              <Stack.Screen name="welcome" options={{ headerShown: false }} />
            )}
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>
          <StatusBar
            style={colorScheme === "dark" ? "light" : "dark"}
            backgroundColor={Colors[colorScheme ?? "light"].tabbarBackground}
            translucent={true}
            animated={true}
          />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <BackgroundProvider>
        <AppContent />
      </BackgroundProvider>
    </CustomThemeProvider>
  );
}
