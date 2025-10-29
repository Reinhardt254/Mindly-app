import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { SimpleHeader } from "@/components/ModernHeader";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { notificationService } from "@/services/notificationService";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  const { setThemeMode, isDark } = useTheme();
  const { userProfile } = useLocalStorage();
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    setIsCheckingPermissions(true);
    try {
      const enabled = await notificationService.areNotificationsEnabled();
      setNotificationsEnabled(enabled);
    } catch (error) {
      console.error("Error checking notification status:", error);
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const handleThemeToggle = async (value: boolean) => {
    const newMode = value ? "dark" : "light";
    await setThemeMode(newMode);
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      // Enable notifications
      try {
        const hasPermission = await notificationService.requestPermissions();
        if (hasPermission && userProfile) {
          await notificationService.scheduleAffirmationNotifications({
            frequency: userProfile.affirmationFrequency,
            startHour: userProfile.reminderStartHour || 8,
            endHour: userProfile.reminderEndHour || 20,
          });
          setNotificationsEnabled(true);
          Alert.alert(
            "Notifications Enabled",
            `You'll receive ${userProfile.affirmationFrequency} affirmation reminder${
              userProfile.affirmationFrequency > 1 ? "s" : ""
            } per day.`
          );
        } else {
          Alert.alert(
            "Permission Denied",
            "Please enable notifications in your device settings to receive affirmation reminders.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => {
                  // This would open device settings in a real app
                  console.log("Open device settings");
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error("Error enabling notifications:", error);
        Alert.alert("Error", "Failed to enable notifications");
      }
    } else {
      // Disable notifications
      try {
        await notificationService.cancelAllNotifications();
        setNotificationsEnabled(false);
        Alert.alert(
          "Notifications Disabled",
          "You won't receive any more affirmation reminders."
        );
      } catch (error) {
        console.error("Error disabling notifications:", error);
        Alert.alert("Error", "Failed to disable notifications");
      }
    }
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      {/* Simple Header */}
      <SimpleHeader title="Settings" />

      <ScrollView className="flex-1 px-4 py-0">
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
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="notifications" size={24} color="#3B82F6" />
                <View className="flex-1 ml-4" style={{ paddingLeft: 10 }}>
                  <Text
                    className="text-lg"
                    style={{
                      color: Colors[colorScheme ?? "light"].text,
                    }}
                  >
                    Affirmation Reminders
                  </Text>
                  {userProfile && notificationsEnabled && (
                    <Text
                      className="text-xs mt-1"
                      style={{
                        color: Colors[colorScheme ?? "light"].text,
                        opacity: 0.6,
                      }}
                    >
                      {userProfile.affirmationFrequency}x daily,{" "}
                      {userProfile.reminderStartHour || 8}:00 -{" "}
                      {userProfile.reminderEndHour || 20}:00
                    </Text>
                  )}
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: "#767577", true: "#3B82F6" }}
                thumbColor={notificationsEnabled ? "#ffffff" : "#f4f3f4"}
                disabled={isCheckingPermissions}
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
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="moon" size={24} color="#3B82F6" />
                <Text
                  className="ml-4 text-lg"
                  style={{
                    color: Colors[colorScheme ?? "light"].text,
                    paddingLeft: 10,
                  }}
                >
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{ false: "#767577", true: "#3B82F6" }}
                thumbColor={isDark ? "#ffffff" : "#f4f3f4"}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/theme")}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Ionicons name="color-palette" size={24} color="#3B82F6" />
                <Text
                  className="ml-4 text-lg"
                  style={{
                    color: Colors[colorScheme ?? "light"].text,
                    paddingLeft: 10,
                  }}
                >
                  Customize Background
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[colorScheme ?? "light"].text}
              />
            </TouchableOpacity>
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
            style={{ color: Colors[colorScheme ?? "light"].text }}
          >
            Interaction
          </Text>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="phone-portrait" size={24} color="#3B82F6" />
                <Text
                  className="ml-4 text-lg"
                  style={{
                    color: Colors[colorScheme ?? "light"].text,
                    paddingLeft: 10,
                  }}
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
            height: 120,
          }}
        ></View>
      </ScrollView>
    </View>
  );
}
