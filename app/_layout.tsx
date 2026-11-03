import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "react-native-reanimated";

import {
  LocalStorageProvider,
  useLocalStorage,
} from "@/hooks/useLocalStorage";
import { Colors } from "@/constants/Colors";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/ThemeContext";
import { BackgroundProvider } from "@/contexts/BackgroundContext";
import { useColorScheme } from "@/hooks/useColorScheme";

function AppContent() {
  const { userProfile, isLoading } = useLocalStorage();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const rootSegment = segments[0];

  useEffect(() => {
    if (!loaded || isLoading || !navigationState?.key) return;

    if (!userProfile && rootSegment !== "welcome") {
      router.replace("/welcome/quote");
    }
  }, [
    loaded,
    isLoading,
    navigationState?.key,
    rootSegment,
    router,
    userProfile,
  ]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
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
        <LocalStorageProvider>
          <AppContent />
        </LocalStorageProvider>
      </BackgroundProvider>
    </CustomThemeProvider>
  );
}
