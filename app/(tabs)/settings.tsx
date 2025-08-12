import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme-preference");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const handleThemeToggle = async (value: boolean) => {
    setIsDarkMode(value);
    try {
      await AsyncStorage.setItem("theme-preference", value ? "dark" : "light");
      // Note: In a real app, you'd want to update the global theme context here
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      <ScrollView className="flex-1 px-6 py-8">
        <View style={{ height: 50 }}></View>
        {/* Header */}
        <View className="mb-8">
          <Text
            className="text-2xl font-bold"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            Settings
          </Text>
          <Text
            className="mt-2 text-md"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            Customize your experience
          </Text>
        </View>

        {/* Notifications */}
        <View className="p-6 mb-6 rounded-lg">
          <Text
            className="mb-4 text-xl font-semibold"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            Notifications
          </Text>

          <View
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
              borderWidth: 0,
              borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
              borderRadius: 10,
              borderStyle: "solid",
              paddingVertical: 20,
              paddingHorizontal: 10,

              margin: 0,
              marginTop: 0,
              boxShadow:
                colorScheme === "dark"
                  ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                  : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
            className="space-y-4"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="notifications" size={24} color="#3B82F6" />
                <Text
                  className="ml-4 text-lg"
                  style={{ color: Colors[colorScheme ?? "light"].text, paddingLeft: 10 }}
                >
                  Push Notifications
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#767577", true: "#3B82F6" }}
                thumbColor={notifications ? "#ffffff" : "#f4f3f4"}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="time" size={24} color="#3B82F6" />
                <Text
                  className="ml-4 text-lg"
                  style={{ color: Colors[colorScheme ?? "light"].text,paddingLeft: 10 }}
                >
                  Daily Reminders
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#767577", true: "#3B82F6" }}
                thumbColor={notifications ? "#ffffff" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 10,
            borderStyle: "solid",
            paddingVertical: 20,
            paddingHorizontal: 10,

            margin: 0,
            marginTop: 0,
            boxShadow:
              colorScheme === "dark"
                ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          }}
          className="p-6 mb-6 rounded-lg"
        >
          <Text
            className="mb-4 text-xl font-semibold"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            Appearance
          </Text>

          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="moon" size={24} color="#3B82F6" />
                <Text
                  className="ml-4 text-lg"
                  style={{ color: Colors[colorScheme ?? "light"].text, paddingLeft: 10 }}
                >
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: "#767577", true: "#3B82F6" }}
                thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* Interaction */}
        <View
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 10,
            borderStyle: "solid",
            paddingVertical: 20,
            paddingHorizontal: 10,

            margin: 0,
            marginTop: 0,
            boxShadow:
              colorScheme === "dark"
                ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          }}
          className="p-6 mb-6 rounded-lg"
        >
          <Text
            className="mb-4 text-xl font-semibold"
            style={{ color: Colors[colorScheme ?? "light"].text,  }}
          >
            Interaction
          </Text>

          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="phone-portrait" size={24} color="#3B82F6" />
                <Text
                  className="ml-4 text-lg"
                  style={{ color: Colors[colorScheme ?? "light"].text , paddingLeft: 10}}
                >
                  Haptic Feedback
                </Text>
              </View>
              <Switch
                value={hapticFeedback}
                onValueChange={setHapticFeedback}
                trackColor={{ false: "#767577", true: "#3B82F6" }}
                thumbColor={hapticFeedback ? "#ffffff" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* About */}
        <View
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 10,
            borderStyle: "solid",
            paddingVertical: 20,
            paddingHorizontal: 10,

            margin: 0,
            marginTop: 0,
            boxShadow:
              colorScheme === "dark"
                ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          }}
          className="p-6 mb-6 rounded-lg"
        >
          <Text
            className="pl-5 mb-4 text-xl font-semibold"
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            About
          </Text>

          <View
            className="space-y-4"
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
              borderWidth: 0,
              borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
              borderRadius: 10,
              borderStyle: "solid",
              paddingTop: 10,
              paddingHorizontal: 0,
              margin: 0,
              marginTop: 0,
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              width: "100%",
              gap: 10,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: Colors[colorScheme ?? "light"].background,
                borderWidth: 0,
                borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
                borderRadius: 10,
                borderStyle: "solid",
                paddingVertical: 20,
                paddingHorizontal: 10,
                margin: 0,
                marginTop: 0,
                boxShadow:
                  colorScheme === "dark"
                    ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                    : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
              }}
              className="flex-row items-center w-full"
              onPress={() => router.push("/(tabs)/version")}
            >
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <Text
                className="ml-4 text-lg"
                style={{ color: Colors[colorScheme ?? "light"].text }}
              >
                Version 1.0.0
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="#6B7280"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: Colors[colorScheme ?? "light"].background,
                borderWidth: 0,
                borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
                borderRadius: 10,
                borderStyle: "solid",
                paddingVertical: 20,
                paddingHorizontal: 10,
                margin: 0,
                marginTop: 0,
                boxShadow:
                  colorScheme === "dark"
                    ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                    : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
              }}
              className="flex-row items-center w-full"
              onPress={() => router.push("/(tabs)/terms-of-service")}
            >
              <Ionicons name="document-text" size={24} color="#3B82F6" />
              <Text
                className="ml-4 text-lg"
                style={{ color: Colors[colorScheme ?? "light"].text }}
              >
                Terms of Service
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="#6B7280"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: Colors[colorScheme ?? "light"].background,
                borderWidth: 0,
                borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
                borderRadius: 10,
                borderStyle: "solid",
                paddingVertical: 20,
                paddingHorizontal: 10,
                margin: 0,
                marginTop: 0,
                boxShadow:
                  colorScheme === "dark"
                    ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                    : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
              }}
              className="flex-row items-center w-full"
              onPress={() => router.push("/(tabs)/privacy-policy")}
            >
              <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
              <Text
                className="ml-4 text-lg"
                style={{ color: Colors[colorScheme ?? "light"].text }}
              >
                Privacy Policy
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="#6B7280"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          className="flex-1"
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            height: 20,
          }}
        ></View>
      </ScrollView>
    </View>
  );
}
