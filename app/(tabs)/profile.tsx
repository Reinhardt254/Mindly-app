import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStatsStore } from "@/stores/statsStore";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SimpleHeader } from "@/components/ModernHeader";
import { Popup } from "@/components/Popup";

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { userProfile, clearAllData } = useLocalStorage();
  const { resetStats } = useStatsStore();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    title: "",
    message: "",
    buttons: [] as {
      text: string;
      onPress: () => void;
      style?: "default" | "destructive" | "cancel";
    }[],
  });

  const showPopup = (
    title: string,
    message: string,
    buttons: {
      text: string;
      onPress: () => void;
      style?: "default" | "destructive" | "cancel";
    }[]
  ) => {
    setPopupConfig({ title, message, buttons });
    setIsPopupVisible(true);
  };

  const handleLogout = () => {
    showPopup(
      "Logout",
      "Are you sure you want to logout? All your data will be cleared.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all data
              await clearAllData();

              // Reset stats
              resetStats();

              // Navigate to welcome screen
              router.replace("/welcome");
            } catch (error) {
              console.error("Error during logout:", error);
              showPopup("Error", "Failed to logout. Please try again.", [
                { text: "OK", onPress: () => {} },
              ]);
            }
          },
        },
      ]
    );
  };

  if (!userProfile) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-900">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: Colors[colorScheme ?? "light"].background }}
    >
      {/* Simple Header */}
      <SimpleHeader title="Profile" />

      <ScrollView className="flex-1 px-4">
        {/* Profile Info */}
        <View
          className="p-6 mb-0 rounded-lg"
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 10,
            borderStyle: "solid",
            paddingVertical: 30,
            paddingHorizontal: 10,
            paddingBottom: 10,
            height: "auto",
            margin: 0,
            marginTop: 0,
            boxShadow:
              colorScheme === "dark"
                ? "0 0 2px 0 rgba(255, 255, 255, 0.05)"
                : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <View className="items-center h-auto mt-20 mb-8">
            <View
              className="items-center justify-center w-24 h-24 mb-4 rounded-full"
              style={{
                marginBottom: 10,
                height: 120,
                width: 120,
                borderRadius: 100,
                backgroundColor: Colors[colorScheme ?? "light"].highlight,
              }}
            >
              <Ionicons name="person" size={48} color="white" />
            </View>
            <Text
              className="pt-5 text-xl font-bold"
              style={{ color: Colors[colorScheme ?? "light"].text }}
            >
              {userProfile.name}
            </Text>
            <Text className="mt-2 text-gray-400 text-md">
              Member since today
            </Text>
          </View>

          <View
            style={{
              borderRadius: 10,
              padding: 25,
              paddingHorizontal: 15,
              boxShadow:
                colorScheme === "dark"
                  ? "0 0 2px 0 rgba(255, 255, 255, 0.055)"
                  : "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <Text
              className="mb-2 text-xl font-semibold"
              style={{ color: Colors[colorScheme ?? "light"].text }}
            >
              Profile Information
            </Text>

            <View
              className="flex flex-col items-center justify-center w-full h-auto gap-10 space-y-4"
              style={{
                width: "100%",
                gap: 5,
                marginTop: 10,
              }}
            >
              <View className="flex-row items-center justify-between w-full my-10">
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  Age Range
                </Text>
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  {userProfile.ageRange}
                </Text>
              </View>

              <View className="flex-row items-center justify-between w-full">
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  Gender
                </Text>
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  {userProfile.gender}
                </Text>
              </View>

              <View className="flex-row items-center justify-between w-full">
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  Daily Affirmations
                </Text>
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  {userProfile.affirmationFrequency} times
                </Text>
              </View>

              <View className="flex-row items-center justify-between w-full">
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  Reminder Hours
                </Text>
                <Text
                  className="text-xl"
                  style={{ color: Colors[colorScheme ?? "light"].text }}
                >
                  {userProfile.reminderStartHour || 8}:00 -{" "}
                  {userProfile.reminderEndHour || 20}:00
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View
          className="space-y-4"
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderWidth: 0,
            borderColor: Colors[colorScheme ?? "light"].tabIconSelected,
            borderRadius: 0,
            borderStyle: "solid",
            paddingVertical: 20,
            paddingHorizontal: 10,
            margin: 0,
            marginTop: 0,
            boxShadow: "none",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            width: "100%",
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/edit-profile")}
            className="flex-row items-center w-full p-4 rounded-lg"
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
          >
            <Ionicons
              name="person"
              size={24}
              color={Colors[colorScheme ?? "light"].highlight}
            />
            <Text
              className="ml-4 text-lg"
              style={{
                marginLeft: 10,
                color: Colors[colorScheme ?? "light"].text,
              }}
            >
              Edit Profile
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#6B7280"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center w-full p-4 rounded-lg"
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
          >
            <Ionicons
              name="notifications"
              size={24}
              color={Colors[colorScheme ?? "light"].highlight}
            />
            <Text
              className="ml-4 text-lg"
              style={{
                marginLeft: 10,
                color: Colors[colorScheme ?? "light"].text,
              }}
            >
              Notifications
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#6B7280"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center w-full p-4 rounded-lg"
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
          >
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={Colors[colorScheme ?? "light"].highlight}
            />
            <Text
              className="ml-4 text-lg"
              style={{
                marginLeft: 10,
                color: Colors[colorScheme ?? "light"].text,
              }}
            >
              Privacy
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#6B7280"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center p-4 !bg-red-600 rounded-lg w-full"
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
          >
            <Ionicons name="log-out" size={24} color="red" />
            <Text
              className="ml-4 text-lg"
              style={{
                marginLeft: 10,
                color: Colors[colorScheme ?? "light"].text,
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Popup */}
      <Popup
        visible={isPopupVisible}
        title={popupConfig.title}
        message={popupConfig.message}
        buttons={popupConfig.buttons}
        onClose={() => setIsPopupVisible(false)}
      />
    </View>
  );
}
