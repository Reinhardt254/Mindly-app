import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
 
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "light" ? DarkTheme : DefaultTheme}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tabIconSelected,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              backgroundColor: Colors[colorScheme ?? "light"].tabbarBackground,
              borderTopWidth: 0,
              height: 80,
              paddingBottom: 20,
              paddingTop: 10,
              display: "none",
            },
            android: {
              backgroundColor: Colors[colorScheme ?? "light"].tabbarBackground,
              borderTopWidth: 0,
              height: 80,
              paddingBottom: 10,
              paddingTop: 10,
              marginTop: 10,
              marginBottom: 20,
              marginLeft: 10,
              marginRight: 10,
              borderRadius: 40,
              paddingHorizontal: 20,
              overflow: "hidden",
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              display: "none",
            },
            default: {
              backgroundColor: Colors[colorScheme ?? "light"].tabbarBackground,
              borderTopWidth: 1,
              height: 80,
              paddingBottom: 20,
              paddingTop: 10,
              display: "none",
            },
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" color={color} size={size} />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" color={color} size={size} />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: "Stats",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart" color={color} size={size} />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="privacy-policy"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="terms-of-service"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="version"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
