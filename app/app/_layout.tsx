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
import { Palette } from "@/constants/Theme";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/ThemeContext";
import { BackgroundProvider } from "@/contexts/BackgroundContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { signOut, useSession } from "@/lib/auth-client";
import { useAccountBootstrap } from "@/hooks/useAccountBootstrap";
import { subscribeSuspended } from "@/lib/suspension";
import { usePremiumStore } from "@/stores/premiumStore";

function AppContent() {
  const { userProfile, isLoading: isProfileLoading } = useLocalStorage();
  const { data: session, isPending: isSessionPending } = useSession();
  const isLoading = isProfileLoading || isSessionPending;
  useAccountBootstrap();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const loaded = fontsLoaded || !!fontError;  const rootSegment = segments[0];
  const isHome =
    rootSegment === "(tabs)" &&
    (segments.length === 1 || (segments[1] as string) === "index");
  const palette = Palette[colorScheme ?? "light"];

  useEffect(() => {
    return subscribeSuspended(() => {
      void (async () => {
        await signOut().catch(() => undefined);
        queryClient.clear();
        usePremiumStore.getState().reset();
        router.replace("/auth/sign-in");
      })();
    });
  }, [router]);

  useEffect(() => {
    if (!loaded || isLoading || !navigationState?.key) return;

    if (!userProfile) {
      if (rootSegment !== "welcome") router.replace("/welcome/quote");
    } else if (!session) {
      if (rootSegment !== "auth") router.replace("/auth/sign-in");
    } else if (rootSegment === "auth") {
      router.replace("/(tabs)");
    }
  }, [
    loaded,
    isLoading,
    navigationState?.key,
    rootSegment,
    router,
    userProfile,
    session,
  ]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor:
              rootSegment === "welcome" ? undefined : palette.background,
          }}
          edges={isHome ? [] : ["top", "bottom", "left", "right"]}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen
              name="paywall"
              options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>
          <StatusBar
            style={isHome || colorScheme === "dark" ? "light" : "dark"}
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
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <BackgroundProvider>
          <LocalStorageProvider>
            <AppContent />
          </LocalStorageProvider>
        </BackgroundProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}
